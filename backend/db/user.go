package db

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"expenses/logx"
	"fmt"
	"io"
	"net/http"
	"net/url"

	gonanoid "github.com/matoous/go-nanoid/v2"
)

type SupabaseUser struct {
	ID             string `json:"id,omitempty"`    // cannot modify
	Email          string `json:"email,omitempty"` // cannot modify
	Name           string `json:"name,omitempty"`
	Username       string `json:"username,omitempty"`        // cannot modify
	ActivationLink string `json:"activation_link,omitempty"` // user cannot modify
}

// we can retrieve user details by username, email or id
func GetSupabaseUser(ctx context.Context, info map[string]interface{}) (*SupabaseUser, error) {
	supabaseURL, supabaseKey, err := initSupabaseEnv()
	if err != nil {
		return nil, err
	}

	getURL, err := extractUrl(info, supabaseURL)
	if err != nil {
		return nil, err
	}

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

	supabaseURL, supabaseKey, err := initSupabaseEnv()
	if err != nil {
		return nil, err
	}

	name := ""
	if n, ok := info["name"].(string); ok {
		name = n
	}

	username := generateUserName()

	// 2) Create user via POST
	createURL := fmt.Sprintf("%s/rest/v1/users", supabaseURL)
	newUser := SupabaseUser{
		Email:    emailVal,
		Name:     name,
		Username: username,
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

func PutSupabaseUser(ctx context.Context, info map[string]interface{}, userModifications *SupabaseUser) (*SupabaseUser, error) {
	supabaseURL, supabaseKey, err := initSupabaseEnv()
	if err != nil {
		return nil, err
	}

	updateURL, err := extractUrl(info, supabaseURL)
	if err != nil {
		return nil, err
	}
	payloadBytes, _ := json.Marshal(userModifications)

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
		return nil, fmt.Errorf("supabase update user failed: status=%d body=%s", resp2.StatusCode, string(body2))
	}

	var arr []SupabaseUser
	if err := json.NewDecoder(resp2.Body).Decode(&arr); err != nil {
		return nil, err
	}
	if len(arr) <= 0 {
		return nil, errors.New("supabase did not update any user")
	}
	return &arr[0], nil
}

func generateUserName() string {
	alphabet := "23456789abcdefghjkmnpqrstuvwxyz"
	id, _ := gonanoid.Generate(alphabet, 12)
	return id

}

func extractUrl(info map[string]interface{}, supabaseURL string) (string, error) {
	URL := ""
	if emailVal, ok := info["email"].(string); ok && emailVal != "" {
		URL = fmt.Sprintf("%s/rest/v1/users?email=eq.%s", supabaseURL, url.QueryEscape(emailVal))
	}
	if usernameVal, ok := info["username"].(string); ok && usernameVal != "" {
		URL = fmt.Sprintf("%s/rest/v1/users?username=eq.%s", supabaseURL, url.QueryEscape(usernameVal))
	}
	if idVal, ok := info["id"].(string); ok && idVal != "" {
		URL = fmt.Sprintf("%s/rest/v1/users?id=eq.%s", supabaseURL, url.QueryEscape(idVal))
	}
	if URL == "" {
		err := errors.New("cannot get supabase user. no email or username or id provided")
		logx.Logger.Error(err.Error())
		return URL, err
	}
	return URL, nil
}
