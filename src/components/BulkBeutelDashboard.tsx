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
        
        const status: 'nicht_verarbeitet' | 'in_bearbeitung' | 'abgeschlossen' = 
          isCompleted ? 'abgeschlossen' : 'nicht_verarbeitet';
        
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
    
    // Speichere in surveyData (nur wenn sich was geändert hat)
    if (!produktionslauf?.bulkBeutel || JSON.stringify(produktionslauf.bulkBeutel) !== JSON.stringify(newBulkBeutel)) {
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
    // Reset selected BulkBeutel ohne Speichern
    setSelectedBulkBeutel(null);
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
              onSave={handleBulkBeutelAbgeschlossen}
              onCancel={handleCancelForm}
            />
          </>
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