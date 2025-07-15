import React, { useState, useEffect } from 'react';
import { ProductionOrder, AppState, SurveyAnswer, ExportData } from './types';
import ProductionOrderManager from './components/ProductionOrderManager';
import SurveyComponent from './components/SurveyComponent';
import CompletionScreen from './components/CompletionScreen';
import './App.css';
import { readJsonFile, writeJsonFile, listSurveyFiles } from './utils/exportUtils';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('order-selection');
  const [currentOrder, setCurrentOrder] = useState<ProductionOrder | null>(null);
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswer>({});
  const [exportData, setExportData] = useState<ExportData | null>(null);

  // Resume-Dialog State
  const [hasSavedState, setHasSavedState] = useState(false);
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null);
  const [savedOrder, setSavedOrder] = useState<ProductionOrder | null>(null);
  const [savedAnswers, setSavedAnswers] = useState<SurveyAnswer>({});

  // Prüfe beim Start, ob ein in-progress Survey existiert
  useEffect(() => {
    (async () => {
      try {
        const files = await listSurveyFiles();
        const inProgressFile = files.find(f => f.endsWith('-inprogress.json'));
        if (inProgressFile) {
          // Extrahiere orderId
          const match = inProgressFile.match(/survey-(.+)-inprogress\.json/);
          const orderId = match ? match[1] : null;
          if (orderId) {
            setHasSavedState(true);
            setSavedOrderId(orderId);
            // Lade Order und Answers
            const orders = await readJsonFile('data/orders/orders.json');
            const order = orders.find((o: ProductionOrder) => o.id === orderId) || null;
            setSavedOrder(order);
            const progress = await readJsonFile(inProgressFile);
            setSavedAnswers(progress.enhancedData || {});
          }
        }
      } catch (error) {
        setHasSavedState(false);
      }
    })();
  }, []);

  const handleContinueSaved = () => {
    if (savedOrder) {
      setCurrentOrder(savedOrder);
      setSurveyAnswers(savedAnswers);
      setAppState('survey');
      setHasSavedState(false);
    }
  };

  const handleStartFresh = async () => {
    // Lösche alle in-progress Survey-Dateien
    const files = await listSurveyFiles();
    const inProgressFiles = files.filter(f => f.endsWith('-inprogress.json'));
    for (const file of inProgressFiles) {
      await writeJsonFile(file, {});
    }
    setHasSavedState(false);
    setSavedOrderId(null);
    setSavedOrder(null);
    setSavedAnswers({});
    window.location.reload();
  };

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
  };

  const handleBackToOrder = () => {
    setAppState('order-selection');
  };

  return (
    <div className="app">
      <main className="app-content">
        {hasSavedState && savedOrder && (
          <div className="saved-state-dialog">
            <div className="dialog-content">
              <h2>Gespeicherter Fortschritt gefunden</h2>
              <p>
                Sie haben einen unvollständigen Produktionsauftrag:
                <br />
                <strong>{savedOrder.produktName}</strong>
                <br />
                ({savedOrder.materialType})
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