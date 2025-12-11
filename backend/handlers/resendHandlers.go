package handlers

import (
	"context"
	"encoding/json"
	"expenses/logx"
	"expenses/models"
	"fmt"
	"net/http"
	"os"

	"github.com/cloudwego/hertz/pkg/app"
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
	fmt.Println("emailbodyfrom: ", emailBody.From)

	// transaction, err := parseEmailBody(*emailBody)
	// if err != nil {
	// 	logx.Logger.Error(err.Error())
	// 	return
	// }
	// info := map[string]interface{}{
	// 	"email": emailBody.Headers["return-path"],
	// }
	// supabaseUser, err := db.GetSupabaseUser(ctx, info)
	// if err != nil {
	// 	logx.Logger.Error(err.Error())
	// 	return
	// }
	// db.PostTransaction(supabaseUser, *transaction)

}

func getEmailBody(emailId string) (*resend.ReceivedEmail, error) {
	client := resend.NewClient(os.Getenv("RESEND_API_KEY"))
	email, err := client.Emails.Receiving.GetWithContext(context.TODO(), emailId)
	if err != nil {
		return nil, err
	}
	return email, nil
}

func parseEmailBody(emailBody resend.ReceivedEmail) (*models.Transaction, error) {
	return nil, nil
}
