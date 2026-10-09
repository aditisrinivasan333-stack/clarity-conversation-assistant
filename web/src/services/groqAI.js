const languages = {
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ja: 'Japanese',
  zh: 'Chinese',
  hi: 'Hindi'
};

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `The AI service returned HTTP ${response.status}.`);
  }
  return data;
}

export async function analyzeConversation(text, onProgress) {
  const input = text.trim();
  if (!input) throw new Error('Paste or import conversation text first.');
  if (input.length > 10000) {
    throw new Error('Limit a single analysis to 10,000 characters.');
  }

  onProgress?.({ message: 'Sending conversation securely to Groq for analysis…' });
  const response = await fetch('/api/ai/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: input })
  });
  const data = await readResponse(response);
  onProgress?.({ message: 'Analysis complete' });
  return data;
}

export async function translateText(text, targetLanguage, onProgress) {
  const input = text.trim();
  if (!input) throw new Error('Select or highlight text to translate.');
  if (!languages[targetLanguage]) throw new Error('Choose a supported target language.');
  if (input.length > 5000) throw new Error('Translation is limited to 5,000 characters at a time.');

  onProgress?.({ message: `Translating to ${languages[targetLanguage]} with Groq…` });
  const response = await fetch('/api/ai/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: input, targetLanguage })
  });
  const data = await readResponse(response);
  onProgress?.({ message: 'Translation complete' });
  return data.translated;
}

export async function transcribeAudio(file, onProgress) {
  if (!file) throw new Error('Choose an audio file first.');
  if (file.size > 4 * 1024 * 1024) {
    throw new Error('Audio files must be 4 MB or smaller for reliable Vercel uploads.');
  }

  onProgress?.({ message: 'Uploading voice note securely to Groq for transcription…' });
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/api/ai/transcribe', {
    method: 'POST',
    body: formData
  });
  const data = await readResponse(response);
  onProgress?.({ message: 'Transcription complete' });
  return data.text;
}
