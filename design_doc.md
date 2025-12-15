# Design Document

## Frontend

**Note:** The backend root domain can be accessed via: `process.env.NEXT_PUBLIC_GOLANG_URL/`

# Navbar (element in layout.tsx)
Graiden example: <br/>
<img width="388" height="70" alt="Screenshot 2025-12-04 at 1 41 16 PM" src="https://github.com/user-attachments/assets/069746c7-e31a-4a9c-bdff-6cdd817af118" />

Proposed order for us:
1. Home
2. Transactions
3. Analytics (v2.0)
4. Budgets (v2.0)
5. Settings

## Home (/home/page.tsx)
example homepage: (https://github.com/user-attachments/assets/00c39863-c102-4685-b7f5-0d4979b4788f)

- This is the dashboard
- Graiden has put overall income/expenses along with recent transactions
- Maybe we can do a bunch of div's and they all lead to different pages? e.g. one with summary for month then one with pie chart (leads to analytics)
  
## Transactions (/transactions/page.tsx)
  
  Example transactions page: (https://github.com/user-attachments/assets/607275eb-9f22-4a45-b957-b360fdf7ae64)

### Features
1. Display transaction by merchant, Date-Time, Category, Amount
2. Transactions are split by month
3. User can Create a new transaction
4. User can Modify/Update existing transaction (change any of merchant, Date-Time, Category, Amount)
5. User can search for specific transaction (v2.0)

### Backend routes

<details>
<summary>1. Display transaction by merchant, Date-Time, Category, Amount</summary>
  
- **Request:** <br/>
  - Route: `GET process.env.NEXT_PUBLIC_GOLANG_URL/transactions` <br/>
**Note:** The specific user has deliberately not been included because backend should parse that info from http cookies. Let me know if we want a different method.

- **Response** (JSON) from backend:
  ```
  {
    "transaction_list": [
      {
        "transaction_id":"102345",
        "merchant":"LUCKIN COFFEE",
        "amount":"1.23",
        "currency":"SGD",
        "category":"dining",
        "datetime":ISOdatetimestring
      }
    ]
  }
  ```
</details>

<details>
<summary>2. Create a new transaction (/transactions/new/page.tsx)</summary>

- **Request to backend:** <br/>
  Route: `POST process.env.NEXT_PUBLIC_GOLANG_URL/transactions` <br/>
  Params:
  ```
  {
    "merchant":"LUCKIN COFFEE",
    "amount":"1.23",
    "currency":"SGD",
    "category":"dining",
    "account":"DBS card ending 0000",
    "datetime":ISOdatetimestring
  }
  ```

- **Response from backend:**
  - Success Response (gave transaction details in case we are caching the transactions/page.tsx in frontend. if not we can remove this field)
    ```
    {
      "message":"Transaction successfully added",
      "transaction_details": {
          "transaction_id":"102345",
          "merchant":"LUCKIN COFFEE",
          "amount":"1.23",
          "currency":"SGD",
          "account":"DBS card ending 0000",
          "category":"dining",
          "datetime":ISOdatetimestring
      }
    }
    ```
    
  - Error Response
    ```
    {
      "error":"error message here"
    }
    ```
</details>

<details>
<summary>3. Modify an existing transaction (/transactions/:id/page.tsx) -> (not sure if this is the idiomatic way, do change accordingly)</summary>

- For this, when the user clicks on a transaction from the list, they should get an option to modify and then they hit this frontend route
- In the UI, we provide a form with the 4 fields they can modify. Once they click modify we only send the fields which have been modified **along with transaction_id**. (Alternatively can send all also) <br/>

- **Request to backend:**
  - Route: `PUT process.env.NEXT_PUBLIC_GOLANG_URL/transactions`
  - Params (transaction_id is compulsory. rest of the fields are only those which are modified by user):
    ```
    {
      "transaction_id":"102345",
      "amount":"2.55",
    }
    ```

- **Response from backend:** <br/>
  - Success Response <br/>
    ```
    {
      "message":"transaction successfully added",
      "transaction_details" : {
          "transaction_id": "abcd-efgh-ghijk",
          "user_id": "abcd-efgh-ghijk",
          "merchant": "Black Tap",
          "amount": 77,
          "currency":"SGD",
          "account": "dbs ending 1234",
          "category": "dining",
          "datetime": "2025-11-15T17:32:00Z"
      }
    }
    ```
  
  - Error Response <br/>
    ```
    {
      "status_code":400,
      "error":"error message here"
    }
    ```
</details>

<details>
<summary> 4. Delete an existing transaction (/transactions/:id/page.tsx) </summary>
- For this, when the user clicks on a transaction from the list, they should be able to click `Delete Transaction` button (ask for confirmation)
- In the UI, we provide a form with the 4 fields they can modify. Once they click modify we only send the fields which have been modified **along with transaction_id**. (Alternatively can send all also) <br/>

- **Request to backend:**
  - Route: `DELETE process.env.NEXT_PUBLIC_GOLANG_URL/transactions`
  - Params (transaction_id is compulsory):
    ```
    {
      "transaction_id":"102345",
    }
    ```

- **Response from backend:** <br/>
  - Success Response <br/>
    ```
    {
      "message":"transaction successfully deleted",
      "transaction_details" : {
          "transaction_id": "abcd-efgh-ghijk",
          "user_id": "abcd-efgh-ghijk",
          "merchant": "Black Tap",
          "amount": 77,
          "currency":"SGD",
          "account": "dbs ending 1234",
          "category": "dining",
          "datetime": "2025-11-15T17:32:00Z"
      }
    }
    ```
  
  - Error Response <br/>
    ```
    {
      "error":"error message here"
    }
    ```
    </details>

## Settings (/settings)
  <details>
  <summary>1. Get activation link</summary>
    
  - **Request:** <br/>
    - Route: `GET process.env.NEXT_PUBLIC_GOLANG_URL/settings/activation_link` <br/>

  - **Response from backend:** <br/>
    - Success Response <br/>
      ```
      {
        "activation_link": "https://mail-settings.google.com/mail/vf-%xyz-abc-def-jjj"
      }
      ```
    
    - Error Response (400) <br/>
    **Note:** Only user not setup auto forwarding returns 400 code (rest are 500). In this case, frontend needs to display error message and then a prompt saying **"Click here to setup autoforwarding"** with a link to the `get_started` page
      ```
      {
        "error": "you have not setup auto forwarding yet"
      }
      ```
  
  </details>

  <details>
  <summary>2. Get user details </summary>
    
  **Note:** The `forwarding_email` from the response is the one they need to auto forward to. So we need to show it under **Your forwarding email** and allow them to easy copy it with button click. 
    
  - **Request:** <br/>
    - Route: `GET process.env.NEXT_PUBLIC_GOLANG_URL/settings/user_details` <br/>

  - **Response from backend:** <br/>
    - Success Response <br/>
      ```
      {
        "name": "John Tan",
        "registered_email": "john_tan@gmail.com",
        "forwarding_email": "abcdef54463@jowenlo.resend.app"
      }
      ```
    
    - Error Response (400) <br/>
      ```
      {
        "error": "error retrieving user details. try again later"
      }
      ```
  
  </details>

  <details>
  <summary>3. Modify user details </summary>
    
  **Note:** Users can only modify the `name` field (lol). No other fields should be modified and sent in this request (backend also checks for this).
    
  - **Request:** <br/>
    - Route: `PUT process.env.NEXT_PUBLIC_GOLANG_URL/settings/user_details` <br/>

  - **Response from backend:** <br/>
    - Success Response (only the modified detail (aka name) is returned) <br/>
      ```
      {
        "message": "user details successfully changed",
        "name": "Mukund"
      }
      ```
    
    - Error Response (400) <br/>
      ```
      {
        "error": "failed to modify user details please try again later"
      }
      ```
  
  </details>

## Analytics (v2.0)
- Thinking of a pie chart broken down by category
- Can compare with budget


## Budget (v2.0)
- Users can set budget per category
- Send to backend **route: `PUT process.env.NEXT_PUBLIC_GOLANG_URL/budget`**
  
