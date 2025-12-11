package models

type EmailReceivedEvent struct {
	Type      string            `json:"type"`
	CreatedAt string            `json:"created_at"`
	Data      EmailReceivedData `json:"data"`
}

type EmailReceivedData struct {
	EmailID     string            `json:"email_id"`
	CreatedAt   string            `json:"created_at"`
	From        string            `json:"from"`
	To          []string          `json:"to"`
	BCC         []string          `json:"bcc"`
	CC          []string          `json:"cc"`
	MessageID   string            `json:"message_id"`
	Subject     string            `json:"subject"`
	Attachments []EmailAttachment `json:"attachments"`
}

type EmailAttachment struct {
	ID                 string `json:"id"`
	Filename           string `json:"filename"`
	ContentType        string `json:"content_type"`
	ContentDisposition string `json:"content_disposition"`
	ContentID          string `json:"content_id"`
}
