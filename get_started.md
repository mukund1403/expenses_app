# Getting started
Our app allows you to keep track of expenses without having to manually update them!

To do this we require you to do 2 things:
1. Setup **email** transaction alerts from your own bank
2. Setup auto forwarding from your email to your unique forwarding email that we assign you
<hr/>

## Setting up email  transaction alerts
Most banks provide email transaction alerts for transactions over a certain limit (e.g. $200)

What you need to do is:
1. Find out how to change the limit (e.g. here is how to change the limit for dbs: [Changing limit for dbs](https://www.dbs.com.sg/personal/support/bank-ibanking-notification-alerts.html))

2. Change the limit to $0. This will ensure you get an email notification for every transaction.

3. Ensure your email id that receives the alerts is the same one that you will use to sign in to our app. 
    - Note: Since the transaction limit is 0 you might get a large volume of transaction alert emails. We recommend either:
        - creating a rule to move transaction alert emails into a separate folder
        - after setting up forwarding and filters, choosing `archive Gmail's copy` or `delete Gmail's copy` (NOT RECOMMENDED) for the filter options:
        ![Archive/Delete email](frontend/public/gmail_email_options.png) 
<hr/>

## Setting up Auto-forwarding in Gmail

### 1. Get your Unique Forwarding Email Address

- Sign into our app by clicking the Sign in With Google button </br>
(image)

- Find your Forwarding Address
Go to `Settings -> Your unique Forwarding Address` and copy the address </br>
![Unique forwarding address](frontend/public/unique_forwarding_address.png)

### 2. Open Gmail Settings
- Go to your Gmail settings and click `See all settings`
![Google settings](frontend/public/google_settings.png)

### 3. Add Your forwarding email
- Go to `Forwarding and POP/IMAP` tab
- Click `Add a forwarding address`. Paste your Graiden address and click `Next->Proceed->OK`.
![Adding forwarding address](frontend/public/forwarding_address.png)

**Note: After this you will see a pop-up window asking you to verify forwarding**

### 4. Confirm forwarding
- In our app, Go to `Settings` and scroll to `Your activation link` 
(image) <br/>

- Click on the confirmation link to confirm the forwarding address.

### 5. Filter for Only Transaction-Related Emails
We need to setup filters for transaction related emails so that all emails are not auto forwarded.

- Go to the `Filters and Blocked Addresses` tab in Settings.

- Click `Create a new filter`

- Customise Filter based on the sender and subject body. They need to be wrapped in **double straight quotes** `""`.
    - Example: `"transaction was completed"`

- Example filter:
    - Here is an example filter for dbs bank (image below). The email MUST be from `"ibanking.alert@dbs.com"` and the body MUST contain `"transaction was completed"`.
    - **NOTE:** This is not neccessarily the case for other banks. Please check some of the transaction alerts to see what the email body contains for your own bank.
    - **NOTE:** DBS users who use paylah need to setup a separate filter with `FROM: "paylah.alert@dbs.com"`. Similarly if your bank has a separate wallet feature (like Paylah in Singapore), remember to create a filter with that email as well!
    ![filter_address](frontend/public/google_filter_address.png) <br/><br/>

### 6. Confirming Filter
- Click `Create Filter` and select `Foward it to` option. Then select your unique forwarding email.
- Finally click the blue `Create Filter` button to confirm filter creation
- If everything worked correctly, you should see the filter in the list like below.
![successful filter](frontend/public/successful_filter.png)

## Testing Filter (very very very important! (like very))
In case it was not clear, this step is kinda important. This is because your expenses will not be tracked correctly if the filter is not working as intended.

- On the `Filters and Blocked Addresses` page in settings, click on the `Edit` button for the newly created filter and then click `Search` (blue button). You should see the emails you intend to forward. **Make sure to do this for all filters! (Example for both ibanking and paylah alerts filter mentioned before)**

## DO NOT FORWARD ALL EMAILS (ALSO VERY IMPORTANT)
- Forwarding all your emails will result in loss of privacy for you and server overload (and subsequently dropping your requests) for us. 
- To prevent this, select the `Disable Forwarding` option.
![disable forwarding](frontend/public/disable_forwarding.png)

