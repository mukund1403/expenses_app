package models

type PromptResponse struct {
	IsTransaction bool `json:"is_transaction"`
	Transaction
}
