package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"expenses/db"
	"expenses/logx"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/cloudwego/hertz/pkg/protocol"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

func RegisterHandler(ctx context.Context, c *app.RequestContext) {
	c.JSON(200, map[string]string{
		"message":     "login successful",
		"resendEmail": os.Getenv("RESEND_EMAIL_DOMAIN"),
	})
}

func OauthHandler(ctx context.Context, c *app.RequestContext) {
	conf := &oauth2.Config{
		ClientID:     os.Getenv("OAUTH_CLIENT_ID"),
		ClientSecret: os.Getenv("OAUTH_CLIENT_SECRET"),
		RedirectURL:  "http://localhost:8080/auth/callback",
		Scopes:       []string{"openid", "email", "profile"},
		Endpoint:     google.Endpoint,
	}
	// Redirect user to Google's consent page to ask for permission
	// for the scopes specified above.
	url := conf.AuthCodeURL("state")
	c.Redirect(http.StatusFound, []byte(url))

}

func OauthCallbackHandler(ctx context.Context, c *app.RequestContext) {
	conf := &oauth2.Config{
		ClientID:     os.Getenv("OAUTH_CLIENT_ID"),
		ClientSecret: os.Getenv("OAUTH_CLIENT_SECRET"),
		RedirectURL:  "http://localhost:8080/auth/callback",
		Scopes:       []string{"openid", "email", "profile"},
		Endpoint:     google.Endpoint,
	}
	code := c.Query("code")
	if code == "" {
		logx.Logger.Error("missing Oauth code")
		c.JSON(400, map[string]string{
			"error": "missing oauth code",
		})
		return
	}

	// Need to verify state for prod

	tok, err := conf.Exchange(ctx, code)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(500, map[string]string{"error": "token exchange failed"})
		return
	}

	client := conf.Client(ctx, tok)
	userInfo, err := fetchGoogleUserInfo(client)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(500, map[string]string{"error": "failed to fetch user info"})
		return
	}

	user, err := db.GetSupabaseUser(ctx, userInfo)
	if err != nil {
		logx.Logger.Info("user does not exist. Creating...")
		user, err = db.CreateSupabaseUser(ctx, userInfo)
		if err != nil {
			logx.Logger.Error(err.Error())
			c.JSON(500, map[string]string{"error": "unable to add user to supabase"})
		}
	} else {
		logx.Logger.Info("user already exists")
	}

	jwtStr, err := createAppJWT(user)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(500, map[string]string{"error": "failed to create jwt", "detail": err.Error()})
		return
	}

	env := os.Getenv("APP_ENV")
	secure := true
	if env == "dev" {
		secure = false
	}
	maxAge := 24 * 60 * 60 // 1 day
	c.SetCookie(
		"token",                        // name
		jwtStr,                         // value
		maxAge,                         // maxAge in seconds
		"/",                            // path
		"",                             // domain (empty = current domain)
		protocol.CookieSameSiteLaxMode, // sameSite lax
		secure,                         // secure (true in prod with HTTPS)
		true,                           // httpOnly
	)

	// 8) Redirect back to frontend (optional: include a short-lived state or deep link)
	frontend := os.Getenv("FRONTEND_URL")
	if frontend == "" {
		logx.Logger.Panic("no frontend url")
		return
	}
	logx.Logger.Info(fmt.Sprintf("user:%s, %s logged in successfully", user.Name, user.Email))
	c.Redirect(302, []byte(frontend+"/home"))
}

// fetchGoogleUserInfo calls Google userinfo endpoint and returns minimal info
func fetchGoogleUserInfo(client *http.Client) (map[string]interface{}, error) {
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("userinfo error: %s", string(body))
	}
	var info map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&info); err != nil {
		return nil, err
	}
	return info, nil
}

func createAppJWT(user *db.SupabaseUser) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", errors.New("JWT_SECRET not set")
	}
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":   user.ID,
		"email": user.Email,
		"name":  user.Name,
		"iat":   now.Unix(),
		"exp":   now.Add(24 * time.Hour).Unix(), // 24h expiry
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
