package db

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"expenses/models"
	"fmt"
	"io"
	"net/http"
)

func GetTransactionList(userID string) ([]models.Transaction, error) {
	supabaseURL, supabaseKey, err := initSupabaseEnv()
	if err != nil {
		return nil, err
	}

	getURL := fmt.Sprintf("%s/rest/v1/transactions?user_id=eq.%s&select=*", supabaseURL, userID)
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
	var transactionList []models.Transaction
	if err := json.NewDecoder(resp.Body).Decode(&transactionList); err != nil {
		return nil, err
	}
	return transactionList, nil // found

}

func PostTransaction(transaction models.Transaction) (*models.Transaction, error) {
	supabaseURL, supabaseKey, err := initSupabaseEnv()
	if err != nil {
		return nil, err
	}

	createURL := fmt.Sprintf("%s/rest/v1/transactions", supabaseURL)
	if transaction.UserId == "" || transaction.Merchant == "" || transaction.Amount == 0 ||
		transaction.Account == "" || transaction.Category == "" || transaction.DateTime.IsZero() {
		return nil, errors.New("one or more fields are empty")
	}

	payloadBytes, _ := json.Marshal(transaction)

	req2, _ := http.NewRequestWithContext(context.Background(), "POST", createURL, bytes.NewReader(payloadBytes))
	req2.Header.Set("apikey", supabaseKey)
	req2.Header.Set("Authorization", "Bearer "+supabaseKey)
	req2.Header.Set("Content-Type", "application/json")
	// ask supabase to return the inserted row
	req2.Header.Set("Prefer", "return=representation")

	resp2, err := http.DefaultClient.Do(req2)
	if err != nil {
		return nil, err
	}
	defer resp2.Body.Close()

	if resp2.StatusCode < 200 || resp2.StatusCode >= 300 {
		body2, _ := io.ReadAll(resp2.Body)
		return nil, fmt.Errorf("supabase create transaction failed: status=%d body=%s", resp2.StatusCode, string(body2))
	}

	var arr []models.Transaction
	if err := json.NewDecoder(resp2.Body).Decode(&arr); err != nil {
		return nil, err
	}
	if len(arr) <= 0 {
		return nil, errors.New("supabase insert returned no user")
	}
	return &arr[0], nil
}

func PutTransaction(transaction models.Transaction) (*models.Transaction, error) {
	supabaseURL, supabaseKey, err := initSupabaseEnv()
	if err != nil {
		return nil, err
	}
	if transaction.TransactionId == "" {
		return nil, errors.New("no transaction id")
	}

	updateURL := fmt.Sprintf("%s/rest/v1/transactions?transaction_id=eq.%s", supabaseURL, transaction.TransactionId)

	payloadBytes, _ := json.Marshal(transaction)

	req2, _ := http.NewRequestWithContext(context.Background(), "PATCH", updateURL, bytes.NewReader(payloadBytes))
	req2.Header.Set("apikey", supabaseKey)
	req2.Header.Set("Authorization", "Bearer "+supabaseKey)
	req2.Header.Set("Content-Type", "application/json")
	// ask supabase to return the inserted row
	req2.Header.Set("Prefer", "return=representation")

	resp2, err := http.DefaultClient.Do(req2)
	if err != nil {
		return nil, err
	}
	defer resp2.Body.Close()

	if resp2.StatusCode < 200 || resp2.StatusCode >= 300 {
		body2, _ := io.ReadAll(resp2.Body)
		return nil, fmt.Errorf("supabase update transaction failed: status=%d body=%s", resp2.StatusCode, string(body2))
	}

	var arr []models.Transaction
	if err := json.NewDecoder(resp2.Body).Decode(&arr); err != nil {
		return nil, err
	}
	if len(arr) <= 0 {
		return nil, errors.New("supabase did not update any transaction")
	}
	return &arr[0], nil

}

func DeleteTransaction(transaction models.Transaction) (*models.Transaction, error) {
	supabaseURL, supabaseKey, err := initSupabaseEnv()
	if err != nil {
		return nil, err
	}
	if transaction.TransactionId == "" {
		return nil, errors.New("no transaction id")
	}

	deleteURL := fmt.Sprintf("%s/rest/v1/transactions?transaction_id=eq.%s", supabaseURL, transaction.TransactionId)

	// payloadBytes, _ := json.Marshal(transaction)

	req2, _ := http.NewRequestWithContext(context.Background(), "DELETE", deleteURL, nil)
	req2.Header.Set("apikey", supabaseKey)
	req2.Header.Set("Authorization", "Bearer "+supabaseKey)
	req2.Header.Set("Content-Type", "application/json")
	// ask supabase to return the inserted row
	req2.Header.Set("Prefer", "return=representation")

	resp2, err := http.DefaultClient.Do(req2)
	if err != nil {
		return nil, err
	}
	defer resp2.Body.Close()

	if resp2.StatusCode < 200 || resp2.StatusCode >= 300 {
		body2, _ := io.ReadAll(resp2.Body)
		return nil, fmt.Errorf("supabase delete transaction failed: status=%d body=%s", resp2.StatusCode, string(body2))
	}

	var arr []models.Transaction
	if err := json.NewDecoder(resp2.Body).Decode(&arr); err != nil {
		return nil, err
	}
	if len(arr) <= 0 {
		return nil, errors.New("supabase did not delete the transaction")
	}
	return &arr[0], nil
}
