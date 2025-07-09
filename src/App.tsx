import React, { useState, useEffect } from 'react';
import { ProductionOrder, AppState, SurveyAnswer, ExportData } from './types';
import ProductionOrderManager from './components/ProductionOrderManager';
import SurveyComponent from './components/SurveyComponent';
import CompletionScreen from './components/CompletionScreen';
import './App.css';
import './styles/tablet-optimized.css';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('order-selection');
  const [currentOrder, setCurrentOrder] = useState<ProductionOrder | null>(null);
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswer>({});
  const [exportData, setExportData] = useState<ExportData | null>(null);

  // Load saved state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('productionSurveyState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.currentOrder) {
          setCurrentOrder(parsed.currentOrder);
          setSurveyAnswers(parsed.surveyAnswers || {});
          setAppState(parsed.appState || 'survey');
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);

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
      <header className="app-header">
        <h1>Cannabis Produktions-Dokumentation</h1>
        <div className="app-status">
          {appState === 'order-selection' && <span>Produktionsauftrag auswählen</span>}
          {appState === 'survey' && currentOrder && (
            <span>Auftrag: {currentOrder.produktName} ({currentOrder.materialType})</span>
          )}
          {appState === 'completed' && <span>Prozess abgeschlossen</span>}
        </div>
      </header>

      <main className="app-content">
        {appState === 'order-selection' && (
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