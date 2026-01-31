package db

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/resend/resend-go/v3"
)

type EmailQueue struct {
	UserID string `json:"user_id"`
	resend.ReceivedEmail
}

func PostFailEmail(email resend.ReceivedEmail, userId string) (*resend.ReceivedEmail, error) {
	supabaseURL, supabaseKey, err := initSupabaseEnv()
	if err != nil {
		return nil, err
	}
	emailData := EmailQueue{
		UserID:        userId,
		ReceivedEmail: email,
	}
	createURL := fmt.Sprintf("%s/rest/v1/email_queue", supabaseURL)

	payloadBytes, _ := json.Marshal(emailData)

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

	var arr []resend.ReceivedEmail
	if err := json.NewDecoder(resp2.Body).Decode(&arr); err != nil {
		return nil, err
	}
	if len(arr) <= 0 {
		return nil, errors.New("supabase insert returned no user")
	}
	return &arr[0], nil
}

func GetFailEmailList() ([]EmailQueue, error) {
	supabaseURL, supabaseKey, err := initSupabaseEnv()
	if err != nil {
		return nil, err
	}

	getURL := fmt.Sprintf("%s/rest/v1/email_queue?select=*", supabaseURL)
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
	var transactionList []EmailQueue
	if err := json.NewDecoder(resp.Body).Decode(&transactionList); err != nil {
		return nil, err
	}
	return transactionList, nil // found

}

func DeleteFailEmail(email_id string) (*resend.ReceivedEmail, error) {
	supabaseURL, supabaseKey, err := initSupabaseEnv()
	if err != nil {
		return nil, err
	}

	deleteURL := fmt.Sprintf("%s/rest/v1/email_queue?id=eq.%s", supabaseURL, email_id)

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

	var arr []resend.ReceivedEmail
	if err := json.NewDecoder(resp2.Body).Decode(&arr); err != nil {
		return nil, err
	}
	if len(arr) <= 0 {
		return nil, errors.New("supabase did not delete the transaction")
	}
	return &arr[0], nil
}
