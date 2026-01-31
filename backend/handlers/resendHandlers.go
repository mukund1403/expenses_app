package handlers

import (
	"context"
	"encoding/json"
	"expenses/db"
	"expenses/logx"
	"expenses/models"
	"expenses/openrouter"
	"fmt"
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

	transaction, err := parseEmailBody(*emailBody)
	if err != nil {
		logx.Logger.Error(err.Error())
		if err.Error() == "email is not a transaction" {
			logx.Logger.Info("USER IS PROBABLY AUTO FORWARDING ALL EMAILS")
			err := handleNonTransactionEmail(emailBody.Text, *supabaseUser)
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

func handleNonTransactionEmail(emailContent string, user db.SupabaseUser) error {
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
