# Setting up Mailchimp for Tech Moncton Site

## 1. Get your Mailchimp API key

1. Log in to [Mailchimp](https://mailchimp.com)
2. Go to **Profile > Extras > API keys**
3. Click **Create A Key**
4. Copy the full key (it ends with a datacenter suffix like `-us19`)

## 2. Get your Audience (List) ID

1. Go to **Audience > All contacts**
2. Click **Settings** (under the Audience tab)
3. Go to **Audience name and defaults**
4. Your **Audience ID** is shown at the bottom — a 10-character hex string (e.g. `5fde35de0b`)

## 3. Get your Mailchimp subscribe form URL

1. Go to **Audience > Signup forms > Embedded forms**
2. In the generated HTML, find the `<form action="...">` URL
3. Copy the full URL (it looks like `https://example.us19.list-manage.com/subscribe/post?u=XXXXX&id=XXXXX&f_id=XXXXX`)
4. **Important:** The HTML may show `&amp;` between parameters — replace each `&amp;` with `&` so the final URL uses plain `&` separators

## 4. Verify your sending domain

1. Go to **Settings > Domains**
2. Add and verify the domain you want to send from (e.g. `monctontechhive.ca`)
3. This is required for Mailchimp to send campaigns with your reply-to address

## 5. Add secrets to GitHub

Go to your repository's **Settings > Secrets and variables > Actions**.

Under **Secrets** (click "New repository secret" for each):

| Name | Value |
|------|-------|
| `MAILCHIMP_API_KEY` | Your full API key (e.g. `abc123def456-us19`) |
| `MAILCHIMP_LIST_ID` | Your Audience ID from step 2 |
| `MAILCHIMP_REPLY_TO` | The email address campaign replies should go to |
| `UPDATE_FALLBACK_LINK` | (Optional) A URL to use in the email when there are no upcoming events |

Under **Variables** (switch to the Variables tab, click "New repository variable" for each):

| Name | Value |
|------|-------|
| `PUBLIC_MAILCHIMP_URL` | The full form action URL from step 3 |
| `PUBLIC_SITE_URL` | Your site URL (e.g. `https://monctontechhive.ca`) |

## 6. Test it

Go to **Actions > Send Campaign > Run workflow** to send a test campaign to your audience.
