import React, { useState, useEffect } from 'react';
import { ProductionOrder, AppState, SurveyAnswer, ExportData } from './types';
import ProductionOrderManager from './components/ProductionOrderManager';
import SurveyComponent from './components/SurveyComponent';
import CompletionScreen from './components/CompletionScreen';
import './App.css';
// Import removed - not needed anymore

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('order-selection');
  const [currentOrder, setCurrentOrder] = useState<ProductionOrder | null>(null);
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswer>({});
  const [exportData, setExportData] = useState<ExportData | null>(null);

  // Resume-Dialog State entfernt - wird nicht mehr verwendet

  // Initialisierung - immer zur Auftragsübersicht
  useEffect(() => {
    console.log('[App] Starting application - always showing order overview');
    // Keine Resume-Dialog-Logik mehr - Benutzer entscheidet in der Auftragsübersicht
  }, []);

  // Resume-Dialog-Funktionen werden nicht mehr benötigt

  const handleOrderSelected = (order: ProductionOrder) => {
    setCurrentOrder(order);
    setSurveyAnswers({});
    setAppState('survey');
  };

  const handleSurveyComplete = (answers: SurveyAnswer, validation?: Record<string, any>) => {
    setSurveyAnswers(answers);
    const exportData: ExportData = {
      productionOrder: currentOrder!,
      answers,
      completedAt: new Date().toISOString(),
      validation
    };
    setExportData(exportData);
    setAppState('completed');
  };

  const handleStartNew = () => {
    setCurrentOrder(null);
    setSurveyAnswers({});
    setExportData(null);
    setAppState('order-selection');
  };

  const handleBackToOrder = () => {
    setCurrentOrder(null);
    setSurveyAnswers({});
    setAppState('order-selection');
  };

  return (
    <div className="app">
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