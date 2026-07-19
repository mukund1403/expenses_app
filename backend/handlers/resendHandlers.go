package handlers

import (
	"context"
	"encoding/json"
	"expenses/db"
	"expenses/logx"
	"expenses/models"
	"expenses/openrouter"
	"fmt"
	"html"
	"io"
	"net/http"
	"os"
	"regexp"
	"strings"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/jaytaylor/html2text"
	"github.com/resend/resend-go/v3"
	svix "github.com/svix/svix-webhooks/go"
)

func PostWebhookHandler(ctx context.Context, c *app.RequestContext) {
	wh, err := svix.NewWebhook(os.Getenv("SVIX_WEBHOOK_SECRET"))
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": err.Error()})
		return
	}

	headers := http.Header{}
	headers.Add("svix-id", string(c.Request.Header.Peek("svix-id")))
	headers.Add("svix-signature", string(c.Request.Header.Peek("svix-signature")))
	headers.Add("svix-timestamp", string(c.Request.Header.Peek("svix-timestamp")))

	requestBody := c.Request.Body()

	err = wh.Verify(requestBody, headers)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": err.Error()})
		return
	}

	var emailMetadata models.EmailReceivedEvent

	if err := json.Unmarshal(requestBody, &emailMetadata); err != nil {
		logx.Logger.Error(fmt.Sprintf("failed to decode webhook: %s", err.Error()))
		c.JSON(400, map[string]string{"error": err.Error()})
		return
	}

	if projectName, matched := extractSupabaseProjectName(emailMetadata.Data.Subject); matched {
		logx.Logger.Info(fmt.Sprintf("detected Supabase pause notification for project %q, attempting to resume", projectName))
		if err := resumeSupabaseProject(projectName); err != nil {
			logx.Logger.Error(fmt.Sprintf("failed to resume supabase project: %s", err.Error()))
			c.JSON(500, map[string]string{"error": err.Error()})
			return
		}
		logx.Logger.Info("supabase project resume triggered successfully")
		c.JSON(200, map[string]string{"message": "supabase project resume triggered successfully"})
		return
	}

	emailBody, err := getEmailBody(emailMetadata.Data.EmailID)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": err.Error()})
		return
	}

	username := strings.Split(emailBody.To[0], "@")[0]
	info := map[string]interface{}{
		"username": username,
	}

	if emailMetadata.Data.From == "forwarding-noreply@google.com" {
		activationLink, err := getActivationLink(*emailBody)
		if err != nil {
			logx.Logger.Error(err.Error())
			c.JSON(400, map[string]string{"error": err.Error()})
			return
		}
		modifiedFields := db.SupabaseUser{
			ActivationLink: activationLink,
		}
		_, err = db.PutSupabaseUser(ctx, info, &modifiedFields)
		if err != nil {
			logx.Logger.Error(err.Error())
			c.JSON(400, map[string]string{"error": err.Error()})
			return
		}
		logx.Logger.Info("added activation link successfully")
		c.JSON(200, map[string]string{"message": "added activation link successfully"})
		return
	}

	supabaseUser, err := db.GetSupabaseUser(ctx, info)
	if err != nil {
		logx.Logger.Error(err.Error())
		return
	}

	if supabaseUser.NonTxEmails >= 3 {
		logx.Logger.Info("USER IS AUTO FORWARDING ALL EMAILS (found >= 3 non tx)")
		return
	}

	transaction, err := parseEmailBody(*emailBody)
	if err != nil {
		logx.Logger.Error(err.Error())
		if err.Error() == "email is not a transaction" {
			logx.Logger.Info("USER IS PROBABLY AUTO FORWARDING ALL EMAILS")
			err := handleNonTransactionEmail(ctx, emailBody.Text, *supabaseUser)
			if err != nil {
				logx.Logger.Sugar().Errorf("error sending out email to user: %s", err.Error())
			}
			return
		}

		failedEmailBody, err := db.PostFailEmail(*emailBody, supabaseUser.ID)
		if err != nil {
			logx.Logger.Sugar().Errorf("error: %s", err.Error())
			return
		}
		logx.Logger.Info(failedEmailBody.Id)
		return
	}
	transaction.UserId = supabaseUser.ID
	_, err = db.PostTransaction(*transaction)
	if err != nil {
		logx.Logger.Error(err.Error())
		return
	}

	logx.Logger.Info("transaction sucessfully added")
}

func getEmailBody(emailId string) (*resend.ReceivedEmail, error) {
	client := resend.NewClient(os.Getenv("RESEND_API_KEY"))
	email, err := client.Emails.Receiving.GetWithContext(context.TODO(), emailId)
	if err != nil {
		return nil, err
	}
	return email, nil
}

func parseEmailBody(email resend.ReceivedEmail) (*models.Transaction, error) {
	// Prefer plaintext; if empty, extract from HTML
	body := email.Text
	if body == "" && email.Html != "" {
		text, err := html2text.FromString(email.Html, html2text.Options{PrettyTables: false})
		if err != nil {
			return nil, fmt.Errorf("failed to convert HTML to text: %w", err)
		}
		body = text
	}

	jsonStr, err := openrouter.ExtractUnknownBankTransaction(body)
	if err != nil {
		logx.Logger.Debug("error in prompt")
		return nil, err
	}
	var res models.PromptResponse
	if err := json.Unmarshal([]byte(jsonStr), &res); err != nil {
		logx.Logger.Debug("error in json unmarshal")
		return nil, err
	}
	if !res.IsTransaction {
		err := fmt.Errorf("email is not a transaction")
		return nil, err
	}

	tx := res.Transaction

	return &tx, nil
}

