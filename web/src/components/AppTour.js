import React, { useEffect, useState } from 'react';
import { FiArrowLeft, FiArrowRight, FiCheck, FiX } from 'react-icons/fi';
import '../styles/App.css';

const tourSteps = [
  {
    eyebrow: 'A calmer way to catch up',
    title: 'Your conversations, made clearer.',
    description: 'Clarity turns selected messages and voice notes into easy-to-read summaries, with helpful context about tone and translation.',
    icon: '✦'
  },
  {
    eyebrow: '01 / Choose your sources',
    title: 'You stay in control.',
    description: 'Start by choosing the services you want to connect. Review each permission and only enable the sources you need.',
    icon: '⌘'
  },
  {
    eyebrow: '02 / Find what matters',
    title: 'Catch up on your terms.',
    description: 'Browse conversations, focus on unread messages, or select the messages you want to understand. Your selection drives the summary.',
    icon: '◉'
  },
  {
    eyebrow: '03 / Understand the whole conversation',
    title: 'Text, voice, and language.',
    description: 'Summarize written conversations or upload a voice note, then explore tone and translate the result into another language.',
    icon: '✧'
  }
];

function AppTour({ onClose }) {
  const [activeStep, setActiveStep] = useState(0);
  const isFinalStep = activeStep === tourSteps.length - 1;
  const step = tourSteps[activeStep];

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' && !isFinalStep) setActiveStep((current) => current + 1);
      if (event.key === 'ArrowLeft' && activeStep > 0) setActiveStep((current) => current - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStep, isFinalStep, onClose]);

  const finishTour = () => {
    window.localStorage.setItem('conversation-summarizer-tour-complete', 'true');
    onClose();
  };

  return (
    <div className="tour-backdrop" role="presentation">
      <section
        className="tour-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-description"
      >
        <button className="tour-close" type="button" onClick={finishTour} aria-label="Close app tour">
          <FiX />
        </button>
        <div className="tour-visual" aria-hidden="true">
          <span className="tour-orbit tour-orbit-one" />
          <span className="tour-orbit tour-orbit-two" />
          <span className="tour-glyph">{step.icon}</span>
          <span className="tour-spark tour-spark-one" />
          <span className="tour-spark tour-spark-two" />
        </div>
        <div className="tour-copy" key={activeStep}>
          <p className="tour-eyebrow">{step.eyebrow}</p>
          <h2 id="tour-title">{step.title}</h2>
          <p id="tour-description">{step.description}</p>
        </div>
        <div className="tour-footer">
          <div className="tour-progress" aria-label={`Step ${activeStep + 1} of ${tourSteps.length}`}>
            {tourSteps.map((tourStep, index) => (
              <span
                key={tourStep.eyebrow}
                className={`tour-progress-dot ${index === activeStep ? 'active' : ''} ${index < activeStep ? 'complete' : ''}`}
              />
            ))}
            <span className="tour-step-count">{String(activeStep + 1).padStart(2, '0')} / {String(tourSteps.length).padStart(2, '0')}</span>
          </div>
          <div className="tour-actions">
            {activeStep > 0 && (
              <button className="tour-back" type="button" onClick={() => setActiveStep((current) => current - 1)}>
                <FiArrowLeft aria-hidden="true" /> Back
              </button>
            )}
            <button
              className="tour-next"
              type="button"
              onClick={isFinalStep ? finishTour : () => setActiveStep((current) => current + 1)}
            >
              {isFinalStep ? <><FiCheck aria-hidden="true" /> Get started</> : <>Continue <FiArrowRight aria-hidden="true" /></>}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AppTour;
