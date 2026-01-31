package db

import (
	"expenses/models"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/joho/godotenv"
)

func TestMain(m *testing.M) {
	// Load .env for tests
	err := godotenv.Load("../.env")
	if err != nil {
		fmt.Println("error:", err.Error())
	}

	// Run tests
	code := m.Run()
	os.Exit(code)
}

var testUserID = "0386f47b-1f60-4ed9-9c5c-af8c070918e5"

func TestIntegration_PostTransaction(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping Transaction integration test")
	}
	if os.Getenv("RUN_INTEGRATION_TESTS") != "1" {
		t.Skip("Set RUN_INTEGRATION_TESTS=1 to run Transaction tests")
	}

	tests := []struct {
		name  string
		input models.Transaction
		check func(t *testing.T, err error)
	}{
		{
			name: "Successful addition",
			input: models.Transaction{
				UserId:   testUserID,
				Merchant: "Golden Village",
				Amount:   43,
				Category: "entertainment",
				DateTime: parseTime(t, "2025-11-15T17:32:00Z"),
				Account:  "dbs ending 1234",
				Type:     "expense",
			},
			check: func(t *testing.T, err error) {
				if err != nil {
					t.Errorf("failed successful transaction")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tx, err := PostTransaction(tt.input)
			t.Log("tx is: ", tx)
			if err == nil {
				cleanupPostTransactionTest(t, *tx)
			} else {
				t.Log(err.Error())
			}

			tt.check(t, err)
		})
	}
}

func cleanupPostTransactionTest(t *testing.T, tx models.Transaction) {
	_, err := DeleteTransaction(tx)
	if err != nil {
		t.Log(err.Error())
		t.Errorf("Clean up failed! Please clean up manually!!!")
	}
}

func parseTime(t *testing.T, s string) *time.Time {
	t.Helper()

	tm, err := time.Parse(time.RFC3339, s)
	if err != nil {
		t.Fatalf("invalid time %q: %v", s, err)
	}
	return &tm
}
