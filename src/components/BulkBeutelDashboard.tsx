import React, { useState, useEffect } from 'react';
import { ProductionOrder } from '../types';
import BulkBeutelForm from './BulkBeutelForm';
import './BulkBeutelDashboard.css';

interface BulkBeutel {
  id: number;
  gebindegroesse: number;
  anzahl: number;
  probenzug_verwendet: boolean;
  dicht_sauber: boolean;
  status: 'nicht_verarbeitet' | 'in_bearbeitung' | 'abgeschlossen';
}

interface BulkBeutelDashboardProps {
  productionOrder: ProductionOrder;
  surveyData: any;
  onSurveyDataUpdate: (data: any) => void;
  surveyDefinition?: any;
}

const BulkBeutelDashboard: React.FC<BulkBeutelDashboardProps> = ({
  productionOrder,
  surveyData,
  onSurveyDataUpdate,
  surveyDefinition
}) => {
  const [selectedBulkBeutel, setSelectedBulkBeutel] = useState<number | null>(null);
  const [bulkBeutelList, setBulkBeutelList] = useState<BulkBeutel[]>([]);
  const [showEcDialog, setShowEcDialog] = useState(false);
  const [ecFormData, setEcFormData] = useState({
    anzahlGebinde: 32,
    plombenNr: '',
    plombenNr2: ''
  });
  const [ecFormErrors, setEcFormErrors] = useState<{[key: string]: string}>({});
  const [verplombteContainer, setVerplombteContainer] = useState<Array<{
    plombenNr: string;
    anzahlGebinde: number;
    timestamp: string;
  }>>([]);

  // Initialisiere BulkBeutel aus surveyData oder productionOrder
  useEffect(() => {
    console.log('[Dashboard] surveyData:', surveyData);
    console.log('[Dashboard] surveyData.survey:', surveyData?.survey);
    console.log('[Dashboard] bulkgebinde_liste:', surveyData?.survey?.bulkgebinde_liste);
    console.log('[Dashboard] bulk_beutel_production:', surveyData?.survey?.bulk_beutel_production);
    
    const produktionslauf = surveyData?.produktionslauf;
    const existingProduction = surveyData?.survey?.bulk_beutel_production || [];
    
    // Erstelle BulkBeutel-Liste basierend auf bulkgebinde_liste
    const bulkgebinde = surveyData?.survey?.bulkgebinde_liste || [];
    console.log('[Dashboard] bulkgebinde array:', bulkgebinde);
    
    const newBulkBeutel: BulkBeutel[] = [] as BulkBeutel[];
    
    // Erstelle für jede Gruppe die entsprechende Anzahl von BulkBeuteln
    let bulkBeutelId = 1;
    bulkgebinde.forEach((item: any, groupIndex: number) => {
      console.log(`[Dashboard] Processing group ${groupIndex}:`, item);
      for (let i = 0; i < item.anzahl; i++) {
        // Prüfe, ob dieser BulkBeutel bereits abgeschlossen ist
        const isCompleted = existingProduction.some((entry: any) => 
          entry.bulk_nummer === bulkBeutelId.toString()
        );
        
        // Prüfe, ob dieser BulkBeutel in Bearbeitung ist
        const isInProgress = produktionslauf?.selectedBulkBeutel === bulkBeutelId;
        
        let status: 'nicht_verarbeitet' | 'in_bearbeitung' | 'abgeschlossen';
        if (isCompleted) {
          status = 'abgeschlossen';
        } else if (isInProgress) {
          status = 'in_bearbeitung';
        } else {
          status = 'nicht_verarbeitet';
        }
        
        newBulkBeutel.push({
          id: bulkBeutelId++,
          gebindegroesse: item.gebindegroesse,
          anzahl: 1, // Jeder BulkBeutel repräsentiert 1 Einheit
          probenzug_verwendet: item.probenzug_verwendet,
          dicht_sauber: item.dicht_sauber,
          status
        });
      }
    });
    
    console.log('[Dashboard] Created bulkBeutel array with status:', newBulkBeutel);
    setBulkBeutelList(newBulkBeutel);
    
    // Setze selectedBulkBeutel basierend auf produktionslauf
    if (produktionslauf?.selectedBulkBeutel && !selectedBulkBeutel) {
      setSelectedBulkBeutel(produktionslauf.selectedBulkBeutel);
    }
    
    // Speichere in surveyData (nur wenn sich was geändert hat UND es noch nicht existiert)
    if (!produktionslauf?.bulkBeutel) {
      const updatedData = {
        ...surveyData,
        produktionslauf: {
          ...surveyData?.produktionslauf,
          bulkBeutel: newBulkBeutel
        }
      };
      onSurveyDataUpdate(updatedData);
    }
  }, [surveyData?.survey?.bulkgebinde_liste, surveyData?.survey?.bulk_beutel_production, surveyData?.produktionslauf?.selectedBulkBeutel, onSurveyDataUpdate]);

  // Entferne die SurveyJS Model Logik - verwende stattdessen die BulkBeutelForm

  const handleAbfuellen = (bulkBeutelId: number) => {
    setSelectedBulkBeutel(bulkBeutelId);
    
    // Update Status zu "in_bearbeitung"
    const updatedBulkBeutel = bulkBeutelList.map(bb => 
      bb.id === bulkBeutelId 
        ? { ...bb, status: 'in_bearbeitung' }
        : bb
    );
    
    setBulkBeutelList(updatedBulkBeutel);
    
    // Speichere in surveyData
    const updatedData = {
      ...surveyData,
      produktionslauf: {
        ...surveyData?.produktionslauf,
        bulkBeutel: updatedBulkBeutel,
        selectedBulkBeutel: bulkBeutelId
      }
    };
    onSurveyDataUpdate(updatedData);
  };

  const handleBulkBeutelAbgeschlossen = (formData: any) => {
    if (selectedBulkBeutel) {
      console.log('[Dashboard] Completing bulkBeutel:', selectedBulkBeutel);
      console.log('[Dashboard] Form data:', formData);
      
      // Speichere die Form-Daten in bulk_beutel_production
      const existingProduction = surveyData?.survey?.bulk_beutel_production || [];
      
      // Erstelle oder aktualisiere den Eintrag für diesen BulkBeutel
      const productionEntry = {
        ...formData,
        timestamp: new Date().toISOString()
      };
      
      // Entferne existierenden Eintrag und füge neuen hinzu
      const updatedProduction = existingProduction.filter((entry: any) => 
        entry.bulk_nummer !== selectedBulkBeutel.toString()
      );
      updatedProduction.push(productionEntry);
      
      // Update BulkBeutel Status
      const updatedBulkBeutel = bulkBeutelList.map(bb => 
        bb.id === selectedBulkBeutel 
          ? { ...bb, status: 'abgeschlossen' }
          : bb
      );
      
      setBulkBeutelList(updatedBulkBeutel);
      setSelectedBulkBeutel(null);
      
      // Speichere alles in surveyData
      const updatedData = {
        ...surveyData,
        survey: {
          ...surveyData?.survey,
          bulk_beutel_production: updatedProduction
        },
        produktionslauf: {
          ...surveyData?.produktionslauf,
          bulkBeutel: updatedBulkBeutel,
          selectedBulkBeutel: null
        }
      };
      onSurveyDataUpdate(updatedData);
    }
  };

  const handleCancelForm = () => {
    if (selectedBulkBeutel) {
      // Reset selected BulkBeutel Status zurück zu "nicht_verarbeitet"
      const updatedBulkBeutel = bulkBeutelList.map(bb => 
        bb.id === selectedBulkBeutel 
          ? { ...bb, status: 'nicht_verarbeitet' }
          : bb
      );
      
      setBulkBeutelList(updatedBulkBeutel);
      setSelectedBulkBeutel(null);
      
      // Speichere in surveyData
      const updatedData = {
        ...surveyData,
        produktionslauf: {
          ...surveyData?.produktionslauf,
          bulkBeutel: updatedBulkBeutel,
          selectedBulkBeutel: null
        }
      };
      onSurveyDataUpdate(updatedData);
    }
  };

  const getVerarbeiteteAnzahl = () => {
    return bulkBeutelList.filter(bb => bb.status === 'abgeschlossen').length;
  };

  const getGesamtAnzahl = () => bulkBeutelList.length;

  const getErzeugteGebindeAnzahl = () => {
    const existingProduction = surveyData?.survey?.bulk_beutel_production || [];
    return existingProduction.reduce((total: number, entry: any) => {
      const anzahl = parseInt(entry.anzahl_gebinde) || 0;
      return total + anzahl;
    }, 0);
  };

  const getGebindeInEurocontainerAnzahl = () => {
    // Lese aus Survey-JSON-Struktur
    const produktliste = surveyData?.survey?.schleusung_eurocontainer?.produktliste || [];
    return produktliste.reduce((total: number, item: any) => {
      if (item.art_inhalt === "Hergestellte Zwischenprodukte") {
        return total + (parseInt(item.anzahl_gebinde) || 0);
      }
      return total;
    }, 0);
  };

  const getFertigeGebindeAnzahl = () => {
    return getErzeugteGebindeAnzahl() - getGebindeInEurocontainerAnzahl();
  };

  // Soll-Wert für zu erzeugende Gebinde aus dem Produktionsauftrag
  const getSollGebindeAnzahl = () => {
    return productionOrder.zwischenprodukt.vorgGebindezahl || 0;
  };

  const getProbenzugAnzahl = () => {
    const existingProduction = surveyData?.survey?.bulk_beutel_production || [];
    return existingProduction.filter((entry: any) => entry.probenzug_ipk && parseFloat(entry.probenzug_ipk) > 0).length;
  };

  const getProbenzugListe = () => {
    const existingProduction = surveyData?.survey?.bulk_beutel_production || [];
    return existingProduction
      .filter((entry: any) => entry.probenzug_ipk && parseFloat(entry.probenzug_ipk) > 0)
      .map((entry: any) => parseFloat(entry.probenzug_ipk).toFixed(2));
  };

  const getKummulierteRestmenge = () => {
    const existingProduction = surveyData?.survey?.bulk_beutel_production || [];
    return existingProduction.reduce((total: number, entry: any) => {
      const restmenge = parseFloat(entry.restmenge) || 0;
      return total + restmenge;
    }, 0).toFixed(2);
  };

  const getBruchSumme = () => {
    const existingProduction = surveyData?.survey?.bulk_beutel_production || [];
    return existingProduction.reduce((total: number, entry: any) => {
      const bruch = parseFloat(entry.bruch) || 0;
      return total + bruch;
    }, 0).toFixed(2);
  };

  const getAussortiertesMaterial = () => {
    const existingProduction = surveyData?.survey?.bulk_beutel_production || [];
    return existingProduction.reduce((total: number, entry: any) => {
      const aussortiert = parseFloat(entry.aussortiertes_material) || 0;
      return total + aussortiert;
    }, 0).toFixed(2);
  };

  const isNextAvailableBulkBeutel = (bulkBeutelId: number) => {
    // Prüfe, ob ein Bulk Beutel in Bearbeitung ist
    const hasInProgress = bulkBeutelList.some(bb => bb.status === 'in_bearbeitung');
    
    // Wenn ein Bulk Beutel in Bearbeitung ist, ist keiner verfügbar
    if (hasInProgress) {
      return false;
    }
    
    // Finde den ersten Bulk Beutel mit Status 'nicht_verarbeitet'
    const nextAvailable = bulkBeutelList.find(bb => bb.status === 'nicht_verarbeitet');
    return nextAvailable?.id === bulkBeutelId;
  };

  // EC Dialog Handler
  const handleEcDialogOpen = () => {
    setShowEcDialog(true);
    setEcFormErrors({});
  };

  const handleEcDialogClose = () => {
    setShowEcDialog(false);
    setEcFormData({
      anzahlGebinde: 32,
      plombenNr: '',
      plombenNr2: ''
    });
    setEcFormErrors({});
  };

  const handleEcFormChange = (field: string, value: string | number) => {
    setEcFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (ecFormErrors[field]) {
      setEcFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateEcForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!ecFormData.plombenNr) {
      errors.plombenNr = 'Plomben-Nr. ist erforderlich';
    } else if (!/^\d{7}$/.test(ecFormData.plombenNr)) {
      errors.plombenNr = 'Plomben-Nr. muss genau 7 Ziffern haben';
    }
    
    if (ecFormData.anzahlGebinde < 0) {
      errors.anzahlGebinde = 'Anzahl Gebinde darf nicht negativ sein';
    }
    
    // Prüfe, ob genügend Gebinde verfügbar sind
    const verfuegbareGebinde = getFertigeGebindeAnzahl();
    if (ecFormData.anzahlGebinde > verfuegbareGebinde) {
      errors.anzahlGebinde = `Nur ${verfuegbareGebinde} Gebinde verfügbar (${getErzeugteGebindeAnzahl()} erstellt, ${getGebindeInEurocontainerAnzahl()} bereits verpackt)`;
    }
    
    setEcFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEcVerplomben = () => {
    if (validateEcForm()) {
      const newContainer = {
        plombenNr: ecFormData.plombenNr,
        anzahlGebinde: ecFormData.anzahlGebinde,
        timestamp: new Date().toLocaleString('de-DE')
      };
      
      // Speichere in Survey-JSON-Struktur
      const updatedSurveyData = { ...surveyData };
      
      // Initialisiere schleusung_eurocontainer falls nicht vorhanden
      if (!updatedSurveyData.survey) {
        updatedSurveyData.survey = {};
      }
      if (!updatedSurveyData.survey.schleusung_eurocontainer) {
        updatedSurveyData.survey.schleusung_eurocontainer = {};
      }
      if (!updatedSurveyData.survey.schleusung_eurocontainer.produktliste) {
        updatedSurveyData.survey.schleusung_eurocontainer.produktliste = [];
      }
      
      // Füge neue Produktliste hinzu
      const newProduktliste = {
        art_inhalt: "Hergestellte Zwischenprodukte",
        anzahl_gebinde: ecFormData.anzahlGebinde.toString(),
        plomben_nr: ecFormData.plombenNr,
        plomben_nr_2: ecFormData.plombenNr2 || null
      };
      
      updatedSurveyData.survey.schleusung_eurocontainer.produktliste.push(newProduktliste);
      
      // Update Survey Data
      onSurveyDataUpdate(updatedSurveyData);
      
      // Update lokalen State für UI
      setVerplombteContainer(prev => [...prev, newContainer]);
      handleEcDialogClose();
    }
  };

  return (
    <div className="bulk-beutel-dashboard">
      {/* Spalte 1: Eingangsmaterial */}
      <div className="dashboard-column column-1">
        <div className="dashboard-header">
          <h3>Material Eingang</h3>
        </div>
        
        {/* Doughnut Chart */}
        <div className="doughnut-chart">
          <div className="chart-container">
            <span className="chart-label">Verarbeitete Bulk Beutel</span>
            <div className="chart-circle">
              <div className="chart-progress" 
                   style={{ 
                     background: `conic-gradient(${getVerarbeiteteAnzahl() >= getGesamtAnzahl() ? '#19b394' : '#49b6bb'} ${(getVerarbeiteteAnzahl() / getGesamtAnzahl()) * 360}deg, #e0e0e0 0deg)` 
                   }}>
              </div>
              <div className="chart-center">
                <span className="chart-number">{getVerarbeiteteAnzahl()}</span>
                <span className="chart-inner-label">von {getGesamtAnzahl()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BulkBeutel Boxen */}
        <div className="bulk-beutel-list">
          {bulkBeutelList
            .sort((a, b) => {
              // Sortiere nach Status: in_bearbeitung > nicht_verarbeitet > abgeschlossen
              const statusOrder = { 'in_bearbeitung': 0, 'nicht_verarbeitet': 1, 'abgeschlossen': 2 };
              const statusDiff = statusOrder[a.status] - statusOrder[b.status];
              
              // Bei gleichem Status sortiere nach ID
              return statusDiff !== 0 ? statusDiff : a.id - b.id;
            })
            .map((bulkBeutel) => (
            <div 
              key={bulkBeutel.id} 
              className={`bulk-beutel-box ${bulkBeutel.status} ${selectedBulkBeutel === bulkBeutel.id ? 'selected' : ''}`}
            >
              <div className="bulk-beutel-header">
                <span className="bulk-beutel-number">#{bulkBeutel.id}</span>
                <span className="bulk-beutel-size">{bulkBeutel.gebindegroesse} g</span>
                <span className={`status-badge ${bulkBeutel.status}`}>
                  {bulkBeutel.status === 'nicht_verarbeitet' && 'Nicht verarbeitet'}
                  {bulkBeutel.status === 'in_bearbeitung' && 'In Bearbeitung'}
                  {bulkBeutel.status === 'abgeschlossen' && 'Abgeschlossen'}
                </span>
              </div>
              {bulkBeutel.status === 'nicht_verarbeitet' && (
                <button 
                  className={`btn-abfuellen ${isNextAvailableBulkBeutel(bulkBeutel.id) ? '' : 'disabled'}`}
                  onClick={() => handleAbfuellen(bulkBeutel.id)}
                  disabled={!isNextAvailableBulkBeutel(bulkBeutel.id)}
                >
                  Abfüllen
                </button>
              )}
              {bulkBeutel.status === 'in_bearbeitung' && (
                <div className="in-progress-indicator">
                  <span>In Bearbeitung...</span>
                </div>
              )}
              {bulkBeutel.status === 'abgeschlossen' && (
                <div className="completed-indicator">
                  <span>✓ Abgeschlossen</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Spalte 2: BulkBeutel Form */}
      <div className="dashboard-column column-2">
        {selectedBulkBeutel ? (
          <>
            <div className="dashboard-header">
              <h3>Produktionslauf</h3>
            </div>
            <div className="bulk-beutel-badge">
              Bulk Beutel #{selectedBulkBeutel}
            </div>
            <BulkBeutelForm
              bulkBeutel={bulkBeutelList.find(bb => bb.id === selectedBulkBeutel)!}
              totalBulkBeutel={bulkBeutelList.length}
              onSave={handleBulkBeutelAbgeschlossen}
              onCancel={handleCancelForm}
            />
          </>
        ) : (
          <>
            <div className="dashboard-header">
              <h3>Produktionslauf</h3>
            </div>
            <div className="empty-state">
              <p>Wähle einen BulkBeutel aus, um mit der Abfüllung zu beginnen.</p>
            </div>
          </>
        )}
      </div>

      {/* Spalte 3: Material Ausgang */}
      <div className="dashboard-column column-3">
        <div className="dashboard-header">
          <h3>Material Ausgang</h3>
        </div>
        
        {/* Erzeugte Gebinde Box mit Donut-Chart */}
        <div className="output-box">
          <div className="doughnut-chart">
            <div className="chart-container">
              <span className="chart-label">Erzeugte Gebinde</span>
              <div className="chart-circle">
                <div className="chart-progress" 
                     style={{ 
                       background: `conic-gradient(${getErzeugteGebindeAnzahl() >= getSollGebindeAnzahl() ? '#19b394' : '#49b6bb'} ${(getErzeugteGebindeAnzahl() / getSollGebindeAnzahl()) * 360}deg, #e0e0e0 0deg)` 
                     }}>
                </div>
                <div className="chart-center">
                  <span className="chart-number">{getErzeugteGebindeAnzahl()}</span>
                  <span className="chart-inner-label">von {getSollGebindeAnzahl()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="output-subtitle">
            <span>Gesamt aus Produktionslauf</span>
          </div>
          <div className="output-details">
            <div className="output-detail-item">
              <span className="detail-label">Fertige Gebinde:</span>
              <span className="detail-value">{getFertigeGebindeAnzahl()}</span>
            </div>
            <div className="output-detail-item">
              <span className="detail-label">Gebinde in Eurocontainer:</span>
              <span className="detail-value">{getGebindeInEurocontainerAnzahl()}</span>
            </div>
          </div>
        </div>

        {/* Probenzug Box mit Donut-Chart */}
        <div className="output-box">
          <div className="doughnut-chart">
            <div className="chart-container">
              <span className="chart-label">Gezogene IPK Proben</span>
              <div className="chart-circle">
                <div className="chart-progress" 
                     style={{ 
                       background: `conic-gradient(${getProbenzugAnzahl() >= 3 ? '#19b394' : '#49b6bb'} ${(getProbenzugAnzahl() / 3) * 360}deg, #e0e0e0 0deg)` 
                     }}>
                </div>
                <div className="chart-center">
                  <span className="chart-number">{getProbenzugAnzahl()}</span>
                  <span className="chart-inner-label">von 3</span>
                </div>
              </div>
            </div>
          </div>
          {getProbenzugListe().length > 0 && (
            <div className="output-details">
              {getProbenzugListe().map((probe, index) => (
                <div key={index} className="output-detail-item">
                  <span className="detail-label">Probe {index + 1}:</span>
                  <span className="detail-value">{probe} g</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kummulierte Restmenge Box */}
        <div className="output-box">
          <div className="output-header">
            <span className="output-title">Kummulierte Restmenge</span>
            <span className="output-value">{getKummulierteRestmenge()} g</span>
          </div>
          <div className="output-subtitle">
            <span>Summe aller Restmengen</span>
          </div>
        </div>

        {/* Bruch Box */}
        <div className="output-box">
          <div className="output-header">
            <span className="output-title">Bruch</span>
            <span className="output-value">{getBruchSumme()} g</span>
          </div>
          <div className="output-subtitle">
            <span>Summe aller Bruch-Einträge</span>
          </div>
        </div>

        {/* Aussortiertes Material Box */}
        <div className="output-box">
          <div className="output-header">
            <span className="output-title">Aussortiertes Material</span>
            <span className="output-value">{getAussortiertesMaterial()} g</span>
          </div>
          <div className="output-subtitle">
            <span>Summe aller Aussortierungen</span>
          </div>
        </div>
      </div>

      {/* Spalte 4: Eurocontainer */}
      <div className="dashboard-column column-4">
        <div className="dashboard-header">
          <h3>Eurocontainer</h3>
        </div>
        
        {/* EC Packen und Verplomben Button */}
        <div className="ec-action-section">
          <button className="btn-ec-packen" onClick={handleEcDialogOpen}>
            <span className="btn-icon">{showEcDialog ? '−' : '+'}</span>
            <span className="btn-text">EC packen und verplomben</span>
          </button>
        </div>
        
        {/* EC Expander */}
        {showEcDialog && (
          <div className="ec-expander">
            <div className="ec-expander-content">
              <div className="ec-form-row">
                <label className="ec-form-label">Anzahl Gebinde:</label>
                <input
                  type="number"
                  className="ec-form-input"
                  value={ecFormData.anzahlGebinde}
                  onChange={(e) => handleEcFormChange('anzahlGebinde', parseInt(e.target.value) || 0)}
                  min="0"
                />
                {ecFormErrors.anzahlGebinde && (
                  <span className="ec-form-error">{ecFormErrors.anzahlGebinde}</span>
                )}
              </div>
              
              <div className="ec-form-row">
                <label className="ec-form-label">Plomben-Nr.:</label>
                <input
                  type="text"
                  className="ec-form-input"
                  value={ecFormData.plombenNr}
                  onChange={(e) => handleEcFormChange('plombenNr', e.target.value)}
                  placeholder="7-stellige Nummer"
                  maxLength={7}
                />
                {ecFormErrors.plombenNr && (
                  <span className="ec-form-error">{ecFormErrors.plombenNr}</span>
                )}
              </div>
              
              <div className="ec-form-row">
                <label className="ec-form-label">Plomben-Nr. 2:</label>
                <input
                  type="text"
                  className="ec-form-input"
                  value={ecFormData.plombenNr2}
                  onChange={(e) => handleEcFormChange('plombenNr2', e.target.value)}
                  placeholder="7-stellige Nummer (optional)"
                  maxLength={7}
                />
              </div>
              
              <div className="ec-expander-actions">
                <button className="btn-ec-verplomben" onClick={handleEcVerplomben}>
                  EC Verplomben
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Verplombte Container */}
        {(() => {
          const produktliste = surveyData?.survey?.schleusung_eurocontainer?.produktliste || [];
          const hergestellteProdukte = produktliste.filter((item: any) => item.art_inhalt === "Hergestellte Zwischenprodukte");
          
          return hergestellteProdukte.length > 0 ? (
            <div className="verplombte-container-list">
              {hergestellteProdukte.map((container: any, index: number) => (
                <div key={index} className="verplombte-container-box">
                  <div className="container-header">
                    <span className="container-plomben">
                      Plomben-Nr.: {container.plomben_nr}
                      {container.plomben_nr_2 && ` / ${container.plomben_nr_2}`}
                    </span>
                  </div>
                  <div className="container-details">
                    <span className="container-gebinde">Anzahl Gebinde: {container.anzahl_gebinde}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="placeholder">
              <p>Platzhalter für zukünftige Funktionen</p>
            </div>
          );
        })()}
      </div>


    </div>
  );
};

export default BulkBeutelDashboard; 