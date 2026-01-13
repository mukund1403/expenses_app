package openrouter

import (
	"encoding/json"
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
	fmt.Println("test main running")
	key := os.Getenv("OPEN_ROUTER_API_KEY")
	fmt.Println("key: ", key)

	// Run tests
	code := m.Run()
	os.Exit(code)
}

func TestIntegration_LLMTransactionExtraction(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping LLM integration test")
	}
	if os.Getenv("RUN_INTEGRATION_TESTS") != "1" {
		t.Skip("Set RUN_INTEGRATION_TESTS=1 to run LLM tests")
	}

	tests := []struct {
		name  string
		input string
		check func(t *testing.T, tx models.Transaction)
	}{
		// --------------------
		// 🇸🇬 Singapore Banks – EXPENSES
		// --------------------

		{
			name:  "DBS card food transaction",
			input: `DBS Alert: SGD 47.85 has been deducted from your DBS Visa Card ending 6321 at FAIRPRICE on 15 Oct 2025 18:27.`,
			check: func(t *testing.T, tx models.Transaction) {
				if tx.Type != "expense" {
					t.Errorf("expected expense, got %s", tx.Type)
				}
				if tx.Category != "groceries" {
					t.Errorf("expected groceries, got %s", tx.Category)
				}
				if tx.Amount != 47.85 {
					t.Errorf("wrong amount: %v", tx.Amount)
				}
			},
		},

		{
			name:  "POSB coffee purchase",
			input: `POSB SMS: You spent SGD 13.50 at SELEGIE COFFEE 3 on 02 Nov 2025 07:52 on your POSB Everyday Card.`,
			check: func(t *testing.T, tx models.Transaction) {
				if tx.Type != "expense" {
					t.Errorf("expected expense, got %s", tx.Type)
				}
				if tx.Category != "food_and_dining" {
					t.Errorf("expected food_and_dining, got %s", tx.Category)
				}
				if tx.Amount != 13.50 {
					t.Errorf("wrong amount: %v", tx.Amount)
				}
			},
		},

		{
			name:  "DBS ambiguous merchant",
			input: `DBS Alert: A transaction of SGD 88.50 occurred on your card ending 7789 on 12 Jan 12:34.`,
			check: func(t *testing.T, tx models.Transaction) {
				if tx.Type != "expense" {
					t.Errorf("expected expense, got %s", tx.Type)
				}
				if tx.Category != "others" {
					t.Errorf("expected others, got %s", tx.Category)
				}
				if tx.Amount != 88.50 {
					t.Errorf("wrong amount: %v", tx.Amount)
				}
				expectedTime, _ := time.Parse(time.RFC3339, "2026-01-12T12:34:00Z")
				if !tx.DateTime.Equal(expectedTime) {
					t.Errorf("wrong datetime: expected %s, got %s", expectedTime, tx.DateTime)
				}
			},
		},

		// --------------------
		// 🇸🇬 Singapore Banks – INCOME
		// --------------------

		{
			name:  "DBS salary credit",
			input: `DBS Alert: Salary Credit of SGD 5,200.00 from ACME PTE LTD on 28 Nov 2025.`,
			check: func(t *testing.T, tx models.Transaction) {
				if tx.Type != "income" {
					t.Errorf("expected income, got %s", tx.Type)
				}
				if tx.Category != "salary" {
					t.Errorf("expected salary, got %s", tx.Category)
				}
				if tx.Amount != 5200.00 {
					t.Errorf("wrong amount: %v", tx.Amount)
				}
			},
		},

		{
			name:  "OCBC PayNow incoming transfer",
			input: `OCBC Alert: You have received SGD 250.00 via PayNow from TAN SIEW LING on 21 Sep 2025 at 09:15.`,
			check: func(t *testing.T, tx models.Transaction) {
				if tx.Type != "income" {
					t.Errorf("expected income, got %s", tx.Type)
				}
				if tx.Category != "transfers" {
					t.Errorf("expected transfers, got %s", tx.Category)
				}
				if tx.Amount != 250.00 {
					t.Errorf("wrong amount: %v", tx.Amount)
				}
			},
		},

		// --------------------
		// 🇬🇧 UK – HSBC
		// --------------------

		{
			name:  "HSBC UK card coffee purchase",
			input: `HSBC Fraud Alert: Have you attempted the following transaction(s) on your card ending 9876? 9876, £3.45, 05 Nov 2025, 08:12, STARBUCKS UK LTD.`,
			check: func(t *testing.T, tx models.Transaction) {
				if tx.Type != "expense" {
					t.Errorf("expected expense, got %s", tx.Type)
				}
				if tx.Currency != "GBP" {
					t.Errorf("expected GBP, got %s", tx.Currency)
				}
				if tx.Category != "food_and_dining" {
					t.Errorf("expected food_and_dining, got %s", tx.Category)
				}
			},
		},

		{
			name:  "HSBC UK transport transaction",
			input: `HSBC Alert: Card ending 4421 was charged £2.90 at TFL TRAVEL CH on 18 Oct 2025 09:01.`,
			check: func(t *testing.T, tx models.Transaction) {
				if tx.Type != "expense" {
					t.Errorf("expected expense, got %s", tx.Type)
				}
				if tx.Category != "transport" {
					t.Errorf("expected transport, got %s", tx.Category)
				}
				if tx.Amount != 2.90 {
					t.Errorf("wrong amount: %v", tx.Amount)
				}
			},
		},

		// --------------------
		// 🧪 Tough / Noisy Cases
		// --------------------

		{
			name: "Noisy multiline transfer email",
			input: `
Transaction Ref: TRX991827361

Date & Time: 11 Dec 2025 21:45
Amount: SGD 1.00

From: PayLah! Wallet (Mobile ending 5971)
To: John Tan (Mobile ending 8085)
`,
			check: func(t *testing.T, tx models.Transaction) {
				if tx.Type != "expense" {
					t.Errorf("expected expense, got %s", tx.Type)
				}
				if tx.Category != "transfers" {
					t.Errorf("expected transfers, got %s", tx.Category)
				}
				if tx.Amount != 1.00 {
					t.Errorf("wrong amount: %v", tx.Amount)
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			out, err := ExtractUnknownBankTransaction(tt.input)
			if err != nil {
				t.Fatalf("LLM call failed: %v", err)
			}
			t.Log(out)

			var tx models.Transaction
			if err := json.Unmarshal([]byte(out), &tx); err != nil {
				t.Fatalf("invalid JSON: %v\n%s", err, out)
			}

			tt.check(t, tx)
		})
	}
}
