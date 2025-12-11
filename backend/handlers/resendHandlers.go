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
		return
	}

	emailBody, err := getEmailBody(emailMetadata.Data.EmailID)
	if err != nil {
		logx.Logger.Error(err.Error())
		return
	}

	username := strings.Split(emailBody.To[0], "@")[0]
	info := map[string]interface{}{
		"username": username,
	}

	supabaseUser, err := db.GetSupabaseUser(ctx, info)
	if err != nil {
		logx.Logger.Error(err.Error())
		return
	}

	transaction, err := parseEmailBody(*emailBody)
	if err != nil {
		logx.Logger.Error(err.Error())
		return
	}
	transaction.UserId = supabaseUser.ID
	//fmt.Println(transaction.UserId, transaction.Account, transaction.Amount, transaction.DateTime, transaction.Category, transaction.Merchant)
	_, err = db.PostTransaction(supabaseUser, *transaction)
	if err != nil {
		logx.Logger.Error(err.Error())
		return
	}

	logx.Logger.Info("transaction sucessfully updated")
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
	// bank := detectBank(fromEmail)

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
	fmt.Println("json string is: ", jsonStr)
	var tx models.Transaction
	if err := json.Unmarshal([]byte(jsonStr), &tx); err != nil {
		logx.Logger.Debug("error in json unmarshal")
		return nil, err
	}

	return &tx, nil

	// switch bank {
	// case "dbs":
	// 	return parseDBSEmail(body)
	// case "ocbc":
	// 	return parseOCBCEmail(body)
	// default:
	// 	return openrouter.ExtractUnknownBankTransaction(body)
	// }
}

// func detectBank(email string) string {
// 	from := strings.ToLower(email)

// 	switch {
// 	case strings.Contains(from, "dbs.com"):
// 		return "dbs"
// 	case strings.Contains(from, "ocbc.com"):
// 		return "ocbc"
// 	default:
// 		return "unknown"
// 	}
// }

// var (
// 	dbsFromRegex     = regexp.MustCompile(`From:\s*(.+?)\s*\(`)
// 	dbsDateTimeRegex = regexp.MustCompile(`Date\s*&\s*Time:\s*([0-9]{1,2} [A-Za-z]{3}) (\d{2}:\d{2})`)
// 	dbsAmountRegex   = regexp.MustCompile(`Amount:\s*SGD([\d.]+)`)
// 	dbsToRegex       = regexp.MustCompile(`To:\s*(.+)`)
// )

// func parseDBSEmail(body string) (*models.Transaction, error) {
// 	tx := &models.Transaction{}

// 	// Amount
// 	if m := dbsAmountRegex.FindStringSubmatch(body); len(m) == 2 {
// 		amt, _ := strconv.ParseFloat(m[1], 64)
// 		tx.Amount = amt
// 		fmt.Println("AMount: ", tx.Amount)
// 	}

// 	// Merchant ("To:")
// 	if m := dbsToRegex.FindStringSubmatch(body); len(m) == 2 {
// 		tx.Merchant = strings.TrimSpace(m[1])
// 		fmt.Println("merchant: ", tx.Merchant)
// 	}

// 	// Date & Time
// 	if m := dbsDateTimeRegex.FindStringSubmatch(body); len(m) == 3 {
// 		dateStr := fmt.Sprintf("%s %s 2025", m[1], m[2])
// 		t, err := time.Parse("02 Jan 15:04 2006", dateStr)
// 		if err == nil {
// 			tx.DateTime = t
// 		}
// 		fmt.Println("AMount: ", tx.Amount)
// 	}

// 	// Account (From line)
// 	if m := dbsFromRegex.FindStringSubmatch(body); len(m) == 2 {
// 		tx.Account = strings.TrimSpace(m[1])
// 		fmt.Println("Account: ", tx.Account)
// 	}

// 	tx.Category = "Unknown"

// 	return tx, nil
// }

// var (
// 	ocbcDateRegex     = regexp.MustCompile(`Date\s*:?\s*([0-9]{2} [A-Za-z]{3} [0-9]{4})`)
// 	ocbcTimeRegex     = regexp.MustCompile(`Time\s*:?\s*([0-9]{2}:[0-9]{2})`)
// 	ocbcAmountRegex   = regexp.MustCompile(`Amount\s*:?\s*SGD\s*([\d.]+)`)
// 	ocbcMerchantRegex = regexp.MustCompile(`transfer has been made to\s*(.+?)\s*using`)
// 	ocbcAccountRegex  = regexp.MustCompile(`From your account\s*:?\s*(.+)`)
// )

// func parseOCBCEmail(body string) (*models.Transaction, error) {
// 	tx := &models.Transaction{}

// 	// Amount
// 	if m := ocbcAmountRegex.FindStringSubmatch(body); len(m) == 2 {
// 		amt, _ := strconv.ParseFloat(m[1], 64)
// 		tx.Amount = amt
// 	}

// 	// Merchant
// 	if m := ocbcMerchantRegex.FindStringSubmatch(body); len(m) == 2 {
// 		tx.Merchant = strings.TrimSpace(m[1])
// 	}

// 	// Account
// 	if m := ocbcAccountRegex.FindStringSubmatch(body); len(m) == 2 {
// 		tx.Account = strings.TrimSpace(m[1])
// 	}

// 	// Date + Time
// 	var t time.Time
// 	var dt string

// 	dateMatch := ocbcDateRegex.FindStringSubmatch(body)
// 	timeMatch := ocbcTimeRegex.FindStringSubmatch(body)

// 	if len(dateMatch) == 2 && len(timeMatch) == 2 {
// 		dt = dateMatch[1] + " " + timeMatch[1]
// 		parsed, err := time.Parse("02 Jan 2006 15:04", dt)
// 		if err == nil {
// 			t = parsed
// 		}
// 	}

// 	tx.DateTime = t
// 	tx.Category = "Unknown"

// 	return tx, nil
// }
