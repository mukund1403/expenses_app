package handlers

import (
	"context"
	"expenses/db"
	"expenses/logx"
	"fmt"
	"os"

	"github.com/cloudwego/hertz/pkg/app"
)

type GetUserDetailsResponse struct {
	Name            string `json:"name,omitempty"`
	RegisteredEmail string `json:"registered_email,omitempty"`
	ForwardingEmail string `json:"forwarding_email,omitempty"`
}

func ResendActivationLinkHandler(ctx context.Context, c *app.RequestContext) {
	userID, err := GetSupabaseUserIdFromContext(c)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(500, map[string]string{"error": "internal server error. try again later."})
		return
	}
	info := map[string]interface{}{
		"id": userID,
	}
	supabaseUser, err := db.GetSupabaseUser(ctx, info)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(500, map[string]string{"error": "internal server error. try again later."})
		return
	}

	if supabaseUser.ActivationLink == "" {
		c.JSON(400, map[string]string{"error": "you have not setup auto forwarding yet"})
		return
	}

	c.JSON(200, map[string]string{"activation_link": supabaseUser.ActivationLink})
}

func GetUserDetailsHandler(ctx context.Context, c *app.RequestContext) {
	userID, err := GetSupabaseUserIdFromContext(c)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(500, map[string]string{"error": "internal server error. try again later."})
		return
	}

	info := map[string]interface{}{
		"id": userID,
	}

	supabaseUser, err := db.GetSupabaseUser(ctx, info)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": "error retrieving user details. try again later"})
		return
	}

	forwardingDomain := os.Getenv("RESEND_EMAIL_DOMAIN")
	forwardingEmail := fmt.Sprintf("%s@%s", supabaseUser.Username, forwardingDomain)
	c.JSON(200, GetUserDetailsResponse{
		Name:            supabaseUser.Name,
		RegisteredEmail: supabaseUser.Email,
		ForwardingEmail: forwardingEmail,
	})
}

func PutUserDetailsHandler(ctx context.Context, c *app.RequestContext) {
	userID, err := GetSupabaseUserIdFromContext(c)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(500, map[string]string{"error": "internal server error. try again later."})
		return
	}

	info := map[string]interface{}{
		"id": userID,
	}

	var supabaseUser db.SupabaseUser

	if err := c.BindJSON(&supabaseUser); err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": "failed to modify user details please try again later"})
		return
	}

	if supabaseUser.ID != "" || supabaseUser.Email != "" || supabaseUser.Username != "" || supabaseUser.ActivationLink != "" {
		c.JSON(400, map[string]string{"error": "you attempted to modify fields that cannot be changed"})
		return
	}

	modifiedUser, err := db.PutSupabaseUser(ctx, info, &supabaseUser)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": "error retrieving user details. try again later"})
		return
	}

	c.JSON(200, map[string]string{
		"message": "user details successfully changed",
		"name":    modifiedUser.Name,
	})
}
