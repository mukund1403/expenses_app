package db

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"
)

type Transaction struct {
	TransactionId string    `json:"transaction_id"`
	UserId        string    `json:"user_id,omitempty"`
	Merchant      string    `json:"merchant"`
	Amount        float64   `json:"amount"`
	Account       string    `json:"account"`
	Category      string    `json:"category"`
	DateTime      time.Time `json:"datetime"`
}

func GetTransactionList(user *SupabaseUser) ([]Transaction, error) {
	// contact supabase with URL and wait for response
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")
	if supabaseURL == "" || supabaseKey == "" {
		return nil, errors.New("SUPABASE_URL or SUPABASE_KEY not set")
	}

	getURL := fmt.Sprintf("%s/rest/v1/transactions?user_id=eq.%s&select=*", supabaseURL, user.ID)
	req, _ := http.NewRequestWithContext(context.Background(), "GET", getURL, nil)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, errors.New("error from supabase backend")
	}
	var transactionList []Transaction
	if err := json.NewDecoder(resp.Body).Decode(&transactionList); err != nil {
		return nil, err
	}
	return transactionList, nil // found

}

func PostTransaction(transaction Transaction) (Transaction, error) {
	return Transaction{}, nil
}
