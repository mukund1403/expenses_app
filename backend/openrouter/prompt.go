package openrouter

import (
	"bytes"
	"encoding/json"
	"expenses/models"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
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

// fallbackModels is ordered most-capable-first. There is deliberately no
// small/weak model at the bottom: for this task a wrong-but-well-formed
// classification is worse than no result at all, so if every model here
// is unavailable we return an error rather than degrading to a model we
// don't trust to classify correctly.
var fallbackModels = []string{
	"thinkingmachines/inkling:free",      // primary: 41B active MoE, strong instruction following
	"nvidia/nemotron-3.5-lightning:free", // secondary: previously proven reliable
	"thinkingmachines/inkling-small:free",
}

// Allowed categories, kept in sync with the enums in promptTemplate.
// Used by the plausibility gate to reject structurally-invalid output so
// the caller falls through to the next model.
var expenseCategories = map[string]bool{
	"food_and_dining": true, "travel": true, "transport": true,
	"groceries": true, "utilities": true, "transfers": true,
	"entertainment": true, "shopping": true, "others": true,
}

var incomeCategories = map[string]bool{
	"salary": true, "transfers": true,
}

// openRouterFreeTierInterval is the minimum spacing between requests
// needed to stay under OpenRouter's shared 20-requests-per-minute cap,
// which applies across ALL :free models on the account combined -
// not per model. 60s / 20 = 3s minimum; padded slightly for clock
// drift and safety margin.
const openRouterFreeTierInterval = 3200 * time.Millisecond

// callThrottler enforces a minimum gap between outgoing OpenRouter
// requests, shared by every caller in the process - live transaction
// extraction and backlog processing alike. This matters because both
// paths draw from the same account-wide rate limit: without a shared
// throttle, a backlog goroutine pacing itself in isolation has no way
// to know a live request is about to fire, and vice versa, so either
// side can get 429'd by the other's traffic.
type callThrottler struct {
	mu       sync.Mutex
	lastCall time.Time
}

func (c *callThrottler) wait() {
	c.mu.Lock()
	defer c.mu.Unlock()

	elapsed := time.Since(c.lastCall)
	if elapsed < openRouterFreeTierInterval {
		time.Sleep(openRouterFreeTierInterval - elapsed)
	}
	c.lastCall = time.Now()
}

var openRouterThrottle = &callThrottler{}

func ExtractUnknownBankTransaction(plaintext string) (string, error) {
	apiKey := os.Getenv("OPEN_ROUTER_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("OPEN_ROUTER_API_KEY not set")
	}

	prompt := buildPrompt(plaintext)

	var errs []string
	for _, model := range fallbackModels {
		content, err := callModel(apiKey, model, prompt, plaintext)
		if err == nil {
			return content, nil
		}
		errs = append(errs, fmt.Sprintf("%s: %v", model, err))
	}

	return "", fmt.Errorf("all fallback models failed or returned implausible output: %s", strings.Join(errs, " | "))
}

// callModel makes a single attempt against one model. Any failure mode
// that means "this response isn't usable" - non-2xx, undecodable body,
// no choices, unparsable content, OR a well-formed response that fails
// the plausibility gate - is surfaced as an error so the caller moves on
// to the next model. The plausibility gate is what makes fallback improve
// quality and not just availability: a weak model returning valid JSON
// with a bogus category no longer gets accepted just because it parses.
func callModel(apiKey, model, prompt, plaintext string) (string, error) {
	reqBody := ORRequest{
		Model: model,
		Messages: []ORMessage{
			{Role: "system", Content: prompt},
			{Role: "user", Content: plaintext},
		},
	}

	b, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", OpenRouterURL, bytes.NewReader(b))
	if err != nil {
		return "", fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	openRouterThrottle.wait()

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("do request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("read body: %w", err)
	}

	if resp.StatusCode >= 400 {
		return "", fmt.Errorf("openrouter error %d: %s", resp.StatusCode, string(body))
	}

	var data OROutput
	if err := json.Unmarshal(body, &data); err != nil {
		return "", fmt.Errorf("error decoding json: %w", err)
	}

	if len(data.Choices) == 0 {
		return "", fmt.Errorf("no choices in response")
	}

	content := stripCodeFences(data.Choices[0].Message.Content)

	if !json.Valid([]byte(content)) {
		return "", fmt.Errorf("model output is not valid JSON after cleanup: %s", content)
	}

	// Plausibility gate. Parse into the domain type and reject anything
	// structurally wrong so the caller falls through to the next model
	// instead of returning a confidently-wrong extraction.
	var tx models.PromptResponse
	if err := json.Unmarshal([]byte(content), &tx); err != nil {
		return "", fmt.Errorf("unmarshal into PromptResponse: %w", err)
	}
	if err := validateExtraction(tx); err != nil {
		return "", fmt.Errorf("implausible extraction: %w", err)
	}

	return content, nil
}

// validateExtraction rejects structurally-invalid extractions. It does
// NOT (and cannot) catch a wrong-but-plausible classification - it only
// guarantees the shape is sane: known category for the given type, a
// positive amount, and a currency. A "not a transaction" result is
// accepted as-is since its money fields are legitimately empty.
func validateExtraction(tx models.PromptResponse) error {
	if !tx.IsTransaction {
		return nil
	}

	switch tx.Type {
	case "expense":
		if !expenseCategories[tx.Category] {
			return fmt.Errorf("unknown expense category %q", tx.Category)
		}
	case "income":
		if !incomeCategories[tx.Category] {
			return fmt.Errorf("unknown income category %q", tx.Category)
		}
	default:
		return fmt.Errorf("invalid type %q (want expense|income)", tx.Type)
	}

	if tx.Amount <= 0 {
		return fmt.Errorf("non-positive amount %v", tx.Amount)
	}
	if tx.Currency == "" {
		return fmt.Errorf("missing currency")
	}
	return nil
}

// stripCodeFences removes a leading/trailing markdown code fence
// (```json ... ``` or plain ``` ... ```) if present, since some models
// wrap JSON output in fences despite being told not to.
func stripCodeFences(s string) string {
	s = strings.TrimSpace(s)
	if !strings.HasPrefix(s, "```") {
		return s
	}

	s = strings.TrimPrefix(s, "```")
	// Drop an optional language tag right after the opening fence, e.g. "json".
	if nl := strings.IndexByte(s, '\n'); nl != -1 {
		firstLine := strings.TrimSpace(s[:nl])
		if firstLine == "" || !strings.ContainsAny(firstLine, "{[\"") {
			s = s[nl+1:]
		}
	}

	s = strings.TrimSpace(s)
	s = strings.TrimSuffix(s, "```")

	return strings.TrimSpace(s)
}

func buildPrompt(input string) string {
	referenceYear := time.Now().UTC().Year()

	prompt := strings.ReplaceAll(
		promptTemplate,
		"{{REFERENCE_YEAR}}",
		strconv.Itoa(referenceYear),
	)
	return prompt
}

var promptTemplate = `
You are a financial transaction extraction engine.
You receive plaintext converted from bank emails.
Some emails may **not be transactions**. In such cases, set "is_transaction": false.
Otherwise, extract the transaction and set "is_transaction": true.
Extract ONLY the following fields and return ONLY valid JSON. No markdown.

Required JSON structure:
{
  "merchant": "",
  "account": "",
  "amount": number,
  "currency": "SGD|USD|EUR|...",
  "datetime": "ISO8601",
  "category": "",
  "type": "",
  "is_transaction": true
}

Context:
- If a transaction date does NOT include a year, assume the year is {{REFERENCE_YEAR}}.
- {{REFERENCE_YEAR}} is derived from the email received timestamp.
- Do NOT infer a different year unless the text explicitly states one.

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
- If type = "expense", choose EXACTLY one from:
  ["food_and_dining","travel","transport","groceries","utilities","transfers","entertainment","shopping","others"]

- If type = "income", choose EXACTLY one from:
  ["salary","transfers"]

- Use the category strings verbatim. Never invent a category (e.g. "food" is NOT valid; use "food_and_dining").

Expense category heuristics:
- food_and_dining → cafés, restaurants, beverage stores, fast food (e.g., Luckin, Starbucks, McDonald's, Stuff'd).
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
  "type": "expense",
  "is_transaction": true
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
  "type": "expense",
  "is_transaction": true
}

Input:
"A transaction of SGD 7.50 was made with your UOB Card ending 1250 on 23/09/26 at STUFF'D GUOCO TOWER."
Output:
{
  "merchant": "STUFF'D GUOCO TOWER",
  "account": "UOB Card ending 1250",
  "amount": 7.50,
  "currency": "SGD",
  "datetime": "2026-09-23T00:00:00Z",
  "category": "food_and_dining",
  "type": "expense",
  "is_transaction": true
}

Input:
"The key insights today:
▪ Why there could be more upside for gold
▪ Fears of a tech bubble in public US equities may be unfounded
Want to sign up and stay connected? Click here."
Output:
{
  "merchant": "",
  "account": "",
  "amount": null,
  "currency": "",
  "datetime": null,
  "category": "",
  "type": "",
  "is_transaction": false
}

Input:
"Transfer completed. You sent SGD 200 to John Tan (Mobile ending 9822) on 9 Jan at 21:45."
Output:
{
  "merchant": "John Tan (Mobile ending 9822)",
  "account": "",
  "amount": 200,
  "currency": "SGD",
  "datetime": "2026-01-09T21:45:00Z",
  "category": "transfers",
  "type": "expense",
  "is_transaction": true
}

Input:
"Top job picks for you: Strategy Analyst, Governance - TikTok Shop. TikTok. Singapore. Apply with resume & profile."
Output:
{
  "merchant": "",
  "account": "",
  "amount": null,
  "currency": "",
  "datetime": null,
  "category": "",
  "type": "",
  "is_transaction": false
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
  "type": "expense",
  "is_transaction": true
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
  "type": "expense",
  "is_transaction": true
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
  "type": "income",
  "is_transaction": true
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
  "type": "income",
  "is_transaction": true
}

---
Return ONLY valid JSON.
Do NOT include code fences.
Do NOT include backticks or any other formatting.
Output must be raw JSON only.
`
