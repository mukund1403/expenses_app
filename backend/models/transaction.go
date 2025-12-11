package models

import "time"

type Transaction struct {
	TransactionId string    `json:"transaction_id"`
	UserId        string    `json:"user_id,omitempty"`
	Merchant      string    `json:"merchant,omitempty"`
	Amount        float64   `json:"amount,omitempty"`
	Account       string    `json:"account,omitempty"`
	Category      string    `json:"category,omitempty"`
	DateTime      time.Time `json:"datetime,omitempty"`
}

// This struct is for when user wants to create tx
// We want to send over the info but we should not try to insert transaction_id ourselves (it is auto created by supabase)
type TransactionCreate struct {
	UserId   string    `json:"user_id"`
	Merchant string    `json:"merchant"`
	Amount   float64   `json:"amount"`
	Account  string    `json:"account"`
	Category string    `json:"category"`
	DateTime time.Time `json:"datetime"`
}
