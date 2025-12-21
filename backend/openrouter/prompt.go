package openrouter

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

const OpenRouterURL = "https://openrouter.ai/api/v1/chat/completions"

type ORMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ORRequest struct {
	Model    string      `json:"model"`
	Messages []ORMessage `json:"messages"`
}

type OROutput struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func ExtractUnknownBankTransaction(plaintext string) (string, error) {
	apiKey := os.Getenv("OPEN_ROUTER_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("OPEN_ROUTER_API_KEY not set")
	}

	prompt := buildPrompt(plaintext)

	reqBody := ORRequest{
		Model: "mistralai/devstral-2512:free",
		Messages: []ORMessage{
			{Role: "system", Content: prompt},
			{Role: "user", Content: plaintext},
		},
	}

	b, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", OpenRouterURL, bytes.NewReader(b))
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var data OROutput
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return "", err
	}

	if len(data.Choices) == 0 {
		return "", fmt.Errorf("no response from model")
	}

	return data.Choices[0].Message.Content, nil
}

func buildPrompt(input string) string {
	// Insert the master prompt here as a raw string literal
	return promptTemplate
}

var promptTemplate = `
You are a financial transaction extraction engine.
You receive plaintext converted from bank emails.
Extract ONLY the following fields and return ONLY valid JSON. No markdown.

Required JSON structure:
{
  "merchant": "",
  "account": "",
  "amount": number,
  "currency": "SGD|USD|EUR|...",
  "datetime": "ISO8601",
  "category": "",
  "type": ""
}

Rules:
- Input is always plaintext.
- Merchant = the payee / recipient / “to” field.
- Account = the paying or receiving account / “from” field (may end with digits, "PayLah", "Wallet", "Visa xxxx", etc).
- Amount: extract both currency + numeric value (always positive).
- Datetime: Convert dates to ISO8601 in the format "YYYY-MM-DDTHH:MM:SSZ". Treat all times as UTC. Always append 'Z' at the end even if the email mentions a local timezone.

Transaction type rules:
- type = "expense" if money leaves the user (payments, card charges, transfers sent).
- type = "income" if money enters the user (salary credits, transfers received).
- If unclear, default to "expense".

Category rules:
- If type = "expense", choose one from:
  ["food_and_dining","travel","transport","groceries","utilities","transfers","entertainment","shopping","others"]

- If type = "income", choose one from:
  ["salary","transfers"]

Expense category heuristics:
- food_and_dining → cafés, restaurants, beverage stores (e.g., Luckin, Starbucks, McDonald's).
- travel → flights, booking.com, airbnb, hotels.
- transport → bus, MRT, SMRT, TFL, ride hailing (Grab, Uber, Gojek).
- groceries → FairPrice, Cold Storage, Sainsbury's.
- utilities → recurring household bills, telecom, power, water.
- transfers → peer-to-peer payments, wallet transfers, PayLah/PayNow (sent).
- entertainment → movies, attractions, theme parks.
- shopping → retail stores, Shopee, Zalora, H&M.
- others → anything unknown.

Income category heuristics:
- salary → regular payroll credits from an employer (keywords: salary, payroll, pay).
- transfers → peer-to-peer transfers, PayNow/FAST credits, wallet transfers received.

If the category is ambiguous:
- For expenses, set category to "others".
- For income, set category to "transfers".

DO NOT hallucinate fields.
If a field (merchant, account, amount, datetime) cannot be found in the text, set it to an empty string "" (or null where appropriate).
Do NOT use "others" as a placeholder for missing fields.

---

### FEW-SHOT EXAMPLES

Input:
"Payment successful. You sent SGD 3.20 to Luckin Coffee via PayLah! Wallet (Mobile ending 5971) on 11 Dec 14:13."
Output:
{
  "merchant": "Luckin Coffee",
  "account": "DBS PayLah",
  "amount": 3.20,
  "currency": "SGD",
  "datetime": "2025-12-11T14:13:00Z",
  "category": "food_and_dining",
  "type": "expense"
}

Input:
"Your Visa ending 4455 was charged USD 18.52 at Uber on 05 Nov 08:10 UTC."
Output:
{
  "merchant": "Uber",
  "account": "Visa ending 4455",
  "amount": 18.52,
  "currency": "USD",
  "datetime": "2025-11-05T08:10:00Z",
  "category": "transport",
  "type": "expense"
}

Input:
"Transfer completed. You sent SGD 200 to John Tan (Mobile ending 9822) on 9 Jan at 21:45."
Output:
{
  "merchant": "John Tan (Mobile ending 9822)",
  "account": "",
  "amount": 200,
  "currency": "SGD",
  "datetime": "2025-01-09T21:45:00Z",
  "category": "transfers",
  "type": "expense"
}

Input:
"Transaction Ref: TF518721765433374243

We refer to your PayLah! Transfer dated 11 Dec.

Date & Time: 11 Dec 14:13 (SGT)
Amount: SGD1.00
From: PayLah! Wallet (Mobile ending 5971)
To: John Tan (Mobile ending 8085)"
Output:
{
  "merchant": "John Tan (Mobile ending 8085)",
  "account": "PayLah! Wallet (Mobile ending 5971)",
  "amount": 1.00,
  "currency": "SGD",
  "datetime": "2025-12-11T14:13:00Z",
  "category": "transfers",
  "type": "expense"
}

Input:
"The following PayNow transfer has been made to FONG SENG FAST FOOD NASI LEMAK (1999).

Date: 01 Dec 2025
Time: 13:04 PM SGT
Amount: SGD 1.90
From your account: OCBC FRANK Account (-469001)"
Output:
{
  "merchant": "FONG SENG FAST FOOD NASI LEMAK (1999)",
  "account": "OCBC FRANK Account (-469001)",
  "amount": 1.90,
  "currency": "SGD",
  "datetime": "2025-12-01T13:04:00Z",
  "category": "food_and_dining",
  "type": "expense"
}

Input:
"Salary Credit from ACME PTE LTD

Date: 30 Nov 2025
Amount: SGD 4,500.00
To Account: DBS Multiplier Account (-1234)"
Output:
{
  "merchant": "ACME PTE LTD",
  "account": "DBS Multiplier Account (-1234)",
  "amount": 4500.00,
  "currency": "SGD",
  "datetime": "2025-11-30T00:00:00Z",
  "category": "salary",
  "type": "income"
}

Input:
"You have received SGD 120.00 from John Tan via PayNow.

Date & Time: 15 Dec 2025 18:42 SGT
To: OCBC 360 Account (-7788)"
Output:
{
  "merchant": "John Tan",
  "account": "OCBC 360 Account (-7788)",
  "amount": 120.00,
  "currency": "SGD",
  "datetime": "2025-12-15T18:42:00Z",
  "category": "transfers",
  "type": "income"
}

---
Return ONLY valid JSON.
Do NOT include code fences.
Do NOT include backticks or any other formatting.
Output must be raw JSON only.
`
