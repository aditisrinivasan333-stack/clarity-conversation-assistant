# Clarity — Private conversation assistant

Clarity runs text and speech inference locally in the browser. Conversation text and audio are not sent to an AI inference API or server, and no API key is required. On first use, the browser downloads public model files from Hugging Face; subsequent use can load cached models. An internet connection is needed for the initial download.

## Run locally

```bash
npm install
npm --prefix web install
npm run dev
```

Open `http://localhost:3000`. No `.env` file or API key is needed.

To create a production build:

```bash
npm run build
```

## Deploy to Vercel

1. Import this repository into Vercel and keep the project root as the Root Directory.
2. The included `vercel.json` builds the React app and serves the static output with SPA routing.
3. Deploy. No AI-provider key or server-side inference function is required.

The app runs inference on each visitor's device. Vercel hosting limits and Hugging Face model download availability/bandwidth are subject to their current terms.

## Models and browser requirements

- **Text:** `onnx-community/Qwen2.5-0.5B-Instruct` handles summaries, emotion analysis, and translation.
- **Voice:** `onnx-community/whisper-tiny` transcribes audio.
- **Runtime:** Transformers.js + ONNX Runtime Web. WebGPU is used when available; otherwise inference falls back to WebAssembly.
- **First use:** Model files download from Hugging Face and are cached by the browser. Downloads are large (hundreds of MB for text generation, plus the optional speech model), so a recent computer and stable connection are recommended.
- **Limits:** Conversation analysis is capped at 10,000 characters; selected-text translation at 5,000 characters; audio at 25 MB and 10 minutes.
- **Privacy:** Text and audio inference run in the browser. The app makes no AI inference API calls; the initial model download contacts Hugging Face.

## App features

- Paste conversation text or import `.txt` / `.csv` files.
- Select sample messages or highlight a phrase for a quick summary, translation, or browser search.
- Upload an audio note for on-device transcription.
- Select unread sample messages, switch laptop/mobile preview, and take the introductory tour.

The WhatsApp, SMS, and Email dashboard sources are sample conversations, not live account connections. Reading private messages requires each platform's official API and user authorization; a web page cannot grant itself access to those apps.

## Troubleshooting

- If model loading fails, check that the browser can reach `huggingface.co`, then retry.
- If WebGPU is unavailable, inference uses WebAssembly and may be slower.
- Keep the tab open during the initial model download and inference. Some mobile devices may not have enough memory for local language models.
- Review generated translations and emotion insights before relying on them.
