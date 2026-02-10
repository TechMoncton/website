# Setting up EmailOctopus for Moncton Tech Hive Site

## 1. Create an EmailOctopus account

1. Sign up at [EmailOctopus](https://emailoctopus.com)
2. Create a new mailing list for your subscribers

## 2. Create an embedded form

1. Go to **Forms** in the sidebar
2. Click **Create a form**
3. Choose **Embedded form**
4. Customize the form fields and styling as needed
5. On the embed step, find the form ID — it's the UUID in the script URL:
   ```
   https://eomail1.com/form/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.js
   ```
6. Copy just the UUID portion (e.g. `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

## 3. Set up local development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Set `PUBLIC_EMAILOCTOPUS_FORM_ID` to your form UUID

## 4. Add variables to GitHub

Go to your repository's **Settings > Secrets and variables > Actions**.

Under **Variables** (click "New repository variable" for each):

| Name | Value |
|------|-------|
| `PUBLIC_EMAILOCTOPUS_FORM_ID` | Your form UUID from step 2 |
| `PUBLIC_SITE_URL` | Your site URL (e.g. `https://monctontechhive.ca`) |

## 5. Sending campaigns

Campaigns are created and sent manually through the [EmailOctopus dashboard](https://emailoctopus.com). There is no automated campaign script — compose and send emails directly from the EmailOctopus interface.

## Migrating from Mailchimp

If you previously used Mailchimp, remove these GitHub secrets/variables (they are no longer needed):

- **Secrets:** `MAILCHIMP_API_KEY`, `MAILCHIMP_LIST_ID`, `MAILCHIMP_REPLY_TO`, `UPDATE_FALLBACK_LINK`
- **Variables:** `PUBLIC_MAILCHIMP_URL`
