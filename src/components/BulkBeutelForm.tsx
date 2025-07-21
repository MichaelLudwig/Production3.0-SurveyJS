import React, { useState, useEffect } from 'react';
import './BulkBeutelForm.css';

interface BulkBeutelFormProps {
  bulkBeutel: {
    id: number;
    gebindegroesse: number;
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

const BulkBeutelForm: React.FC<BulkBeutelFormProps> = ({ bulkBeutel, onSave, onCancel }) => {
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
    erfasst_kuerzel: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

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
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.ist_inhalt) {
      newErrors.ist_inhalt = 'Dieses Feld ist erforderlich';
    }
    if (!formData.anzahl_gebinde) {
      newErrors.anzahl_gebinde = 'Dieses Feld ist erforderlich';
    }
    if (!formData.blueten_unauffaellig) {
      newErrors.blueten_unauffaellig = 'Dieses Feld ist erforderlich';
    }
    if (!formData.gebinde_korrekt_abgewogen) {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="bulk-beutel-form">
      <div className="form-content">
        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Bulkbeutelnummer *
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
              Soll-Inhalt Bulkbeutel (g) *
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
              Ist-Inhalt Bulkbeutel (g) *
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
              Anzahl gefüllter, verschweißter Gebinde *
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
              Blüten unauffällig? *
            </label>
            <select
              className={`form-input ${errors.blueten_unauffaellig ? 'error' : ''}`}
              value={formData.blueten_unauffaellig}
              onChange={(e) => handleInputChange('blueten_unauffaellig', e.target.value)}
            >
              <option value="">Bitte wählen</option>
              <option value="ja">Ja</option>
              <option value="nein">Nein</option>
            </select>
            {errors.blueten_unauffaellig && <div className="error-message">{errors.blueten_unauffaellig}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Gebinde korrekt abgewogen? *
            </label>
            <select
              className={`form-input ${errors.gebinde_korrekt_abgewogen ? 'error' : ''}`}
              value={formData.gebinde_korrekt_abgewogen}
              onChange={(e) => handleInputChange('gebinde_korrekt_abgewogen', e.target.value)}
            >
              <option value="">Bitte wählen</option>
              <option value="ja">Ja</option>
              <option value="nein">Nein</option>
            </select>
            {errors.gebinde_korrekt_abgewogen && <div className="error-message">{errors.gebinde_korrekt_abgewogen}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Restmenge (g) *
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
              Aussortiertes Material (g) *
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
              Probenzug IPK (g) *
            </label>
            <input
              type="number"
              className={`form-input ${errors.probenzug_ipk ? 'error' : ''}`}
              value={formData.probenzug_ipk}
              onChange={(e) => handleInputChange('probenzug_ipk', e.target.value)}
              placeholder="Probenzug IPK in Gramm"
            />
            {errors.probenzug_ipk && <div className="error-message">{errors.probenzug_ipk}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Bruch (g) *
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
              Erfasst (Kürzel) *
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