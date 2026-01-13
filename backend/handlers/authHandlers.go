package handlers

import (
	"context"
	"crypto/rand"
	"encoding/base64"
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
	"github.com/dgraph-io/ristretto"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type OneTimeJWT struct {
	JWTString string `json:"jwt"`
	IsUserNew bool   `json:"is_user_new"`
}

var otpCache *ristretto.Cache

func InitOTPCache(c *ristretto.Cache) {
	otpCache = c
}

func RegisterHandler(ctx context.Context, c *app.RequestContext) {
	c.JSON(200, map[string]string{
		"message":     "login successful",
		"resendEmail": os.Getenv("RESEND_EMAIL_DOMAIN"),
	})
}

func OauthHandler(ctx context.Context, c *app.RequestContext) {
	redirectURL := os.Getenv("REDIRECT_URL_PROD")
	clientId := os.Getenv("OAUTH_CLIENT_ID_PROD")
	clientSecret := os.Getenv("OAUTH_CLIENT_SECRET_PROD")
	env := os.Getenv("APP_ENV")
	if env == "dev" {
		redirectURL = os.Getenv("REDIRECT_URL_DEV")
		clientId = os.Getenv("OAUTH_CLIENT_ID_DEV")
		clientSecret = os.Getenv("OAUTH_CLIENT_SECRET_DEV")
	}

	conf := &oauth2.Config{
		ClientID:     clientId,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Scopes:       []string{"openid", "email", "profile"},
		Endpoint:     google.Endpoint,
	}
	// Redirect user to Google's consent page to ask for permission
	// for the scopes specified above.
	url := conf.AuthCodeURL("state")
	c.Redirect(http.StatusFound, []byte(url))

}

func OauthCallbackHandler(ctx context.Context, c *app.RequestContext) {
	redirectURL := os.Getenv("REDIRECT_URL_PROD")
	clientId := os.Getenv("OAUTH_CLIENT_ID_PROD")
	clientSecret := os.Getenv("OAUTH_CLIENT_SECRET_PROD")
	env := os.Getenv("APP_ENV")
	if env == "dev" {
		redirectURL = os.Getenv("REDIRECT_URL_DEV")
		clientId = os.Getenv("OAUTH_CLIENT_ID_DEV")
		clientSecret = os.Getenv("OAUTH_CLIENT_SECRET_DEV")
	}
	conf := &oauth2.Config{
		ClientID:     clientId,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Scopes:       []string{"openid", "email", "profile"},
		Endpoint:     google.Endpoint,
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	code := c.Query("code")
	if code == "" {
		logx.Logger.Error("missing Oauth code")
		c.Redirect(302, []byte(frontendURL+"/login?error=oauth_failed"))
		return
	}

	// Need to verify state for prod

	tok, err := conf.Exchange(ctx, code)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.Redirect(302, []byte(frontendURL+"/login?error=oauth_failed"))
		return
	}

	client := conf.Client(ctx, tok)
	userInfo, err := fetchGoogleUserInfo(client)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.Redirect(302, []byte(frontendURL+"/login?error=oauth_failed"))
		return
	}
	email, ok := userInfo["email"]
	if !ok {
		c.Redirect(302, []byte(frontendURL+"/login?error=oauth_failed"))
		return
	}
	info := map[string]interface{}{
		"email": email,
	}

	user, err := db.GetSupabaseUser(ctx, info) // using info here because we only want to pass in email
	isUserNew := false
	if err != nil {
		logx.Logger.Info("user does not exist. Creating...")
		user, err = db.CreateSupabaseUser(ctx, userInfo)
		if err != nil {
			logx.Logger.Error(fmt.Sprintf("error: unable to add user to supabase: %s", err.Error()))
			c.Redirect(302, []byte(frontendURL+"/login?error=oauth_failed"))
		}
		isUserNew = true
	} else {
		logx.Logger.Info("user already exists")
	}

	jwtStr, err := createAppJWT(user)
	if err != nil {
		logx.Logger.Error(fmt.Sprintf("error: unable to create JWT: %s", err.Error()))
		c.Redirect(302, []byte(frontendURL+"/login?error=login_failed"))
		return
	}

	oneTimeCode, err := generateOTP()
	if err != nil {
		logx.Logger.Error(err.Error())
		c.Redirect(302, []byte(frontendURL+"/login?error=login_failed"))
	}

	oneTimeJWT := OneTimeJWT{
		JWTString: jwtStr,
		IsUserNew: isUserNew,
	}

	otpCache.SetWithTTL(oneTimeCode, oneTimeJWT, 1, time.Minute)

	successRedirectURL := fmt.Sprintf("%s/auth?code=%s", frontendURL, oneTimeCode)
	c.Redirect(302, []byte(successRedirectURL))
}

func JWTHandler(ctx context.Context, c *app.RequestContext) {
	logx.Logger.Info("reached jwt handler")
	var body map[string]string
	if err := c.BindJSON(&body); err != nil {
		logx.Logger.Error(fmt.Sprintf("invalid request body: %s", err.Error()))
		c.JSON(400, map[string]string{"error": "invalid request body"})
		return
	}

	oneTimeCode, ok := body["code"]
	if !ok || oneTimeCode == "" {
		logx.Logger.Error("missing code")
		c.JSON(400, map[string]string{"error": "missing code"})
		return
	}

	oneTimeJWT, ok := otpCache.Get(oneTimeCode)
	if !ok {
		logx.Logger.Error("cannot find jwt")
		c.JSON(400, map[string]string{"error": "code expired need to relogin"})
		return
	}

	otpCache.Del(oneTimeCode)

	logx.Logger.Info("jwt token sent to frontend")
	c.JSON(200, oneTimeJWT)

}

// deprecate?? since frontend should handle
func LogoutHandler(ctx context.Context, c *app.RequestContext) {
	env := os.Getenv("APP_ENV")
	secure := true
	if env == "dev" {
		secure = false
	}

	c.SetCookie(
		"token",                         // name
		"",                              // value
		-1,                              // maxAge in seconds
		"/",                             // path
		"",                              // domain (empty = current domain)
		protocol.CookieSameSiteNoneMode, // sameSite lax
		secure,                          // secure (true in prod with HTTPS)
		true,                            // httpOnly
	)
	frontend := os.Getenv("FRONTEND_URL")
	if frontend == "" {
		logx.Logger.Panic("no frontend url")
		return
	}
	logx.Logger.Info("user logged out successfully")
	c.Redirect(302, []byte(frontend+"/login"))
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
		"iat":   now.Unix(),
		"exp":   now.Add(24 * time.Hour).Unix(), // 24h expiry
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func generateOTP() (string, error) {
	b := make([]byte, 24)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}

	return base64.RawURLEncoding.EncodeToString(b), nil
}
