package handlers

import (
	"context"
	"expenses/db"
	"expenses/logx"
	"expenses/models"

	"github.com/cloudwego/hertz/pkg/app"
)

type GetTransactionResponse struct {
	TransactionList []models.Transaction `json:"transaction_list"`
}

type SingleTransactionResponse struct {
	Message            string             `json:"message"`
	TransactionDetails models.Transaction `json:"transaction_details"`
}

func GetTransactionListHandler(ctx context.Context, c *app.RequestContext) {
	userID, err := GetSupabaseUserIdFromContext(c)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": "Transaction list is currently unavailable."})
	}

	transactionList, err := db.GetTransactionList(userID)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": "Transaction list is currently unavailable."})
		return
	}
	c.JSON(200, GetTransactionResponse{
		TransactionList: transactionList,
	})
}

func PostTransactionHandler(ctx context.Context, c *app.RequestContext) {
	userID, err := GetSupabaseUserIdFromContext(c)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": "Failed to create new Transaction. Please try again later."})
	}

	var tx models.Transaction
	if err := c.BindJSON(&tx); err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": "Failed to create new Transaction. Please try again later."})
		return
	}
	tx.UserId = userID

	txDeets, err := db.PostTransaction(tx)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{
			"error": "Failed to create new Transaction: This could be because (1)transaction already exists (2)there is an issue with the backend.",
		})
		return
	}
	c.JSON(200, SingleTransactionResponse{
		Message:            "Transaction added successfully",
		TransactionDetails: *txDeets,
	})
}

func PutTransactionHandler(ctx context.Context, c *app.RequestContext) {
	var tx models.Transaction
	if err := c.BindJSON(&tx); err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": "Failed to modify Transaction. Please try again later."})
		return
	}

	txDeets, err := db.PutTransaction(tx)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": "Failed to modify Transaction. Please try again later."})
		return
	}
	c.JSON(200, SingleTransactionResponse{
		Message:            "transaction modified successfully",
		TransactionDetails: *txDeets,
	})
}

func DeleteTransactionHandler(ctx context.Context, c *app.RequestContext) {
	var tx models.Transaction
	if err := c.BindJSON(&tx); err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": "Failed to delete Transaction. Please try again later."})
		return
	}

	txDeets, err := db.DeleteTransaction(tx)
	if err != nil {
		logx.Logger.Error(err.Error())
		c.JSON(400, map[string]string{"error": "Failed to delete Transaction. Please try again later."})
		return
	}
	c.JSON(200, SingleTransactionResponse{
		Message:            "transaction deleted successfully",
		TransactionDetails: *txDeets,
	})
}
