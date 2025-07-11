import React, { useState, useEffect } from 'react';
import { ProductionOrder, AppState, SurveyAnswer, ExportData } from './types';
import ProductionOrderManager from './components/ProductionOrderManager';
import SurveyComponent from './components/SurveyComponent';
import CompletionScreen from './components/CompletionScreen';
import './App.css';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('order-selection');
  const [currentOrder, setCurrentOrder] = useState<ProductionOrder | null>(null);
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswer>({});
  const [exportData, setExportData] = useState<ExportData | null>(null);

  // Check for saved state but don't auto-load it
  const [hasSavedState, setHasSavedState] = useState(false);
  const [savedStateData, setSavedStateData] = useState<any>(null);

  useEffect(() => {
    const savedState = localStorage.getItem('productionSurveyState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.currentOrder) {
          setHasSavedState(true);
          setSavedStateData(parsed);
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);

  const handleContinueSaved = () => {
    if (savedStateData) {
      setCurrentOrder(savedStateData.currentOrder);
      setSurveyAnswers(savedStateData.surveyAnswers || {});
      setAppState(savedStateData.appState || 'survey');
      setHasSavedState(false);
    }
  };

  const handleStartFresh = () => {
    // Clear ALL localStorage data for completely fresh start
    localStorage.clear(); // This removes everything
    setHasSavedState(false);
    setSavedStateData(null);
    // Force page reload to ensure clean state
    window.location.reload();
  };

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (currentOrder) {
      const stateToSave = {
        currentOrder,
        surveyAnswers,
        appState
      };
      localStorage.setItem('productionSurveyState', JSON.stringify(stateToSave));
    }
  }, [currentOrder, surveyAnswers, appState]);

  const handleOrderSelected = (order: ProductionOrder) => {
    setCurrentOrder(order);
    setSurveyAnswers({});
    setAppState('survey');
  };

  const handleSurveyComplete = (answers: SurveyAnswer) => {
    setSurveyAnswers(answers);
    const exportData: ExportData = {
      productionOrder: currentOrder!,
      answers,
      completedAt: new Date().toISOString()
    };
    setExportData(exportData);
    setAppState('completed');
  };

  const handleStartNew = () => {
    setCurrentOrder(null);
    setSurveyAnswers({});
    setExportData(null);
    setAppState('order-selection');
    localStorage.removeItem('productionSurveyState');
  };

  const handleBackToOrder = () => {
    setAppState('order-selection');
  };

  return (
    <div className="app">

      <main className="app-content">
        {hasSavedState && (
          <div className="saved-state-dialog">
            <div className="dialog-content">
              <h2>Gespeicherter Fortschritt gefunden</h2>
              <p>
                Sie haben einen unvollständigen Produktionsauftrag:
                <br />
                <strong>{savedStateData?.currentOrder?.produktName}</strong>
                <br />
                ({savedStateData?.currentOrder?.materialType})
              </p>
              <div className="dialog-buttons">
                <button 
                  className="btn btn-primary"
                  onClick={handleContinueSaved}
                >
                  Fortfahren
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={handleStartFresh}
                >
                  Neu starten
                </button>
              </div>
            </div>
          </div>
        )}

        {!hasSavedState && appState === 'order-selection' && (
          <ProductionOrderManager 
            onOrderSelected={handleOrderSelected}
            currentOrder={currentOrder}
            onContinueSurvey={() => setAppState('survey')}
          />
        )}

        {appState === 'survey' && currentOrder && (
          <SurveyComponent
            productionOrder={currentOrder}
            initialAnswers={surveyAnswers}
            onSurveyComplete={handleSurveyComplete}
            onBackToOrder={handleBackToOrder}
          />
        )}

        {appState === 'completed' && exportData && (
          <CompletionScreen
            exportData={exportData}
            onStartNew={handleStartNew}
          />
        )}
      </main>
    </div>
  );
};

export default App;