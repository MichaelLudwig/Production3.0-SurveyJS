import React, { useState, useEffect } from 'react';
import { ProductionOrder } from '../types';
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
}

const BulkBeutelDashboard: React.FC<BulkBeutelDashboardProps> = ({
  productionOrder,
  surveyData,
  onSurveyDataUpdate
}) => {
  const [selectedBulkBeutel, setSelectedBulkBeutel] = useState<number | null>(null);
  const [bulkBeutelList, setBulkBeutelList] = useState<BulkBeutel[]>([]);

  // Initialisiere BulkBeutel aus surveyData oder productionOrder
  useEffect(() => {
    console.log('[Dashboard] surveyData:', surveyData);
    console.log('[Dashboard] surveyData.survey:', surveyData?.survey);
    console.log('[Dashboard] bulkgebinde_liste:', surveyData?.survey?.bulkgebinde_liste);
    
    const produktionslauf = surveyData?.produktionslauf;
    
    if (produktionslauf?.bulkBeutel) {
      console.log('[Dashboard] Using existing bulkBeutel from produktionslauf');
      setBulkBeutelList(produktionslauf.bulkBeutel as BulkBeutel[]);
    } else {
      console.log('[Dashboard] Creating new bulkBeutel from bulkgebinde_liste');
      // Fallback: Erstelle aus bulkgebinde_liste (aus survey.survey)
      const bulkgebinde = surveyData?.survey?.bulkgebinde_liste || [];
      console.log('[Dashboard] bulkgebinde array:', bulkgebinde);
      
      const newBulkBeutel: BulkBeutel[] = [];
      
      // Erstelle für jede Gruppe die entsprechende Anzahl von BulkBeuteln
      let bulkBeutelId = 1;
      bulkgebinde.forEach((item: any, groupIndex: number) => {
        console.log(`[Dashboard] Processing group ${groupIndex}:`, item);
        for (let i = 0; i < item.anzahl; i++) {
          newBulkBeutel.push({
            id: bulkBeutelId++,
            gebindegroesse: item.gebindegroesse,
            anzahl: 1, // Jeder BulkBeutel repräsentiert 1 Einheit
            probenzug_verwendet: item.probenzug_verwendet,
            dicht_sauber: item.dicht_sauber,
            status: 'nicht_verarbeitet' as const
          });
        }
      });
      
      console.log('[Dashboard] Created bulkBeutel array:', newBulkBeutel);
      setBulkBeutelList(newBulkBeutel);
      
      // Speichere initial in surveyData
      const updatedData = {
        ...surveyData,
        produktionslauf: {
          ...surveyData?.produktionslauf,
          bulkBeutel: newBulkBeutel
        }
      };
      onSurveyDataUpdate(updatedData);
    }
  }, [surveyData, onSurveyDataUpdate]);

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

  const handleBulkBeutelAbgeschlossen = () => {
    if (selectedBulkBeutel) {
      const updatedBulkBeutel = bulkBeutelList.map(bb => 
        bb.id === selectedBulkBeutel 
          ? { ...bb, status: 'abgeschlossen' }
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

  return (
    <div className="bulk-beutel-dashboard">
      {/* Spalte 1: Eingangsmaterial */}
      <div className="dashboard-column column-1">
        <div className="dashboard-header">
          <h3>Eingangsmaterial</h3>
        </div>
        
        {/* Doughnut Chart */}
        <div className="doughnut-chart">
          <div className="chart-container">
            <div className="chart-circle">
              <div className="chart-progress" 
                   style={{ 
                     background: `conic-gradient(#19b394 ${(getVerarbeiteteAnzahl() / getGesamtAnzahl()) * 360}deg, #e0e0e0 0deg)` 
                   }}>
              </div>
              <div className="chart-center">
                <span className="chart-number">{getVerarbeiteteAnzahl()}</span>
                <span className="chart-label">von {getGesamtAnzahl()}</span>
              </div>
            </div>
            <p className="chart-title">Verarbeitete Bulk Beutel</p>
          </div>
        </div>

        {/* BulkBeutel Boxen */}
        <div className="bulk-beutel-list">
          {bulkBeutelList.map((bulkBeutel) => (
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
                  className="btn-abfuellen"
                  onClick={() => handleAbfuellen(bulkBeutel.id)}
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

      {/* Spalte 2: SurveyJS Element */}
      <div className="dashboard-column column-2">
        {selectedBulkBeutel ? (
          <div className="survey-container">
            <div className="survey-header">
              <h3>Produktionslauf BulkBeutel #{selectedBulkBeutel}</h3>
              <button 
                className="btn-abschliessen"
                onClick={handleBulkBeutelAbgeschlossen}
              >
                BulkBeutel abgefüllt
              </button>
            </div>
            <div className="survey-content">
              {/* Hier kommt das SurveyJS Element hin */}
              <p>SurveyJS Element für BulkBeutel #{selectedBulkBeutel}</p>
              <p>Soll-Inhalt: {bulkBeutelList.find(bb => bb.id === selectedBulkBeutel)?.gebindegroesse} g</p>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <h3>Produktionslauf</h3>
            <p>Wähle einen BulkBeutel aus, um mit der Abfüllung zu beginnen.</p>
          </div>
        )}
      </div>

      {/* Spalte 3: Platzhalter */}
      <div className="dashboard-column column-3">
        <div className="placeholder">
          <h3>Spalte 3</h3>
          <p>Platzhalter für zukünftige Funktionen</p>
        </div>
      </div>

      {/* Spalte 4: Platzhalter */}
      <div className="dashboard-column column-4">
        <div className="placeholder">
          <h3>Spalte 4</h3>
          <p>Platzhalter für zukünftige Funktionen</p>
        </div>
      </div>
    </div>
  );
};

export default BulkBeutelDashboard; 