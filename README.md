# Clarity — Private conversation assistant

Clarity processes selected conversation text, PDFs, images, and audio in the browser. User-selected files and text are not uploaded to an AI server, and no inference API key is required. Public AI model files, OCR language data, and PDF/OCR runtime assets may be downloaded from their providers; an internet connection may be needed on first use. Extraction and inference run locally after those assets are available.

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

1. Import this repository into Vercel and set **Root Directory** to `web`.
2. The `web/vercel.json` configuration installs dependencies from `web/package.json`, builds the React app, and serves the static output with SPA routing. Do not prefix these commands with `web/`.
3. Deploy. No AI-provider key or server-side inference function is required.

The app runs inference on each visitor's device. Vercel hosting limits and Hugging Face model download availability/bandwidth are subject to their current terms.

## Models and browser requirements

- **Text:** `onnx-community/Qwen2.5-0.5B-Instruct` handles summaries, emotion analysis, and translation.
- **Voice:** `onnx-community/whisper-tiny` transcribes audio.
- **PDFs:** PDF.js extracts selectable text in the browser. Scanned PDFs without selectable text are not OCRed.
- **Images:** Tesseract.js OCRs PNG, JPEG, WebP, BMP, and TIFF images in the browser using English language data.
- **Runtime:** Transformers.js + ONNX Runtime Web. WebGPU is used when available; otherwise inference falls back to WebAssembly.
- **First use:** AI models, OCR language data, and extraction runtime assets may download from Hugging Face, jsDelivr, or other configured public asset providers and can be cached by the browser. Model downloads are large (hundreds of MB for text generation, plus the optional speech model), so a recent computer and stable connection are recommended.
- **Limits:** Conversation analysis and document extraction are capped at 10,000 characters; text translation at 5,000 characters; document uploads at five files per batch, 10 MB per file, 25 MB per batch, and 30 pages per PDF; audio at 25 MB and 10 minutes.
- **Privacy:** Selected files and extracted text are processed in the browser and are not uploaded to an AI server. The app makes no AI inference API calls; public model and runtime asset downloads do contact their providers.

## App features

- Paste conversation text or import `.txt` / `.csv` files.
- Select multiple PDFs and images for browser-local text extraction/OCR, then summarize or translate their extracted text.
- Select sample messages or highlight a phrase for a quick summary, translation, or browser search.
- Upload an audio note for on-device transcription.
- Select unread sample messages, switch laptop/mobile preview, and take the introductory tour.

The WhatsApp, SMS, and Email dashboard sources are sample conversations, not live account connections. Reading private messages requires each platform's official API and user authorization; a web page cannot grant itself access to those apps.

## Troubleshooting

- If model loading fails, check that the browser can reach `huggingface.co`, then retry.
- If WebGPU is unavailable, inference uses WebAssembly and may be slower.
- Keep the tab open during the initial model download and inference. Some mobile devices may not have enough memory for local language models.
- Review generated translations and emotion insights before relying on them.
