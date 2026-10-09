# Clarity — Conversation assistant powered by Groq

Clarity uses Groq for conversation summaries, emotion analysis, translation, and voice-note transcription. The Groq key stays on the server and is never included in the browser bundle. Conversation text and audio are sent to Groq for processing; do not submit private information unless you are comfortable with Groq's data-handling terms.

## Run locally

1. Install dependencies:

   ```bash
   npm install
   npm --prefix web install
   ```

2. Copy `.env.example` to `.env` and replace the placeholder with your Groq API key:

   ```dotenv
   GROQ_API_KEY=your_actual_groq_api_key
   ```

   Keep `.env` private and never paste the key into chat or commit it to Git. The `.gitignore` excludes `.env`.

3. Start the app:

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000`. The API proxy runs locally on port 5001.

Optional model overrides can be set in `.env`:

```dotenv
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_TRANSCRIPTION_MODEL=whisper-large-v3-turbo
```

Create the production frontend build with `npm run build`.

## Deploy to Vercel

1. Push this project to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Keep the project root as the Root Directory. The included `vercel.json` builds the React app and deploys the API functions.
4. In **Project Settings → Environment Variables**, add `GROQ_API_KEY` with your Groq key. Select the environments you need, save, and redeploy.
5. Never place the key in a `REACT_APP_*` variable: those values are included in the browser bundle.

Groq usage is subject to its current model availability, rate limits, and account pricing/free-tier terms. Vercel plan limits also apply.

## AI models and data

- **Text:** `llama-3.3-70b-versatile` is the default Groq chat model. Set `GROQ_MODEL` to an available Groq chat model to change it.
- **Voice:** `whisper-large-v3-turbo` is the default Groq transcription model. Set `GROQ_TRANSCRIPTION_MODEL` to an available Groq transcription model to change it.
- **Limits:** Summaries are capped at 10,000 characters, selected-text translations at 5,000 characters, and voice-note uploads at 4 MB to stay within Vercel's request-size limits.
- **Privacy:** Text and audio are sent to Groq over HTTPS. The API key is sent only from the server to Groq and is never returned to the client. Review Groq's current data-handling policy before using real personal conversations.

## App features

- Paste conversation text or import `.txt` / `.csv` files.
- Select sample messages or highlight a phrase for a Groq-powered quick summary, translation, or browser search.
- Upload an audio note for Groq-powered transcription.
- Select unread sample messages, switch laptop/mobile preview, and take the introductory tour.

The WhatsApp, SMS, and Email dashboard sources are clearly labelled sample conversations, not live account connections. Reading private messages requires each platform's official API and user authorization; a web page cannot grant itself access to those apps.

## Troubleshooting

- If you see a configuration error, check that `GROQ_API_KEY` is set in `.env` locally or in Vercel's server-side Environment Variables, then restart or redeploy.
- If Groq reports a model or rate-limit error, check the models available to your account and the current Groq limits.
- If a voice note upload fails, use a supported audio format and keep the file at or below 4 MB.
- Review translations and emotion insights before relying on them.
