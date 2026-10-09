import React, { useState } from 'react';
import { analyzeConversation, transcribeAudio } from '../services/groqAI';
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
      console.error('Groq conversation analysis failed:', error);
      setErrorMessage(error.message || 'Could not analyze this conversation. Please try again.');
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
      } catch (error) {
        console.error('Groq voice note transcription failed:', error);
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
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message || 'Could not read this text file.');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="summarize-page">
      <h2>Summarize & Analyze Conversations</h2>
      <p className="source-note">
        Conversation text and voice notes are sent securely to Groq for AI processing. Add your Groq API key as a server-side environment variable; it is never exposed in the browser.
      </p>
      <p className="model-note">
        Groq handles summaries, emotion insights, translations, and voice-note transcription. Audio uploads are limited to 4 MB for reliable deployment.
      </p>

      <div className="summarize-container">
        {/* Input Section */}
        <div className="input-section">
          <div className="input-methods">
            <div className="text-input">
              <h3>📝 Text Input</h3>
              <textarea
                placeholder="Paste conversation text here or upload a voice note..."
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  setSummary(null);
                  setEmotions(null);
                  setTranslation(null);
                }}
                rows={8}
              />
              <label className="text-import">
                Import conversation (.txt or .csv)
                <input type="file" accept=".txt,.csv,text/plain,text/csv" onChange={handleTextImport} />
              </label>
            </div>

            <div className="audio-input">
              <h3>🎙️ Voice Note</h3>
              <input
                type="file"
                accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/webm,audio/ogg,audio/flac,.mp3,.mp4,.m4a,.wav,.webm,.ogg,.flac"
                onChange={handleAudioUpload}
                className="audio-input-file"
              />
              <p className="audio-limit">Audio is sent to Groq for transcription. Files up to 4 MB are supported.</p>
              {audioFile && (
                <div className="audio-info">
                  ✓ {audioFile.name}
                </div>
              )}
              {transcript && (
                <div className="transcript-box">
                  <p className="transcript-label">Transcribed:</p>
                  <p>{transcript}</p>
                </div>
              )}
            </div>
          </div>

          <div className="translation-selector">
            <label>🌐 Translate to:</label>
            <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="analyze-btn" 
            onClick={handleSummarize}
            disabled={loading || !messageText.trim()}
          >
            {loading ? '⏳ Processing...' : '✨ Analyze & Summarize'}
          </button>
          {loading && (
            <div className="local-ai-progress" role="status" aria-live="polite">
              <span>{progressMessage || 'Processing with Groq…'}</span>
              {progressPercent !== null && (
                <progress max="100" value={progressPercent} aria-label="Model download progress" />
              )}
            </div>
          )}
          {errorMessage && <p className="analysis-error" role="alert">{errorMessage}</p>}
        </div>

        {/* Results Section */}
        {summary && (
          <div className="results-section">
            <div className="result-card summary-card">
              <h3>📋 Summary</h3>
              <p className="summary-text">{summary.summary}</p>
              
              <div className="key-points">
                <p className="points-title">Key Points:</p>
                <ul>
                  {summary.keyPoints.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>

              {summary.sentiment && <div className="sentiment-info">
                <p className="sentiment-label">Overall Sentiment:</p>
                <span className={`sentiment-badge ${summary.sentiment.overall}`}>
                  {summary.sentiment.overall.toUpperCase()}
                </span>
              </div>}
            </div>

            {emotions && emotions.length > 0 && (
              <div className="result-card emotions-card">
                <h3>😊 Emotion Analysis</h3>
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
                <h3>🌍 Translation</h3>
                <div className="translation-content">
                  <div className="original">
                    <p className="lang-label">Original (English)</p>
                    <p>{translation.original}</p>
                  </div>
                  <div className="translated">
                    <p className="lang-label">Translated ({translation.targetLanguage.toUpperCase()})</p>
                    <p>{translation.translated}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!summary && !loading && (
          <div className="placeholder">
            <p>👆 Enter text or upload a voice note to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SummarizePage;
