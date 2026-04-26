# Gemini API Setup Guide

## Quick Setup

1. **Get your Gemini API Key**
   - Visit: https://aistudio.google.com/app/apikey
   - Click "Create API Key" button
   - Copy the generated key

2. **Create `.env` file in the ForkLM root directory**
   ```bash
   # Copy the example file
   cp .env.example .env
   ```

3. **Edit the `.env` file and paste your API key**
   ```
   GEMINI_API_KEY=paste_your_key_here
   ```

4. **Start the application**
   - Windows Batch: `dev-run.bat`
   - Windows PowerShell: `.\dev-run.ps1`
   - macOS/Linux: `./dev-run.sh`

## Troubleshooting

### Error: "GEMINI_API_KEY environment variable is not set"
- Make sure you've created the `.env` file
- Verify the key is correctly pasted
- Restart the backend server after adding the key

### API Rate Limiting
- The Gemini API has rate limits on free tier
- Consider implementing caching or adding delays between requests if needed

### Empty Responses
- Check the backend logs for error messages
- Ensure your API key is valid and has API calls remaining
- Try testing with a simple prompt first

## API Information

- **Model Used**: `gemini-1.5-flash` (faster, good for conversation)
- **Free Tier**: 15 requests per minute with free API key
- **Documentation**: https://ai.google.dev/docs

## Switching Models

To use a different Gemini model, edit `backend/main.py` and change:

```python
model = genai.GenerativeModel("gemini-1.5-flash")
```

To:

```python
model = genai.GenerativeModel("gemini-2.0-flash")  # or another model
```

Available models: https://ai.google.dev/models
