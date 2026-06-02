# BYOK (Bring Your Own Key) Setup Guide

ForkLM now supports BYOK, allowing users to provide their own Gemini API keys to use the service.

## Quick Start

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key

### 2. Set Your API Key in ForkLM

1. Click the ⚙️ (Settings) icon in the top right corner of the app
2. Paste your Gemini API key into the input field
3. Click "Save API Key"
4. You should see a success message confirming the key was saved

### 3. Start Using ForkLM

Once your API key is saved, you can:
- Create new chats
- Send messages and get responses from Gemini
- Branch conversations
- Explore multiple conversation paths

## Security

- Your API key is stored in your browser's **localStorage** (client-side)
- The key is also sent to the backend to enable server-side summarization
- **Only the last 4 characters** of your key are visible in the UI for security
- You can remove your key at any time from Settings

## Troubleshooting

### "API key is required" Error
- Make sure you've set your API key in Settings
- Refresh the page and try again

### API Key Not Saving
- Make sure you've pasted a valid Gemini API key
- Check your browser's console for error messages
- Try clearing localStorage and setting the key again

### Messages Not Sending
- Verify your API key is valid by testing it at [Google AI Studio](https://aistudio.google.com/app/apikey)
- Check that your API key hasn't reached usage limits
- Try removing and re-adding your API key

## Backend Database Migration

If you're upgrading from an existing installation, run this migration:

```sql
ALTER TABLE users ADD COLUMN gemini_api_key VARCHAR(255) NULLABLE;
```

Or restart your database if using fresh setup.

## API Endpoints (Backend)

### Set API Key
```
POST /users/api-key
Body: { "api_key": "your-key-here" }
Response: { "ok": true, "message": "API key saved successfully" }
```

### Get API Key Status
```
GET /users/api-key
Response: { "api_key": "...xxxx", "is_set": true }
```

### Send Message (with API Key)
```
POST /chats/{chat_id}/send
Body: {
  "prompt": "Your question here",
  "selected_node_id": "optional-node-id",
  "api_key": "your-gemini-api-key"
}
```
