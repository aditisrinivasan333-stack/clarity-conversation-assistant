import React, { useState } from 'react';
import { analyzeConversation, transcribeAudio, translateText } from '../services/localAI';
import {
  extractDocuments,
  MAX_DOCUMENT_FILES,
  MAX_DOCUMENT_TEXT_LENGTH
} from '../services/documentExtraction';
import '../styles/SummarizePage.css';

function SummarizePage() {
  const [messageText, setMessageText] = useState('');
  const [summary, setSummary] = useState(null);
  const [emotions, setEmotions] = useState(null);
  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [progressMessage, setProgressMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [audioFile, setAudioFile] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [documents, setDocuments] = useState([]);

  const languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'hi', name: 'Hindi' }
  ];

  const handleSummarize = async () => {
    if (!messageText.trim()) {
      setErrorMessage('Paste or import conversation text before starting the analysis.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setProgressMessage('');
    setProgressPercent(null);
    try {
      const analysis = await analyzeConversation(messageText, (status) => {
        setProgressMessage(status.message || '');
        setProgressPercent(Number.isFinite(status.progress) ? status.progress : null);
      });
      setSummary(analysis);
      setEmotions(analysis.emotions);
      setTranslation(null);
    } catch (error) {
      console.error('Local conversation analysis failed:', error);
      setErrorMessage(error.message || 'Could not analyze this conversation. Please try again.');
    } finally {
      setLoading(false);
      setProgressMessage('');
      setProgressPercent(null);
    }
  };

  const handleTranslate = async () => {
    if (!messageText.trim()) return;
    setLoading(true);
    setErrorMessage('');
    setProgressMessage('');
    setProgressPercent(null);
    try {
      const translated = await translateText(messageText, targetLanguage, (status) => {
        setProgressMessage(status.message || '');
        setProgressPercent(Number.isFinite(status.progress) ? status.progress : null);
      });
      setTranslation({
        original: messageText,
        translated,
        targetLanguage
      });
    } catch (error) {
      console.error('Local text translation failed:', error);
      setErrorMessage(error.message || 'Could not translate this text. Please try again.');
    } finally {
      setLoading(false);
      setProgressMessage('');
      setProgressPercent(null);
    }
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setErrorMessage('');
      setTranscript(null);
      setAudioFile(file);
      setLoading(true);
      setProgressMessage('');
      setProgressPercent(null);

      try {
        const text = await transcribeAudio(file, (status) => {
          setProgressMessage(status.message || '');
          setProgressPercent(Number.isFinite(status.progress) ? status.progress : null);
        });
        setTranscript(text);
        setMessageText(text);
        setSummary(null);
        setEmotions(null);
        setTranslation(null);
        setDocuments([]);
      } catch (error) {
        console.error('Local voice note transcription failed:', error);
        setErrorMessage(error.message || 'Could not transcribe this voice note. Please try another file.');
      } finally {
        setLoading(false);
        setProgressMessage('');
        setProgressPercent(null);
      }
    }
  };

  const handleTextImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 1024 * 1024) {
        throw new Error('Text imports must be 1 MB or smaller.');
      }
      const text = await file.text();
      if (!text.trim()) throw new Error('This file does not contain any text.');
      setMessageText(text);
      setSummary(null);
      setEmotions(null);
      setTranslation(null);
      setDocuments([]);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message || 'Could not read this text file.');
    } finally {
      event.target.value = '';
    }
  };

  const handleDocumentUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    setLoading(true);
    setErrorMessage('');
    setProgressMessage('Preparing selected files locally…');
    setProgressPercent(null);
    try {
      const extractedDocuments = await extractDocuments(files, (status) => {
        setProgressMessage(status.message || '');
        setProgressPercent(Number.isFinite(status.progress) ? status.progress : null);
      });
      const text = extractedDocuments
        .map((document) => document.text)
        .join('\n\n');
      setMessageText(text);
      setDocuments(extractedDocuments.map(({ name, type }) => ({ name, type })));
      setSummary(null);
      setEmotions(null);
      setTranslation(null);
      setAudioFile(null);
      setTranscript(null);
    } catch (error) {
      console.error('Local document extraction failed:', error);
      setErrorMessage(error.message || 'Could not extract text from the selected files.');
    } finally {
      setLoading(false);
      setProgressMessage('');
      setProgressPercent(null);
    }
  };

  return (
    <div className="summarize-page">
      <header className="summarize-heading">
        <p className="page-eyebrow">CLARITY <span> / </span> PRIVATE BY DESIGN</p>
        <h2>Make space for what matters.</h2>
        <p className="page-intro">
          Bring a conversation, document, or voice note. Clarity will help you find the important parts.
        </p>
        <div className="privacy-note">
          <span className="privacy-mark" aria-hidden="true">✓</span>
          <p>
            <strong>Your files stay in this browser.</strong> They are processed here, not uploaded to an AI server.
            <span className="privacy-detail"> Public model and runtime assets may download when needed.</span>
          </p>
        </div>
      </header>

      <div className="summarize-container">
        <section className="input-section" aria-labelledby="source-heading">
          <div className="section-heading">
            <div>
              <p className="section-kicker">01 <span>·</span> YOUR SOURCE</p>
              <h3 id="source-heading">Start with your content</h3>
              <p>Paste a conversation or choose a file to get started.</p>
            </div>
            <span className="private-chip"><span aria-hidden="true">✓</span> On-device</span>
          </div>

          <div className="text-input">
            <label className="field-label" htmlFor="conversation-text">Conversation text</label>
              <textarea
                id="conversation-text"
                placeholder="Paste a conversation, meeting notes, or any text you would like to understand better…"
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  setSummary(null);
                  setEmotions(null);
                  setTranslation(null);
                  setDocuments([]);
                }}
                rows={7}
              />
              <label className="text-import">
                <span>Prefer a text file?</span>
                <span className="text-import-action">Browse .txt or .csv</span>
                <input type="file" accept=".txt,.csv,text/plain,text/csv" onChange={handleTextImport} />
              </label>
          </div>

          <div className="file-inputs">
            <div className="document-input upload-card">
              <div className="upload-icon document-icon" aria-hidden="true">PDF</div>
              <div className="upload-copy">
                <h4>PDFs & images</h4>
                <p>Extract selectable text or recognize text in images.</p>
              </div>
              <label className="file-picker">
                <span>Choose files</span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff,application/pdf,image/png,image/jpeg,image/webp,image/bmp,image/tiff"
                multiple
                onChange={handleDocumentUpload}
                disabled={loading}
                aria-label="Choose PDFs and images for local text extraction"
              />
              </label>
              <details className="upload-details">
                <summary>File limits & supported formats</summary>
                <p>
                  Up to {MAX_DOCUMENT_FILES} files; 10 MB each, 25 MB total, 30 PDF pages, and {MAX_DOCUMENT_TEXT_LENGTH.toLocaleString()} extracted characters. Supports PDF, PNG, JPEG, WebP, BMP, and TIFF. Scanned PDFs without selectable text are not OCRed; upload page images instead.
                </p>
              </details>
              {documents.length > 0 && (
                <ul className="document-list">
                  {documents.map((document) => (
                    <li key={`${document.name}-${document.type}`}>
                      <span className="file-check" aria-hidden="true">✓</span>
                      <span className="file-name">{document.name}</span>
                      <span className="file-type">{document.type}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="audio-input upload-card">
              <div className="upload-icon audio-icon" aria-hidden="true">♪</div>
              <div className="upload-copy">
                <h4>Voice note</h4>
                <p>Turn a short recording into editable text.</p>
              </div>
              <label className="file-picker">
                <span>{audioFile ? 'Choose another' : 'Choose audio'}</span>
                <input
                type="file"
                accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/webm,audio/ogg,audio/flac,.mp3,.mp4,.m4a,.wav,.webm,.ogg,.flac"
                onChange={handleAudioUpload}
                className="audio-input-file"
                disabled={loading}
                aria-label="Choose an audio file for local transcription"
              />
              </label>
              <p className="audio-limit">Up to 25 MB and 10 minutes · MP3, WAV, M4A, WebM</p>
              {audioFile && (
                <div className="audio-info">
                  <span className="file-check" aria-hidden="true">✓</span>
                  <span className="file-name">{audioFile.name}</span>
                </div>
              )}
              {transcript && (
                <div className="transcript-box">
                  <p className="transcript-label">TRANSCRIPT</p>
                  <p>{transcript}</p>
                </div>
              )}
            </div>
          </div>

          <div className="translation-selector">
            <label htmlFor="translation-language">Translate into</label>
            <select id="translation-language" value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <p className="translation-limit">Up to 5,000 characters per translation.</p>
          </div>
          <div className="text-actions">
            <button
              className="analyze-btn"
              onClick={handleSummarize}
              disabled={loading || !messageText.trim()}
            >
              {loading ? 'Working locally…' : 'Analyze & summarize'}
            </button>
            <button
              className="translate-btn"
              onClick={handleTranslate}
              disabled={loading || !messageText.trim()}
            >
              Translate text
            </button>
          </div>
          {loading && (
            <div className="local-ai-progress" role="status" aria-live="polite">
              <span>{progressMessage || 'Processing on this device…'}</span>
              {progressPercent !== null && (
                <progress max="100" value={progressPercent} aria-label="Local processing progress" />
              )}
            </div>
          )}
          {errorMessage && <p className="analysis-error" role="alert">{errorMessage}</p>}
        </section>

        {(summary || translation) && (
          <section className="results-section" aria-label="Your results">
            <div className="section-heading result-heading">
              <div>
                <p className="section-kicker">02 <span>·</span> YOUR TAKEAWAY</p>
                <h3>A clearer picture</h3>
              </div>
            </div>
            {summary && (
              <div className="result-card summary-card">
                <h3>Summary</h3>
                <p className="summary-text">{summary.summary}</p>

                {summary.keyPoints.length > 0 && (
                  <div className="key-points">
                    <p className="points-title">Key Points:</p>
                    <ul>
                      {summary.keyPoints.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.sentiment && <div className="sentiment-info">
                  <p className="sentiment-label">Conversation tone</p>
                  <span className={`sentiment-badge ${summary.sentiment.overall}`}>
                    {summary.sentiment.overall.toUpperCase()}
                  </span>
                </div>}
              </div>
            )}

            {summary && emotions && emotions.length > 0 && (
              <div className="result-card emotions-card">
                <h3>Overall tone</h3>
                <div className="emotions-list">
                  {emotions.map((emotion, idx) => (
                    <div key={idx} className="emotion-item">
                      <span className="emotion-type">{emotion.emotion}</span>
                      <div className="emotion-bar">
                        <div 
                          className="emotion-fill" 
                          style={{ width: `${emotion.intensity}%` }}
                        />
                      </div>
                      <span className="emotion-intensity">{emotion.intensity.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {translation && (
              <div className="result-card translation-card">
                <h3>Translation</h3>
                <div className="translation-content">
                  <div className="original">
                    <p className="lang-label">Original text</p>
                    <p>{translation.original}</p>
                  </div>
                  <div className="translated">
                    <p className="lang-label">
                      Translated ({languages.find((language) => language.code === translation.targetLanguage)?.name})
                    </p>
                    <p>{translation.translated}</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {!summary && !translation && !loading && (
          <aside className="placeholder" aria-label="How to get started">
            <span className="placeholder-mark" aria-hidden="true">C</span>
            <p className="placeholder-kicker">A calmer way to catch up</p>
            <h3>Your conversations, made clearer.</h3>
            <p>Start with text, a document, or a voice note. Your results will appear here, ready to review.</p>
            <div className="placeholder-steps">
              <span><b>1</b> Add your content</span>
              <span><b>2</b> Choose an action</span>
              <span><b>3</b> Review your takeaway</span>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default SummarizePage;
