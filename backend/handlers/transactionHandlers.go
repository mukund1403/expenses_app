package handlers

import (
	"context"
	"errors"
	"expenses/db"
	"expenses/logx"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/golang-jwt/jwt/v5"
)

type GetTransactionResponse struct {
	ID              string           `json:"user_id"`
	Name            string           `json:"username"`
	TransactionList []db.Transaction `json:"transaction_list"`
}

type PostTransactionResponse struct {
	Message            string         `json:"message"`
	TransactionDetails db.Transaction `json:"transaction_details"`
}

func GetTransactionListHandler(ctx context.Context, c *app.RequestContext) {
	supabaseUser, err := getSupabaseUserFromContext(c)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": "error retrieving user details"})
	}

	transactionList, err := db.GetTransactionList(supabaseUser)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": "could not retrieve transaction list"})
		return
	}
	c.JSON(200, GetTransactionResponse{
		ID:              supabaseUser.ID,
		Name:            supabaseUser.Name,
		TransactionList: transactionList,
	})
}

func PostTransactionHandler(ctx context.Context, c *app.RequestContext) {
	var tx db.Transaction
	if err := c.BindJSON(&tx); err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": "JSON in body is corrupted"})
		return
	}
	txDeets, err := db.PostTransaction(tx)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": "could not add new transaction"})
	}
	c.JSON(200, PostTransactionResponse{
		TransactionDetails: txDeets,
	})
}

func PutTransactionHandler(ctx context.Context, c *app.RequestContext) {

}

func getSupabaseUserFromContext(c *app.RequestContext) (*db.SupabaseUser, error) {
	raw, _ := c.Get("user")
	claims, ok := raw.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("error retrieving user details")
	}
	supabaseUser := db.SupabaseUser{
		ID:    claims["sub"].(string),
		Email: claims["email"].(string),
		Name:  claims["name"].(string),
	}
	return &supabaseUser, nil
}
