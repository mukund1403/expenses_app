package models

import "time"

type Transaction struct {
	TransactionId string    `json:"transaction_id,omitempty"`
	UserId        string    `json:"user_id,omitempty"`
	Merchant      string    `json:"merchant,omitempty"`
	Amount        float64   `json:"amount,omitempty"`
	Currency      string    `json:"currency,omitempty"`
	Account       string    `json:"account,omitempty"`
	Category      string    `json:"category,omitempty"`
	DateTime      time.Time `json:"datetime,omitzero"` // need to use omitzero for structs. omitempty does not work.
}
