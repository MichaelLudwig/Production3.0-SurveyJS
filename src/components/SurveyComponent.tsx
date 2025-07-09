import React, { useEffect, useState } from 'react';
import 'survey-core/survey-core.min.css';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { ProductionOrder, SurveyAnswer } from '../types';
import surveyDefinition from '../data/surveyDefinition.json';
import './SurveyComponent.css';

interface SurveyComponentProps {
  productionOrder: ProductionOrder;
  initialAnswers: SurveyAnswer;
  onSurveyComplete: (answers: SurveyAnswer) => void;
  onBackToOrder: () => void;
}

const SurveyComponent: React.FC<SurveyComponentProps> = ({
  productionOrder,
  initialAnswers,
  onSurveyComplete,
  onBackToOrder
}) => {
  const [survey, setSurvey] = useState<Model | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    // Create survey model exactly as per SurveyJS documentation
    const surveyModel = new Model(surveyDefinition);
    
    // Configure survey as per SurveyJS documentation
    surveyModel.locale = 'de';
    surveyModel.showProgressBar = 'top';
    surveyModel.showQuestionNumbers = 'off';
    surveyModel.completeText = 'Prozess abschließen';
    surveyModel.prevText = 'Zurück';
    surveyModel.nextText = 'Weiter';
    
    // Inject production order data into survey
    const orderData = {
      produktName: productionOrder.produktName,
      materialType: productionOrder.materialType,
      bulkBeutelAnzahl: productionOrder.bulkBeutelAnzahl,
      eingangsmaterial: productionOrder.eingangsmaterial,
      primaerPackmittel: productionOrder.primaerPackmittel,
      zwischenprodukt: productionOrder.zwischenprodukt,
      probenzug: productionOrder.probenzug
    };
    
    // Set initial values
    surveyModel.data = { ...orderData, ...initialAnswers };
    
    // Add event handlers
    surveyModel.onComplete.add((sender) => {
      const answers = sender.data;
      onSurveyComplete(answers);
    });
    
    surveyModel.onCurrentPageChanged.add((sender) => {
      setCurrentPageIndex(sender.currentPageNo);
      // Save progress to localStorage
      localStorage.setItem('surveyProgress', JSON.stringify({
        data: sender.data,
        currentPageNo: sender.currentPageNo
      }));
    });
    
    surveyModel.onValueChanged.add((sender) => {
      // Auto-save on every value change
      localStorage.setItem('surveyProgress', JSON.stringify({
        data: sender.data,
        currentPageNo: sender.currentPageNo
      }));
    });
    
    // Load saved progress if available
    const savedProgress = localStorage.getItem('surveyProgress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        surveyModel.data = { ...orderData, ...progress.data };
        surveyModel.currentPageNo = progress.currentPageNo || 0;
      } catch (error) {
        console.error('Error loading survey progress:', error);
      }
    }
    
    setSurvey(surveyModel);
    
    return () => {
      surveyModel.dispose();
    };
  }, [productionOrder, initialAnswers, onSurveyComplete]);

  const handleBackToOrder = () => {
    if (window.confirm('Möchten Sie wirklich zur Auftragsauswahl zurück? Ihr Fortschritt wird gespeichert.')) {
      onBackToOrder();
    }
  };

  const getTotalPages = () => {
    return survey?.pageCount || 0;
  };

  const getCurrentPageTitle = () => {
    return survey?.currentPage?.title || '';
  };

  if (!survey) {
    return <div className="survey-loading">Fragekatalog wird geladen...</div>;
  }

  return (
    <div className="survey-container">
      <div className="survey-header">
        <div className="survey-info">
          <h2>{productionOrder.produktName}</h2>
          <p>Material: {productionOrder.materialType} | Bulk-Beutel: {productionOrder.bulkBeutelAnzahl}</p>
        </div>
        <div className="survey-progress">
          <span>Seite {currentPageIndex + 1} von {getTotalPages()}</span>
          <button className="btn btn-secondary" onClick={handleBackToOrder}>
            Zur Auftragsauswahl
          </button>
        </div>
      </div>
      
      <div className="survey-content">
        <div className="current-page-title">
          <h3>{getCurrentPageTitle()}</h3>
        </div>
        
        <div className="survey-wrapper">
          <Survey model={survey} />
        </div>
      </div>
      
      <div className="survey-footer">
        <div className="survey-hints">
          <p><strong>Hinweis:</strong> Ihr Fortschritt wird automatisch gespeichert.</p>
          <p>Bei Fragen wenden Sie sich an die Produktionsleitung.</p>
        </div>
      </div>
    </div>
  );
};

export default SurveyComponent;