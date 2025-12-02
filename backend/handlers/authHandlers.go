package handlers

import (
	"context"
	"os"

	"github.com/cloudwego/hertz/pkg/app"
)

func RegisterHandler(ctx context.Context, c *app.RequestContext) {
	c.JSON(200, map[string]string{
		"message":     "login successful",
		"resendEmail": os.Getenv("RESEND_EMAIL_DOMAIN"),
	})
}
