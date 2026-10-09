import React, { useState } from 'react';
import { FiExternalLink, FiGlobe, FiZap } from 'react-icons/fi';
import { analyzeConversation, translateText } from '../services/groqAI';
import '../styles/MessageList.css';

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

const searchEngines = {
  google: (query) => `https://www.google.com/search?q=${query}`,
  bing: (query) => `https://www.bing.com/search?q=${query}`,
  duckduckgo: (query) => `https://duckduckgo.com/?q=${query}`
};

function MessageList({ messages }) {
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [action, setAction] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [searchEngine, setSearchEngine] = useState('google');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [progressPercent, setProgressPercent] = useState(null);
  const selectedMessages = messages.filter((message) => selectedMessageIds.includes(message.id));
  const [highlightedText, setHighlightedText] = useState('');
  const selectedText = highlightedText || selectedMessages.map((message) => message.content).join('\n');

  React.useEffect(() => {
    const trackHighlightedMessageText = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) return;

      const anchor = selection.anchorNode?.parentElement?.closest('.message-item .text');
      const focus = selection.focusNode?.parentElement?.closest('.message-item .text');
      setHighlightedText(anchor && focus ? selection.toString().trim() : '');
    };

    document.addEventListener('selectionchange', trackHighlightedMessageText);
    return () => document.removeEventListener('selectionchange', trackHighlightedMessageText);
  }, []);

  const handleActionChange = (event) => {
    setAction(event.target.value);
    setResult(null);
    setError('');
    setProgress('');
    setProgressPercent(null);
  };

  const handleAction = async () => {
    if (!selectedText) return;
    setError('');
    setResult(null);
    setProgress('');
    setProgressPercent(null);

    if (action === 'search') {
      const query = encodeURIComponent(`meaning of ${selectedText}`);
      window.open(searchEngines[searchEngine](query), '_blank', 'noopener,noreferrer');
      return;
    }

    setLoading(true);
    try {
      if (action === 'summary') {
        const data = await analyzeConversation(selectedText, (status) => {
          setProgress(status.message || '');
          setProgressPercent(Number.isFinite(status.progress) ? status.progress : null);
        });
        setResult({ type: action, data });
      } else if (action === 'translation') {
        const translated = await translateText(selectedText, targetLanguage, (status) => {
          setProgress(status.message || '');
          setProgressPercent(Number.isFinite(status.progress) ? status.progress : null);
        });
        setResult({ type: action, data: { translated } });
      }
    } catch (requestError) {
      console.error('Unable to process selected messages with Groq:', requestError);
      setError(requestError.message || 'Could not process the selected text. Please try again.');
    } finally {
      setLoading(false);
      setProgress('');
      setProgressPercent(null);
    }
  };

  const toggleMessageSelection = (messageId) => {
    if (selectedMessageIds.includes(messageId)) {
      setSelectedMessageIds(selectedMessageIds.filter(id => id !== messageId));
    } else {
      setSelectedMessageIds([...selectedMessageIds, messageId]);
    }
  };

  const toggleAllMessages = () => {
    if (selectedMessageIds.length === messages.length) {
      setSelectedMessageIds([]);
    } else {
      setSelectedMessageIds(messages.map(m => m.id));
    }
  };

  if (messages.length === 0) {
    return (
      <div className="message-list-empty">
        <p>No messages found. Try selecting a different app or time period.</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      <div className="list-header">
        <label className="select-all">
          <input
            type="checkbox"
            checked={selectedMessageIds.length === messages.length && messages.length > 0}
            onChange={toggleAllMessages}
          />
          Select All ({selectedMessageIds.length}/{messages.length})
        </label>
      </div>

      {(selectedMessages.length > 0 || highlightedText) && (
        <section className="message-actions" aria-label="Actions for selected messages">
          <div className="message-actions-heading">
            <span className="message-actions-icon" aria-hidden="true"><FiZap /></span>
            <div>
              <strong>{highlightedText ? 'Highlighted text' : 'Selected messages'}</strong>
              <span>
                {highlightedText
                  ? `${highlightedText.length} characters selected`
                  : `${selectedMessages.length} message${selectedMessages.length === 1 ? '' : 's'} ready`}
              </span>
            </div>
            {highlightedText && (
              <button
                className="clear-highlight"
                type="button"
                onClick={() => setHighlightedText('')}
              >
                Use checked messages
              </button>
            )}
          </div>
          <p className="message-action-disclosure">
            Summaries and translations send the selected text to Groq for processing.
          </p>
          <div className="message-actions-controls">
            <label className="message-action-select">
              <span className="sr-only">Choose an action</span>
              <select value={action} onChange={handleActionChange}>
                <option value="">Choose an action…</option>
                <option value="summary">Quick summary</option>
                <option value="translation">Translate text</option>
                <option value="search">Search meaning in browser</option>
              </select>
            </label>
            {action === 'translation' && (
              <label className="message-action-select">
                <span className="sr-only">Translation language</span>
                <select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)}>
                  {languages.map((language) => (
                    <option key={language.code} value={language.code}>{language.name}</option>
                  ))}
                </select>
              </label>
            )}
            {action === 'search' && (
              <label className="message-action-select">
                <span className="sr-only">Search engine</span>
                <select value={searchEngine} onChange={(event) => setSearchEngine(event.target.value)}>
                  <option value="google">Google</option>
                  <option value="bing">Bing</option>
                  <option value="duckduckgo">DuckDuckGo</option>
                </select>
              </label>
            )}
            <button
              className="message-action-submit"
              type="button"
              onClick={handleAction}
              disabled={!action || loading}
            >
              {loading ? 'Working…' : action === 'search' ? <><FiExternalLink aria-hidden="true" /> Search</> : action === 'translation' ? <><FiGlobe aria-hidden="true" /> Translate</> : 'Summarize'}
            </button>
          </div>
          {loading && (
            <div className="local-ai-progress" role="status" aria-live="polite">
              <span>{progress || 'Processing with Groq…'}</span>
              {progressPercent !== null && (
                <progress max="100" value={progressPercent} aria-label="Model download progress" />
              )}
            </div>
          )}
          {error && <p className="message-action-error" role="alert">{error}</p>}
          {result?.type === 'summary' && (
            <div className="message-action-result" role="status">
              <strong>Quick summary</strong>
              <p>{result.data.summary}</p>
              {result.data.keyPoints?.length > 0 && (
                <ul>{result.data.keyPoints.map((point, index) => <li key={`${index}-${point}`}>{point}</li>)}</ul>
              )}
            </div>
          )}
          {result?.type === 'translation' && (
            <div className="message-action-result" role="status">
              <strong>Translation · {languages.find((language) => language.code === targetLanguage)?.name}</strong>
              <p>{result.data.translated}</p>
            </div>
          )}
        </section>
      )}

      <div className="messages">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message-item ${selectedMessageIds.includes(message.id) ? 'selected' : ''}`}
          >
            <input
              type="checkbox"
              checked={selectedMessageIds.includes(message.id)}
              onChange={() => toggleMessageSelection(message.id)}
              className="message-checkbox"
            />
            <div className="message-content">
              <div className="message-header">
                <span className="sender">{message.sender}</span>
                <span className="timestamp">
                  {new Date(message.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text">{message.content}</p>
              {!message.read && <span className="unread-badge">NEW</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MessageList;
