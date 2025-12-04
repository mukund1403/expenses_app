# Design Document

## Frontend

**Note:** These have all been directly lifted from the Graiden app. We can change as we see fit <br/>
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
![Home](https://github.com/user-attachments/assets/00c39863-c102-4685-b7f5-0d4979b4788f)



- This is the dashboard
- Graiden has put overall income/expenses along with recent transactions
- Maybe we can do a bunch of div's and they all lead to different pages? e.g. one with summary for month then one with pie chart (leads to analytics)

## Transactions (/transactions/page.tsx)
![Transactions](https://github.com/user-attachments/assets/607275eb-9f22-4a45-b957-b360fdf7ae64)


### Features
1. Display transaction by Name, Date-Time, Category, Amount
2. Transactions are split by month
3. User can Create a new transaction
4. User can Modify/Update existing transaction (change any of Name, Date-Time, Category, Amount)
5. User can search for specific transaction (v2.0)

### Backend connections and endpoint

**1. Display transaction by Name, Date-Time, Category, Amount <br/>**
- **Request:** <br/>
  - Route: `GET process.env.NEXT_PUBLIC_GOLANG_URL/transactions` <br/>
**Note:** The specific user has deliberately not been included because backend should parse that info from http cookies. Let me know if we want a different method.

- **Response** (JSON) from backend:
  ```
  {
    "user_id":"1234",
    "username":"bob",
    "transaction_list": [
      {
        "transaction_id":"102345",
        "name":"LUCKIN COFFEE",
        "amount":"1.23",
        "category":"dining",
        "datetime":"dd-mm-yy-hh-mm"
      }
    ]
  }
  ```

**2. Create a new transaction (/transactions/new/page.tsx) <br/>**
- **Request to backend:** <br/>
  Route: `POST process.env.NEXT_PUBLIC_GOLANG_URL/transactions` <br/>
  Params:
  ```
  {
    "name":"LUCKIN COFFEE",
    "amount":"1.23",
    "category":"dining",
    "datetime":"dd-mm-yy-hh-mm"
  }
  ```

- **Response from backend:**
  - Success Response (gave transaction details in case we are caching the transactions/page.tsx in frontend. if not we can remove this field)
    ```
    {
      "status_code":200,
      "message":"transaction successfully added",
      "transaction_details": {
          "transaction_id":"102345",
          "name":"LUCKIN COFFEE",
          "amount":"1.23",
          "category":"dining",
          "datetime":"dd-mm-yy-hh-mm"
      }
    }
    ```
    
  - Error Response
    ```
    {
      "status_code":400,
      "error":"error message here"
    }
    ```

**3. Modify an existing transaction (/transactions/:id/page.tsx) -> (not sure if this is the idiomatic way, do change accordingly)<br/>**
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
      "status_code":200,
      "message":"transaction successfully added"
    }
    ```
  
  - Error Response <br/>
    ```
    {
      "status_code":400,
      "error":"error message here"
    }
    ```


## Analytics (v2.0)
- Thinking of a pie chart broken down by category
- Can compare with budget


## Budget (v2.0)
- Users can set budget per category
- Send to backend **route: `PUT process.env.NEXT_PUBLIC_GOLANG_URL/budget`**
  
