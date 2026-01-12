package main

import (
	"context"
	"expenses/logx"
	"os"
	"strings"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		authHeaderBytes := c.GetHeader("Authorization")
		authHeader := string(authHeaderBytes)
		if authHeader == "" {
			// no cookie → redirect to login
			c.JSON(401, map[string]string{"error": "missing authorization header"})
			c.Abort()
			return
		}

		const bearerPrefix = "Bearer "
		if !strings.HasPrefix(authHeader, bearerPrefix) {
			c.JSON(401, map[string]string{"error": "invalid authorization header format"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, bearerPrefix)

		secret := []byte(os.Getenv("JWT_SECRET"))

		// Parse takes the token string and a function for looking up the key. The latter is especially
		// useful if you use multiple keys for your application.  The standard is to use 'kid' in the
		// head of the token to identify which key to use, but the parsed token (head and claims) is provided
		// to the callback, providing flexibility.
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
			// hmacSampleSecret is a []byte containing your secret, e.g. []byte("my_secret_key")
			return secret, nil
		}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))
		if err != nil {
			logx.Logger.Error(err.Error())
			c.JSON(401, map[string]string{"error": "invalid or expired token"})
			c.Abort()
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Set("user", claims)
		} else {
			logx.Logger.Error("token invalid")
			c.JSON(401, map[string]string{"error": "invalid token claims"})
			c.Abort()
			return
		}
	}
}
