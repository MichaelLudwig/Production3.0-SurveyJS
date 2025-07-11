import React, { useState } from 'react';
import { ValidationGroup } from '../types';
import './MA2Validation.css';

interface MA2ValidationProps {
  group: ValidationGroup;
  groupAnswers: { [key: string]: any };
  onMA2Validation: (groupName: string, ma2Data: { kuerzel: string; kommentar?: string }) => void;
  isCompleted: boolean;
  surveyData: any;
}

// Ergänze die Typdefinition für ValidationGroup (nur lokal, falls importiert, dann als Partial<...> nutzen)
interface ExtendedValidationGroup extends ValidationGroup {
  validationType?: string;
  signatureLabel?: string;
  showMA2?: boolean;
  ma2Label?: string;
}

// Hilfsfunktion für Matrix-Antworten
function renderMatrixAnswer(answer: any) {
  if (Array.isArray(answer) && answer.length === 1 && typeof answer[0] === 'object') {
    // matrixdynamic mit einer Zeile
    return Object.entries(answer[0])
      .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
      .join(', ');
  }
  if (typeof answer === 'object' && answer !== null) {
    // matrix mit mehreren Zeilen oder andere Objekte
    return Object.entries(answer)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }
  return typeof answer === 'boolean' ? (answer ? 'Ja' : 'Nein') : String(answer);
}

// Hilfsfunktion für Ja/Nein-Fragen
function isNoAnswer(value: any) {
  return value === false || value === "Nein" || value === "No";
}

// Mapping für Soll-Werte aus primaerPackmittel
const sollMapping: Record<string, string> = {
  produktbezeichnung_ist: "produktbezeichnung",
  artikelnummer_ist: "artikelNummer",
  charge_ist: "charge",
  anzahl_ist: "anzahl"
};

const MA2Validation: React.FC<MA2ValidationProps> = ({
  group,
  groupAnswers,
  onMA2Validation,
  isCompleted,
  surveyData
}) => {
  const [ma2Kuerzel, setMa2Kuerzel] = useState('');
  const [ma2Kommentar, setMa2Kommentar] = useState('');
  const [ma2MA2, setMa2MA2] = useState('');

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
    const sollWerte = surveyData?.primaerPackmittel || {};
    return (
      <div className="ma2-question-summary">
        <h4>Zu prüfende Antworten:</h4>
        <div className="question-answers">
          {group.questions.map(questionName => {
            const ist = groupAnswers[questionName];
            let isWarn = false;
            let soll = undefined;
            if (sollMapping[questionName] && sollWerte) {
              soll = sollWerte[sollMapping[questionName]];
              isWarn = ist !== undefined && soll !== undefined && ist !== soll;
            }
            // NEU: Ja/Nein-Fragen unabhängig vom Sollwert gelb markieren, wenn "Nein"
            if (isNoAnswer(ist)) {
              isWarn = true;
            }
            
            return (
              <div key={questionName} className={`question-answer-row${isWarn ? ' warn' : ''}`}>
                <span className="question-name">{questionName}:</span>
                <span className="answer-value">{renderMatrixAnswer(ist)}</span>
                {isWarn && soll !== undefined && <span className="warn-hint">Soll: {soll}</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const groupExt = group as ExtendedValidationGroup;
  const isSignatureValidation = groupExt.validationType === "signature";
  const isMA2Validation = groupExt.requiresMA2 === true;
  if (!isSignatureValidation && !isMA2Validation) {
    return null;
  }
  
  // Show component even if questions not answered, but disabled
  const isEnabled = allQuestionsAnswered;

  return (
    <div className={`ma2-validation-container ${!isEnabled ? 'disabled' : ''}`}>
      <div className="ma2-section-header">
        <h3>
          {isSignatureValidation
            ? `Signatur: ${groupExt.title}`
            : `Vier-Augen-Prinzip: ${groupExt.title}`}
        </h3>
        <p>
          {!isEnabled
            ? 'Bitte zuerst alle Fragen der linken Seite beantworten.'
            : isSignatureValidation
              ? 'Bitte die Signatur eintragen.'
              : 'Die Antworten müssen von einem zweiten Mitarbeiter geprüft werden.'
          }
        </p>
      </div>

      <div className={`ma2-validation-section ${ma2ValidationCompleted ? 'completed' : ''}`}>
        <div className="ma2-validation-form">
          {isEnabled && renderQuestionSummary()}
          
          <div className="ma2-form-group">
            <label htmlFor="ma2-kuerzel">
              {isSignatureValidation
                ? (groupExt.signatureLabel || "Signatur")
                : "Prüfendes Personal - Kürzel *"}
            </label>
            <input
              id="ma2-kuerzel"
              type="text"
              value={ma2Kuerzel}
              onChange={(e) => setMa2Kuerzel(e.target.value)}
              placeholder="z.B. AB"
              maxLength={30}
              required
              disabled={!isEnabled || ma2ValidationCompleted}
              readOnly={ma2ValidationCompleted}
            />
          </div>
          {isSignatureValidation && groupExt.showMA2 && (
            <div className="ma2-form-group">
              <label htmlFor="ma2-ma2">
                {groupExt.ma2Label || "Kürzel MA2"}
              </label>
              <input
                id="ma2-ma2"
                type="text"
                value={ma2MA2}
                onChange={(e) => setMa2MA2(e.target.value)}
                maxLength={30}
                required={false}
                disabled={!isEnabled || ma2ValidationCompleted}
                readOnly={ma2ValidationCompleted}
              />
            </div>
          )}

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