func getActivationLink(emailBody resend.ReceivedEmail) (string, error) {
	re := regexp.MustCompile(`https:\/\/mail-settings\.google\.com\/mail\/vf-[^\s]+`)

	body := emailBody.Text
	match := re.FindString(body)
	if match == "" {
		return "", fmt.Errorf("activation link not found")
	}
	return match, nil
}

func handleNonTransactionEmail(ctx context.Context, emailContent string, user db.SupabaseUser) error {
	// client := resend.NewClient(os.Getenv("RESEND_API_KEY"))

	// htmlBody := buildEmailBody(user.Name, user.NonTxEmails, emailContent)

	// params := &resend.SendEmailRequest{
	// 	From:    "AutoEx <autoex@resend.dev>",
	// 	To:      []string{user.Email},
	// 	Subject: "Quick heads-up about non-transaction emails",
	// 	Html:    htmlBody,
	// }

	// _, err := client.Emails.Send(params)
	// if err != nil {
	// 	logx.Logger.Sugar().Errorf("failed to send warning email: %s", err.Error())
	// }

	info := map[string]interface{}{
		"id": user.ID,
	}
	_, err := db.PutSupabaseUser(ctx, info, &db.SupabaseUser{NonTxEmails: user.NonTxEmails + 1})
	if err != nil {
		return err
	}

	return nil
}

var pauseSubjectRegex = regexp.MustCompile(`^Your Supabase Project (.+?) has been paused\.$`)

func extractSupabaseProjectName(subject string) (string, bool) {
	matches := pauseSubjectRegex.FindStringSubmatch(subject)
	if len(matches) < 2 {
		return "", false
	}
	return matches[1], true
}

func resumeSupabaseProject(projectName string) error {
	accessToken := os.Getenv("SUPABASE_ACCESS_TOKEN")
	projectRefsJSON := os.Getenv("SUPABASE_PROJECT_REFS")

	if accessToken == "" || projectRefsJSON == "" {
		return fmt.Errorf("SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REFS not set")
	}

	var projectRefs map[string]string
	if err := json.Unmarshal([]byte(projectRefsJSON), &projectRefs); err != nil {
		return fmt.Errorf("failed to parse SUPABASE_PROJECT_REFS: %w", err)
	}

	projectRef, ok := projectRefs[projectName]
	if !ok {
		return fmt.Errorf("no project ref configured for project name %q", projectName)
	}

	restoreURL := fmt.Sprintf("https://api.supabase.com/v1/projects/%s/restore", projectRef)

	req, err := http.NewRequestWithContext(context.Background(), "POST", restoreURL, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("supabase restore failed: status=%d body=%s", resp.StatusCode, string(body))
	}

	return nil
}

func ClearEmailQueue() error {
	failedEmailList, err := db.GetFailEmailList()
	if err != nil {
		return err
	}

	for _, email := range failedEmailList {
		transaction, err := parseEmailBody(email.ReceivedEmail)
		if err != nil {
			return err
		}

		transaction.UserId = email.UserID
		_, err = db.PostTransaction(*transaction)
		if err != nil {
			return err
		}
		_, err = db.DeleteFailEmail(email.Id)
		if err != nil {
			return err
		}

		logx.Logger.Info("backlog transaction sucessfully added")
	}

	return nil
}

func buildEmailBody(Name string, NonTxEmails int, emailContent string) string {
	return fmt.Sprintf(`
<p>Dear %s,</p>

<p>Quick heads-up 👋</p>

<p>
We received the autoforwarded email shown below, and it looks like some
non-transaction emails are being forwarded to AutoEx as well.
</p>

<p>
This is <strong>non-transaction email #%d</strong> we have received from you so far.
</p>

<p>
To keep things fast, reliable, and (honestly) affordable for us, we limit how many
non-transaction emails we process. Once we receive <strong>3 non-transaction emails</strong>,
autoforwarding will be temporarily blocked for your account.
</p>

<p>
Nothing to worry about — just make sure only transaction-related emails are being forwarded. 
Please check our <strong>Getting Started</strong> guide under settings
to see how to autoforward only transaction related emails and how to check that your filters are working
</p>

<hr />

<p><strong>Copy of the email we received:</strong></p>
<pre>%s</pre>

<p>
If this was your 3rd non transaction email, after ensuring that your filters are setup correctly do contact us at
mukund0503@gmail.com and we will unblock your account.
</p>

<p>
If this was a mistake or you think this email <em>is</em> a transaction,
feel free to email us at mukund0503@gmail.com and we will take a look.
</p>

<p>
Cheers,<br />
<strong>The AutoEx team</strong><br />
</p>
`,
		Name,
		NonTxEmails,
		html.EscapeString(emailContent), // IMPORTANT
	)
}
