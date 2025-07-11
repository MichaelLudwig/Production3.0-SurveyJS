import React, { useState } from 'react';
import { ValidationGroup } from '../types';
import './MA2Validation.css';

interface MA2ValidationProps {
  group: ValidationGroup;
  groupAnswers: { [key: string]: any };
  onMA2Validation: (groupName: string, ma2Data: { kuerzel: string; kommentar?: string }) => void;
  isCompleted: boolean;
}

const MA2Validation: React.FC<MA2ValidationProps> = ({
  group,
  groupAnswers,
  onMA2Validation,
  isCompleted
}) => {
  const [ma2Kuerzel, setMa2Kuerzel] = useState('');
  const [ma2Kommentar, setMa2Kommentar] = useState('');

  // Check if all questions in group are answered
  const allQuestionsAnswered = group.questions.every(
    questionName => groupAnswers[questionName] !== undefined && groupAnswers[questionName] !== ''
  );
  
  // Debug logging
  console.log(`MA2 Validation for ${group.title}:`);
  console.log(`Group questions:`, group.questions);
  console.log(`Group answers:`, groupAnswers);
  console.log(`All questions answered:`, allQuestionsAnswered);
  console.log(`Is completed:`, isCompleted);
  console.log(`Requires MA2:`, group.requiresMA2);

  // Check if MA2 validation is already completed
  const ma2ValidationCompleted = isCompleted;

  const handleMA2Submit = () => {
    if (!ma2Kuerzel.trim()) {
      alert('Bitte geben Sie Ihr Kürzel ein.');
      return;
    }

    onMA2Validation(group.name, {
      kuerzel: ma2Kuerzel.trim(),
      kommentar: ma2Kommentar.trim() || undefined
    });

    // Don't clear the fields - they should remain visible after completion
  };

  const renderQuestionSummary = () => {
    return (
      <div className="ma2-question-summary">
        <h4>Zu prüfende Antworten:</h4>
        <div className="question-answers">
          {group.questions.map(questionName => {
            const answer = groupAnswers[questionName];
            if (answer === undefined || answer === '') return null;
            
            return (
              <div key={questionName} className="question-answer-row">
                <span className="question-name">{questionName}:</span>
                <span className="answer-value">
                  {typeof answer === 'boolean' ? (answer ? 'Ja' : 'Nein') : String(answer)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!group.requiresMA2) {
    return null;
  }
  
  // Show component even if questions not answered, but disabled
  const isEnabled = allQuestionsAnswered;

  return (
    <div className={`ma2-validation-container ${!isEnabled ? 'disabled' : ''}`}>
      <div className="ma2-section-header">
        <h3>Vier-Augen-Prinzip: {group.title}</h3>
        <p>
          {!isEnabled 
            ? 'Bitte zuerst alle Fragen der linken Seite beantworten.'
            : 'Die Antworten müssen von einem zweiten Mitarbeiter geprüft werden.'
          }
        </p>
      </div>

      <div className={`ma2-validation-section ${ma2ValidationCompleted ? 'completed' : ''}`}>
        <div className="ma2-validation-form">
          {isEnabled && renderQuestionSummary()}
          
          <div className="ma2-form-group">
            <label htmlFor="ma2-kuerzel">Prüfendes Personal - Kürzel *</label>
            <input
              id="ma2-kuerzel"
              type="text"
              value={ma2Kuerzel}
              onChange={(e) => setMa2Kuerzel(e.target.value)}
              placeholder="z.B. AB"
              maxLength={5}
              required
              disabled={!isEnabled || ma2ValidationCompleted}
              readOnly={ma2ValidationCompleted}
            />
          </div>

          <div className="ma2-form-group">
            <label htmlFor="ma2-kommentar">Kommentar (optional)</label>
            <textarea
              id="ma2-kommentar"
              value={ma2Kommentar}
              onChange={(e) => setMa2Kommentar(e.target.value)}
              placeholder="Zusätzliche Bemerkungen zur Prüfung..."
              rows={3}
              disabled={!isEnabled || ma2ValidationCompleted}
              readOnly={ma2ValidationCompleted}
            />
          </div>

          <div className="ma2-form-actions">
            {ma2ValidationCompleted ? (
              <div className="completion-badge">✓ Prüfung abgeschlossen</div>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={handleMA2Submit}
                disabled={!isEnabled}
              >
                Prüfung bestätigen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MA2Validation;