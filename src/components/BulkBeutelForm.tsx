import React, { useState, useEffect } from 'react';
import './BulkBeutelForm.css';

interface BulkBeutelFormProps {
  bulkBeutel: {
    id: number;
    gebindegroesse: number;
  };
  totalBulkBeutel: number;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const BulkBeutelForm: React.FC<BulkBeutelFormProps> = ({ bulkBeutel, totalBulkBeutel, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    bulk_nummer: bulkBeutel.id.toString(),
    soll_inhalt: bulkBeutel.gebindegroesse,
    ist_inhalt: '',
    anzahl_gebinde: '',
    blueten_unauffaellig: '',
    gebinde_korrekt_abgewogen: '',
    restmenge: '',
    aussortiertes_material: '',
    probenzug_ipk: '',
    bruch: '',
    erfasst_kuerzel: '',
    geprueft_kuerzel: '',
    schweissnaht_ok: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [warnings, setWarnings] = useState<{[key: string]: string}>({});

  // Prüfe, ob es sich um den ersten oder letzten Bulk Beutel handelt
  const isFirstBulkBeutel = bulkBeutel.id === 1;
  const isLastBulkBeutel = bulkBeutel.id === totalBulkBeutel;

  // Prüfe initial die Probenzug-Warnung
  useEffect(() => {
    if ((isFirstBulkBeutel || isLastBulkBeutel) && formData.probenzug_ipk === '0') {
      const warningMessage = isFirstBulkBeutel 
        ? 'Probe aus dem ersten Bulk Beutel entnehmen!' 
        : 'Probe aus dem letzten Bulk Beutel entnehmen!';
      
      setWarnings(prev => ({
        ...prev,
        probenzug_ipk: warningMessage
      }));
    }
  }, [isFirstBulkBeutel, isLastBulkBeutel, formData.probenzug_ipk]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Prüfe Probenzug-Warnung für den ersten oder letzten Bulk Beutel
    if (field === 'probenzug_ipk' && (isFirstBulkBeutel || isLastBulkBeutel)) {
      const probenzugValue = parseFloat(value) || 0;
      if (probenzugValue === 0) {
        const warningMessage = isFirstBulkBeutel 
          ? 'Probe aus dem ersten Bulk Beutel entnehmen!' 
          : 'Probe aus dem letzten Bulk Beutel entnehmen!';
        
        setWarnings(prev => ({
          ...prev,
          probenzug_ipk: warningMessage
        }));
      } else {
        setWarnings(prev => ({
          ...prev,
          probenzug_ipk: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.ist_inhalt) {
      newErrors.ist_inhalt = 'Dieses Feld ist erforderlich';
    }
    if (!formData.anzahl_gebinde) {
      newErrors.anzahl_gebinde = 'Dieses Feld ist erforderlich';
    }
    if (!formData.blueten_unauffaellig || formData.blueten_unauffaellig === '') {
      newErrors.blueten_unauffaellig = 'Dieses Feld ist erforderlich';
    }
    if (!formData.gebinde_korrekt_abgewogen || formData.gebinde_korrekt_abgewogen === '') {
      newErrors.gebinde_korrekt_abgewogen = 'Dieses Feld ist erforderlich';
    }
    if (!formData.restmenge) {
      newErrors.restmenge = 'Dieses Feld ist erforderlich';
    }
    if (!formData.aussortiertes_material) {
      newErrors.aussortiertes_material = 'Dieses Feld ist erforderlich';
    }
    if (!formData.probenzug_ipk) {
      newErrors.probenzug_ipk = 'Dieses Feld ist erforderlich';
    }
    if (!formData.bruch) {
      newErrors.bruch = 'Dieses Feld ist erforderlich';
    }
    if (!formData.erfasst_kuerzel) {
      newErrors.erfasst_kuerzel = 'Dieses Feld ist erforderlich';
    }
    if (!formData.geprueft_kuerzel) {
      newErrors.geprueft_kuerzel = 'Dieses Feld ist erforderlich';
    }
    if (!formData.schweissnaht_ok || formData.schweissnaht_ok === '') {
      newErrors.schweissnaht_ok = 'Dieses Feld ist erforderlich';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Konvertiere String-Werte zu Boolean für SurveyJS-Kompatibilität
      const processedData = {
        ...formData,
        blueten_unauffaellig: formData.blueten_unauffaellig === 'ja',
        gebinde_korrekt_abgewogen: formData.gebinde_korrekt_abgewogen === 'ja',
        schweissnaht_ok: formData.schweissnaht_ok === 'ja'
      };
      onSave(processedData);
    }
  };

  return (
    <div className="bulk-beutel-form">
      <div className="form-content">
        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Bulkbeutelnummer
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.bulk_nummer}
              disabled
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Soll-Inhalt Bulkbeutel (g)
            </label>
            <input
              type="number"
              className="form-input"
              value={formData.soll_inhalt}
              disabled
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Ist-Inhalt Bulkbeutel (g)
            </label>
            <input
              type="number"
              className={`form-input ${errors.ist_inhalt ? 'error' : ''}`}
              value={formData.ist_inhalt}
              onChange={(e) => handleInputChange('ist_inhalt', e.target.value)}
              placeholder="Geben Sie den tatsächlichen Inhalt ein"
            />
            {errors.ist_inhalt && <div className="error-message">{errors.ist_inhalt}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Anzahl gefüllter, verschweißter Gebinde
            </label>
            <input
              type="number"
              className={`form-input ${errors.anzahl_gebinde ? 'error' : ''}`}
              value={formData.anzahl_gebinde}
              onChange={(e) => handleInputChange('anzahl_gebinde', e.target.value)}
              placeholder="Anzahl der Gebinde"
            />
            {errors.anzahl_gebinde && <div className="error-message">{errors.anzahl_gebinde}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Blüten unauffällig?
            </label>
            <div className="toggle-switch">
              <button
                type="button"
                className={`toggle-option ${formData.blueten_unauffaellig === 'nein' ? 'active' : ''}`}
                onClick={() => handleInputChange('blueten_unauffaellig', 'nein')}
              >
                Nein
              </button>
              <button
                type="button"
                className={`toggle-option ${formData.blueten_unauffaellig === 'ja' ? 'active' : ''}`}
                onClick={() => handleInputChange('blueten_unauffaellig', 'ja')}
              >
                Ja
              </button>
            </div>
            {errors.blueten_unauffaellig && <div className="error-message">{errors.blueten_unauffaellig}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Gebinde korrekt abgewogen?
            </label>
            <div className="toggle-switch">
              <button
                type="button"
                className={`toggle-option ${formData.gebinde_korrekt_abgewogen === 'nein' ? 'active' : ''}`}
                onClick={() => handleInputChange('gebinde_korrekt_abgewogen', 'nein')}
              >
                Nein
              </button>
              <button
                type="button"
                className={`toggle-option ${formData.gebinde_korrekt_abgewogen === 'ja' ? 'active' : ''}`}
                onClick={() => handleInputChange('gebinde_korrekt_abgewogen', 'ja')}
              >
                Ja
              </button>
            </div>
            {errors.gebinde_korrekt_abgewogen && <div className="error-message">{errors.gebinde_korrekt_abgewogen}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Restmenge (g)
            </label>
            <input
              type="number"
              className={`form-input ${errors.restmenge ? 'error' : ''}`}
              value={formData.restmenge}
              onChange={(e) => handleInputChange('restmenge', e.target.value)}
              placeholder="Restmenge in Gramm"
            />
            {errors.restmenge && <div className="error-message">{errors.restmenge}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Aussortiertes Material (g)
            </label>
            <input
              type="number"
              className={`form-input ${errors.aussortiertes_material ? 'error' : ''}`}
              value={formData.aussortiertes_material}
              onChange={(e) => handleInputChange('aussortiertes_material', e.target.value)}
              placeholder="Aussortiertes Material in Gramm"
            />
            {errors.aussortiertes_material && <div className="error-message">{errors.aussortiertes_material}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Probenzug IPK (g)
            </label>
            <input
              type="number"
              className={`form-input ${errors.probenzug_ipk ? 'error' : ''} ${warnings.probenzug_ipk ? 'warning' : ''}`}
              value={formData.probenzug_ipk}
              onChange={(e) => handleInputChange('probenzug_ipk', e.target.value)}
              placeholder="Probenzug IPK in Gramm"
            />
            {errors.probenzug_ipk && <div className="error-message">{errors.probenzug_ipk}</div>}
            {warnings.probenzug_ipk && <div className="warning-message">{warnings.probenzug_ipk}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Bruch (g)
            </label>
            <input
              type="number"
              className={`form-input ${errors.bruch ? 'error' : ''}`}
              value={formData.bruch}
              onChange={(e) => handleInputChange('bruch', e.target.value)}
              placeholder="Bruch in Gramm"
            />
            {errors.bruch && <div className="error-message">{errors.bruch}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Erfasst (Kürzel)
            </label>
            <input
              type="text"
              className={`form-input ${errors.erfasst_kuerzel ? 'error' : ''}`}
              value={formData.erfasst_kuerzel}
              onChange={(e) => handleInputChange('erfasst_kuerzel', e.target.value)}
              placeholder="Ihr Kürzel"
            />
            {errors.erfasst_kuerzel && <div className="error-message">{errors.erfasst_kuerzel}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Geprüft (Kürzel)
            </label>
            <input
              type="text"
              className={`form-input ${errors.geprueft_kuerzel ? 'error' : ''}`}
              value={formData.geprueft_kuerzel}
              onChange={(e) => handleInputChange('geprueft_kuerzel', e.target.value)}
              placeholder="Kürzel des Prüfers"
            />
            {errors.geprueft_kuerzel && <div className="error-message">{errors.geprueft_kuerzel}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Schweißnaht des letzten Beutels ohne Beanstandung?
            </label>
            <div className="toggle-switch">
              <button
                type="button"
                className={`toggle-option ${formData.schweissnaht_ok === 'nein' ? 'active' : ''}`}
                onClick={() => handleInputChange('schweissnaht_ok', 'nein')}
              >
                Nein
              </button>
              <button
                type="button"
                className={`toggle-option ${formData.schweissnaht_ok === 'ja' ? 'active' : ''}`}
                onClick={() => handleInputChange('schweissnaht_ok', 'ja')}
              >
                Ja
              </button>
            </div>
            {errors.schweissnaht_ok && <div className="error-message">{errors.schweissnaht_ok}</div>}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Abbrechen
        </button>
        <button type="button" className="btn-submit" onClick={handleSubmit}>
          BulkBeutel abgefüllt
        </button>
      </div>
    </div>
  );
};

export default BulkBeutelForm; 