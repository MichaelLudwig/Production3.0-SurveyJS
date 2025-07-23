import React, { useState } from 'react';
import { ValidationGroup } from '../types';
import './MA2Validation.css';

interface MA2ValidationProps {
  group: ValidationGroup;
  groupAnswers: { [key: string]: any };
  onMA2Validation: (groupName: string, ma2Data: { kuerzel: string; kommentar?: string; pruefungOK?: boolean }) => void;
  isCompleted: boolean;
  surveyData: any;
  validationData?: any; // NEU: Validierungsdaten für abgeschlossene Validierungen
}

// Kein Extended Interface mehr nötig - ValidationGroup ist jetzt standardisiert

// Hilfsfunktion für Matrix-Antworten
function renderMatrixAnswer(answer: any) {
  if (Array.isArray(answer) && answer.length > 0) {
    // matrixdynamic mit mehreren Zeilen
    if (answer.length === 1 && typeof answer[0] === 'object') {
      // Eine Zeile
      return Object.entries(answer[0])
        .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
        .join(', ');
    } else {
      // Mehrere Zeilen - für probegebinde_liste speziell formatieren
      return answer.map((row: any, index: number) => {
        if (typeof row === 'object' && row !== null) {
          const rowValues = Object.entries(row)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          return `Zeile ${index + 1}: ${rowValues}`;
        }
        return `Zeile ${index + 1}: ${row}`;
      }).join(' | ');
    }
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
// Mapping für Soll-Werte aus Verschweißprogramm
const sollMappingVerschweiss: Record<string, string> = {
  verschweiss_programm_ist: "programm"
};
// Mapping für Soll-Werte aus Bulkmaterial
const sollMappingBulk: Record<string, string> = {
  produktbezeichnung_bulk_ist: "produktbezeichnung",
  artikelnr_bulk_ist: "artikelNummer",
  charge_bulk_ist: "charge",
  verfall_bulk_ist: "verfall"
};
// Mapping für Soll-Werte aus Schablonen
const sollMappingSchablonen: Record<string, string> = {
  schablonen_eq_ist: "eqNummer",
  schablonen_charge_ist: "charge",
  schablonen_anzahl_ist: "anzahl"
};

const MA2Validation: React.FC<MA2ValidationProps> = ({
  group,
  groupAnswers,
  onMA2Validation,
  isCompleted,
  surveyData,
  validationData
}) => {
  const [ma2Kuerzel, setMa2Kuerzel] = useState('');
  const [ma2Kommentar, setMa2Kommentar] = useState('');
  const [ma2PruefungOK, setMa2PruefungOK] = useState<boolean>(true);
  const [showKuerzelError, setShowKuerzelError] = useState(false);
  const [kuerzelErrorHighlight, setKuerzelErrorHighlight] = useState(false);

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
  console.log(`Validation Type:`, group.validationType);

  // Check if MA2 validation is already completed
  const ma2ValidationCompleted = isCompleted;
  
  // Lade validierte Daten, falls vorhanden
  const validatedData = validationData?.[group.name];
  const validatedAnswers = validatedData?.validatedAnswers;
  const ma2KommentarValidated = validatedData?.ma2Kommentar;
  const ma2KuerzelValidated = validatedData?.ma2Kuerzel;
  const validationOKValidated = validatedData?.validationOK;
  const ma2TimestampValidated = validatedData?.ma2Timestamp;

  const handleMA2Submit = () => {
    if (!ma2Kuerzel.trim()) {
      setShowKuerzelError(true);
      setKuerzelErrorHighlight(true);
      setTimeout(() => setKuerzelErrorHighlight(false), 2000);
      return;
    }
    setShowKuerzelError(false);
    setKuerzelErrorHighlight(false);
    if (ma2PruefungOK === null) {
      alert('Bitte geben Sie an, ob die Prüfung OK ist.');
      return;
    }
    onMA2Validation(group.name, {
      kuerzel: ma2Kuerzel.trim(),
      kommentar: ma2Kommentar.trim() || undefined,
      pruefungOK: ma2PruefungOK
    });
    // Don't clear the fields - sie sollten sichtbar bleiben
  };

  const renderQuestionSummary = () => {
    // Erkenne, ob es sich um die Bulkmaterial-Seite, Schablonen-Seite oder Verschweißprogramm-Seite handelt
    const isBulk = group.name === "materialbereitstellung_bulk";
    const isSchablonen = group.name === "zubehör_schablonen";
    const isVerschweiss = group.name === "vorbereitung_schweissgeraet";
    let sollWerte: any = {};
    let mapping: Record<string, string> = {};
    if (isBulk) {
      sollWerte = surveyData?.eingangsmaterial || {};
      mapping = sollMappingBulk;
    } else if (isSchablonen) {
      sollWerte = surveyData?.schablone || {};
      mapping = sollMappingSchablonen;
    } else if (isVerschweiss) {
      sollWerte = surveyData?.verschweissProgramm || {};
      mapping = sollMappingVerschweiss;
    } else {
      sollWerte = surveyData?.primaerPackmittel || {};
      mapping = sollMapping;
    }
    
    // Verwende validierte Antworten, falls vorhanden, sonst aktuelle Antworten
    const answersToShow = validatedAnswers || groupAnswers;
    
    return (
      <div className="ma2-question-summary">
        <h4>Zu prüfende Antworten:</h4>
        {validatedAnswers && (
          <div className="validation-info">
            <p><strong>✓ Validierte Antworten vom {new Date(ma2TimestampValidated).toLocaleString('de-DE')}</strong></p>
          </div>
        )}
        <div className="question-answers">
          {group.questions.map(questionName => {
            const ist = answersToShow[questionName];
            // NEU: MatrixDropdown speziell behandeln
            if (ist && typeof ist === 'object' && !Array.isArray(ist)) {
              // MatrixDropdown: Jede Zelle als eigene Zeile anzeigen
              return Object.entries(ist).map(([rowKey, rowValue]) => {
                if (typeof rowValue === 'object' && rowValue !== null) {
                  return Object.entries(rowValue).map(([colKey, cellValue]) => {
                    // Optional: Klartext für Zeile/Spalte
                    const label = `${questionName} (${rowKey}, ${colKey})`;
                    const isWarn = isNoAnswer(cellValue);
                    return (
                      <div key={`${questionName}_${rowKey}_${colKey}`} className={`question-answer-row${isWarn ? ' warn' : ''}`}>
                        <span className="question-name">{label}:</span>
                        <span className="answer-value">{renderMatrixAnswer(cellValue)}</span>
                      </div>
                    );
                  });
                }
                // Falls kein Objekt (sollte nicht vorkommen)
                return null;
              });
            }
            // Standard: Einzelwert wie bisher
            let isWarn = false;
            let soll = undefined;
            if (mapping[questionName] && sollWerte) {
              soll = sollWerte[mapping[questionName]];
              isWarn = ist !== undefined && soll !== undefined && ist !== soll;
            }
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

  const isSignatureValidation = group.validationType === "signature";
  const isMA2Validation = group.validationType === "validation";
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
            ? `Signatur: ${group.title}`
            : `Vier-Augen-Prinzip: ${group.title}`}
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

          {/* Toggle-Switch für Prüfung OK (über Kommentar) */}
          <div className="ma2-form-group">
            <label htmlFor="ma2-pruefung-ok-switch" style={{marginBottom: '0.5rem', display: 'block'}}>Prüfung OK *</label>
            <label className="switch">
              <input
                id="ma2-pruefung-ok-switch"
                type="checkbox"
                checked={ma2ValidationCompleted ? validationOKValidated : ma2PruefungOK === true}
                onChange={e => setMa2PruefungOK(e.target.checked)}
                disabled={!isEnabled || ma2ValidationCompleted}
              />
              <span className="slider round">
                <span className="switch-label switch-label-no">Nein</span>
                <span className="switch-label switch-label-yes">Ja</span>
              </span>
            </label>
          </div>

          <div className="ma2-form-group">
            <label htmlFor="ma2-kuerzel">
              {group.label}
            </label>
            <input
              id="ma2-kuerzel"
              type="text"
              value={ma2ValidationCompleted ? ma2KuerzelValidated : ma2Kuerzel}
              onChange={(e) => {
                setMa2Kuerzel(e.target.value);
                if (showKuerzelError && e.target.value.trim()) setShowKuerzelError(false);
              }}
              placeholder="z.B. AB"
              maxLength={30}
              required
              disabled={!isEnabled || ma2ValidationCompleted}
              readOnly={ma2ValidationCompleted}
            />
            {showKuerzelError && (
              <div className={`ma2-kuerzel-error${kuerzelErrorHighlight ? ' highlight' : ''}`}>
                <span className="icon">⚠️</span>
                <span><strong>Bitte geben Sie Ihr Kürzel ein.</strong></span>
              </div>
            )}
          </div>

          <div className="ma2-form-group">
            <label htmlFor="ma2-kommentar">Kommentar (optional)</label>
            <textarea
              id="ma2-kommentar"
              value={ma2ValidationCompleted ? ma2KommentarValidated : ma2Kommentar}
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