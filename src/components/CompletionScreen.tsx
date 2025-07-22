import React, { useState } from 'react';
import { ExportData } from '../types';
import { exportToJSON, exportToPDF } from '../utils/exportUtils';
import './CompletionScreen.css';

interface CompletionScreenProps {
  exportData: ExportData;
  onStartNew: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({
  exportData,
  onStartNew
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');
  const [productionLeaderNotified, setProductionLeaderNotified] = useState(false);

  const handleJSONExport = async () => {
    setIsExporting(true);
    setExportStatus('JSON-Export wird erstellt...');
    
    try {
      await exportToJSON(exportData);
      setExportStatus('JSON-Export erfolgreich heruntergeladen.');
    } catch (error) {
      setExportStatus('Fehler beim JSON-Export: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePDFExport = async () => {
    setIsExporting(true);
    setExportStatus('PDF-Export wird erstellt...');
    
    try {
      await exportToPDF(exportData);
      setExportStatus('PDF-Export erfolgreich heruntergeladen.');
    } catch (error) {
      setExportStatus('Fehler beim PDF-Export: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleNotifyProductionLeader = () => {
    setProductionLeaderNotified(true);
    setExportStatus('Die Produktionsleitung wurde über den Abschluss informiert.');
    
    // In a real application, this would send an actual notification
    // For MVP, we just show a confirmation message
    setTimeout(() => {
      setExportStatus('');
    }, 3000);
  };

  const handleStartNew = () => {
    if (window.confirm('Möchten Sie einen neuen Produktionsauftrag starten? Alle aktuellen Daten werden zurückgesetzt.')) {
      onStartNew();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE');
  };

  const getParticipatingEmployees = () => {
    const employees = exportData.answers.mitarbeiter_liste || [];
    return employees.map((emp: any) => `${emp.name} (${emp.kuerzel})`).join(', ');
  };

  return (
    <div className="completion-screen">
      <div className="completion-header">
        <div className="completion-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
        </div>
        <h1>Herstellung abgeschlossen</h1>
        <p>Der Produktionsprozess wurde erfolgreich dokumentiert.</p>
      </div>

      <div className="completion-content">
        <div className="completion-summary">
          <h2>Zusammenfassung</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <label>Produkt:</label>
              <span>{exportData.productionOrder.produktName}</span>
            </div>
            <div className="summary-item">
              <label>Material-Typ:</label>
              <span>{exportData.productionOrder.materialType}</span>
            </div>

            <div className="summary-item">
              <label>Abgeschlossen am:</label>
              <span>{formatDate(exportData.completedAt)}</span>
            </div>
            <div className="summary-item">
              <label>Beteiligte Mitarbeiter:</label>
              <span>{getParticipatingEmployees()}</span>
            </div>
            <div className="summary-item">
              <label>Erfasst durch:</label>
              <span>{exportData.answers.abschluss_erfasst}</span>
            </div>
            <div className="summary-item">
              <label>Geprüft durch:</label>
              <span>{exportData.answers.abschluss_geprueft}</span>
            </div>
          </div>
        </div>

        <div className="completion-actions">
          <h2>Weitere Schritte</h2>
          
          <div className="action-group">
            <h3>Dokumentation exportieren</h3>
            <div className="export-buttons">
              <button 
                className="btn btn-primary" 
                onClick={handleJSONExport}
                disabled={isExporting}
              >
                {isExporting ? 'Exportiere...' : 'JSON-Export'}
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handlePDFExport}
                disabled={isExporting}
              >
                {isExporting ? 'Exportiere...' : 'PDF-Export'}
              </button>
            </div>
            <p className="export-hint">
              Exportieren Sie die Dokumentation für Archivierung und Qualitätssicherung.
            </p>
          </div>

          <div className="action-group">
            <h3>Produktionsleitung benachrichtigen</h3>
            <button 
              className={`btn ${productionLeaderNotified ? 'btn-success' : 'btn-secondary'}`}
              onClick={handleNotifyProductionLeader}
              disabled={productionLeaderNotified}
            >
              {productionLeaderNotified ? 'Benachrichtigung gesendet' : 'Produktionsleitung benachrichtigen'}
            </button>
            <p className="notification-hint">
              Informieren Sie die Produktionsleitung über den Abschluss des Prozesses.
            </p>
          </div>

          <div className="action-group">
            <h3>Neuer Produktionsauftrag</h3>
            <button 
              className="btn btn-outline" 
              onClick={handleStartNew}
            >
              Neuen Auftrag starten
            </button>
            <p className="new-order-hint">
              Starten Sie einen neuen Produktionsauftrag.
            </p>
          </div>
        </div>

        {exportStatus && (
          <div className={`status-message ${exportStatus.includes('Fehler') ? 'error' : 'success'}`}>
            {exportStatus}
          </div>
        )}
      </div>

      <div className="completion-footer">
        <p>
          <strong>Hinweis:</strong> Bewahren Sie die exportierten Dokumente sicher auf. 
          Diese dienen als Nachweis für die ordnungsgemäße Durchführung des Produktionsprozesses.
        </p>
      </div>
    </div>
  );
};

export default CompletionScreen;