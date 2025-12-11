package handlers

import (
	"context"
	"errors"
	"expenses/db"
	"expenses/logx"
	"fmt"

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
		c.JSON(400, map[string]string{"error": err.Error()})
	}

	transactionList, err := db.GetTransactionList(supabaseUser)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": err.Error()})
		return
	}
	c.JSON(200, GetTransactionResponse{
		ID:              supabaseUser.ID,
		Name:            supabaseUser.Name,
		TransactionList: transactionList,
	})
}

func PostTransactionHandler(ctx context.Context, c *app.RequestContext) {
	supabaseUser, err := getSupabaseUserFromContext(c)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": err.Error()})
	}

	var tx db.Transaction
	if err := c.BindJSON(&tx); err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": err.Error()})
		return
	}
	tx.UserId = supabaseUser.ID
	fmt.Println("transaction is: ", tx)

	txDeets, err := db.PostTransaction(supabaseUser, tx)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": err.Error()})
		return
	}
	c.JSON(200, PostTransactionResponse{
		Message:            "transaction added successfully",
		TransactionDetails: *txDeets,
	})
}

func PutTransactionHandler(ctx context.Context, c *app.RequestContext) {
	supabaseUser, err := getSupabaseUserFromContext(c)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": err.Error()})
	}

	var tx db.Transaction
	if err := c.BindJSON(&tx); err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": err.Error()})
		return
	}

	txDeets, err := db.PutTransaction(supabaseUser, tx)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": fmt.Sprintf("could not modify transaction: %s", err.Error())})
		return
	}
	c.JSON(200, PostTransactionResponse{
		Message:            "transaction modified successfully",
		TransactionDetails: *txDeets,
	})
}

func DeleteTransactionHandler(ctx context.Context, c *app.RequestContext) {
	supabaseUser, err := getSupabaseUserFromContext(c)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": err.Error()})
	}

	var tx db.Transaction
	if err := c.BindJSON(&tx); err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": err.Error()})
		return
	}

	txDeets, err := db.DeleteTransaction(supabaseUser, tx)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": fmt.Sprintf("could not delete transaction: %s", err.Error())})
		return
	}
	c.JSON(200, PostTransactionResponse{
		Message:            "transaction deleted successfully",
		TransactionDetails: *txDeets,
	})
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
