package db

import (
	"errors"
	"os"
)

func initSupabaseEnv() (string, string, error) {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")
	if supabaseURL == "" || supabaseKey == "" {
		return "", "", errors.New("SUPABASE_URL or SUPABASE_KEY not set")
	}
	return supabaseURL, supabaseKey, nil
}
