package db

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
)

type SupabaseUser struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name,omitempty"`
}

// info only needs to have the email
func GetSupabaseUser(ctx context.Context, info map[string]interface{}) (*SupabaseUser, error) {
	emailVal, ok := info["email"].(string)
	if !ok || emailVal == "" {
		return nil, errors.New("google returned no email")
	}

	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")
	if supabaseURL == "" || supabaseKey == "" {
		return nil, errors.New("SUPABASE_URL or SUPABASE_KEY not set")
	}

	getURL := fmt.Sprintf("%s/rest/v1/users?email=eq.%s", supabaseURL, url.QueryEscape(emailVal))
	req, _ := http.NewRequestWithContext(ctx, "GET", getURL, nil)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		var arr []SupabaseUser
		if err := json.NewDecoder(resp.Body).Decode(&arr); err != nil {
			return nil, err
		}
		if len(arr) > 0 {
			return &arr[0], nil // found
		}
	}
	return nil, errors.New("user does not exist in Supabase db")
}

func CreateSupabaseUser(ctx context.Context, info map[string]interface{}) (*SupabaseUser, error) {
	emailVal, ok := info["email"].(string)
	if !ok || emailVal == "" {
		return nil, errors.New("google returned no email")
	}

	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")
	if supabaseURL == "" || supabaseKey == "" {
		return nil, errors.New("SUPABASE_URL or SUPABASE_KEY not set")
	}

	name := ""
	if n, ok := info["name"].(string); ok {
		name = n
	}

	// 2) Create user via POST
	createURL := fmt.Sprintf("%s/rest/v1/users", supabaseURL)
	newUser := SupabaseUser{
		Email: emailVal,
		Name:  name,
	}
	payloadBytes, _ := json.Marshal(newUser)

	req2, _ := http.NewRequestWithContext(ctx, "POST", createURL, bytes.NewReader(payloadBytes))
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
		return nil, fmt.Errorf("supabase create failed: status=%d body=%s", resp2.StatusCode, string(body2))
	}

	var arr []SupabaseUser
	if err := json.NewDecoder(resp2.Body).Decode(&arr); err != nil {
		return nil, err
	}
	if len(arr) <= 0 {
		return nil, errors.New("supabase insert returned no user")
	}
	return &arr[0], nil
}
