package main

import (
	"context"
	"expenses/logx"
	"os"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		cookie := c.Cookie("token") // "token" is the cookie name we set
		frontend := os.Getenv("FRONTEND_URL")
		if len(cookie) == 0 {
			// no cookie → redirect to login
			c.Redirect(302, []byte(frontend+"/login"))
			c.Abort()
			return
		}
		cookieString := string(cookie)
		secret := []byte(os.Getenv("JWT_SECRET"))

		// Parse takes the token string and a function for looking up the key. The latter is especially
		// useful if you use multiple keys for your application.  The standard is to use 'kid' in the
		// head of the token to identify which key to use, but the parsed token (head and claims) is provided
		// to the callback, providing flexibility.
		token, err := jwt.Parse(cookieString, func(token *jwt.Token) (any, error) {
			// hmacSampleSecret is a []byte containing your secret, e.g. []byte("my_secret_key")
			return secret, nil
		}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))
		if err != nil {
			logx.Logger.Error(err.Error())
			c.Redirect(302, []byte(frontend+"/login"))
			c.Abort()
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Set("user", claims)
			logx.Logger.Debug("token valid")
		} else {
			logx.Logger.Error("token invalid")
			c.Redirect(302, []byte(frontend+"/login"))
			c.Abort()
			return
		}
	}
}
