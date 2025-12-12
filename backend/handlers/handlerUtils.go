package handlers

import (
	"errors"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/golang-jwt/jwt/v5"
)

func GetSupabaseUserIdFromContext(c *app.RequestContext) (string, error) {
	raw, _ := c.Get("user")
	claims, ok := raw.(jwt.MapClaims)
	if !ok {
		return "", errors.New("error retrieving user details")
	}
	return claims["sub"].(string), nil
}
