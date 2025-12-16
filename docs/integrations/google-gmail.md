# Google OAuth + Gmail API (Optional)

You must create a Google Cloud project + OAuth consent screen + OAuth client.
Required env:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI

Recommended scopes for Gmail:
- https://www.googleapis.com/auth/gmail.readonly
- https://www.googleapis.com/auth/gmail.send

Note: In production, store tokens in an OAuth vault (db + KMS).
