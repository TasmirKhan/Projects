# What I need from you
1. GEMINI_API_KEY -> paste in `.env.local`. If one key is quota-limited or expired, create/refresh a Gemini API key in Google AI Studio and paste it here. You can also comma-separate backup keys; AgentForge will try the next key/model when Gemini returns a quota/rate-limit response.
2. If you want email automation next sprint, provide SMTP credentials and paste into `.env.local` using keys in `.env.example`.
3. If you want CRM/PM integrations next, provide API keys for tools (HubSpot/Notion/etc.).

## Where to paste
Create file: `Zangoh Demo Project/agentforge-ai/.env.local`
Copy from `.env.example` and fill values.
