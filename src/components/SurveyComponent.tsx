import React, { useEffect, useState } from 'react';
import 'survey-core/survey-core.min.css';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { ProductionOrder, SurveyAnswer, ValidationGroup, SurveyAnswerItem } from '../types';
import surveyDefinition from '../data/surveyDefinition.json';
import validationGroups from '../data/validationGroups.json';
import MA2Validation from './MA2Validation';
import './SurveyComponent.css';
import { surveyLocalization } from 'survey-core';
surveyLocalization.currentLocale = 'de';
import { readJsonFile, writeJsonFile } from '../utils/exportUtils';

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
  const [enhancedAnswers, setEnhancedAnswers] = useState<SurveyAnswer>(initialAnswers);
  const [ma2Completions, setMA2Completions] = useState<{ [groupName: string]: boolean }>({});
  const [pendingMA2Groups, setPendingMA2Groups] = useState<string[]>([]);

  // Hilfsfunktionen für Dateipfade
  const getSurveyInProgressPath = () => `data/surveys/survey-${productionOrder.id}-inprogress.json`;
  const getSurveyCompletedPath = (timestamp: string) => `data/surveys/survey-${productionOrder.id}-${timestamp}.json`;

  // Get current user (in real app, this would come from auth)
  const getCurrentUser = () => 'MA1'; // Placeholder - in real app get from auth context

  // Lade Bearbeitungsstand aus Datei (statt localStorage)
  useEffect(() => {
    (async () => {
      try {
        const saved = await readJsonFile(getSurveyInProgressPath());
        if (saved) {
          // Übernehme alle relevanten Felder
          if (saved.data) survey && (survey.data = saved.data);
          if (saved.currentPageNo) setCurrentPageIndex(saved.currentPageNo);
          if (saved.enhancedData) setEnhancedAnswers(saved.enhancedData);
          if (saved.ma2Completions) setMA2Completions(saved.ma2Completions);
          if (saved.pendingMA2Groups) setPendingMA2Groups(saved.pendingMA2Groups);
        }
      } catch (error) {
        // Kein gespeicherter Stand vorhanden
      }
    })();
  }, [productionOrder.id]);

  useEffect(() => {
    // Create survey model exactly as per SurveyJS documentation
    const surveyModel = new Model(surveyDefinition);
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
      protokollNummer: productionOrder.protokollNummer,
      bulkBeutelAnzahl: productionOrder.bulkBeutelAnzahl,
      eingangsmaterial: productionOrder.eingangsmaterial,
      primaerPackmittel: productionOrder.primaerPackmittel,
      zwischenprodukt: productionOrder.zwischenprodukt,
      probenzug: productionOrder.probenzug,
      schablone: productionOrder.schablone,
      bulkmaterial: productionOrder.eingangsmaterial // NEU: für Soll-Ist-Vergleich Bulkmaterial
    };
    surveyModel.data = { ...orderData, ...initialAnswers };
    surveyModel.onComplete.add(async (sender) => {
      const answers = sender.data;
      onSurveyComplete(answers);
      // Speichere als abgeschlossenes Survey
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await writeJsonFile(getSurveyCompletedPath(timestamp), {
        orderId: productionOrder.id,
        timestamp,
        status: 'completed',
        answers: enhancedAnswers,
        auditTrail: enhancedAnswers // oder extrahiert, je nach Struktur
      });
      // Lösche den in-progress-Stand
      await writeJsonFile(getSurveyInProgressPath(), {});
    });
    surveyModel.onCurrentPageChanged.add(async (sender) => {
      setCurrentPageIndex(sender.currentPageNo);
      // Speichere Fortschritt in Datei
      await writeJsonFile(getSurveyInProgressPath(), {
        data: sender.data,
        enhancedData: enhancedAnswers,
        ma2Completions,
        pendingMA2Groups,
        currentPageNo: sender.currentPageNo
      });
    });
    surveyModel.onValueChanged.add(async (sender, options) => {
      const questionName = options.name;
      const newValue = options.value;
      const currentUser = getCurrentUser();
      const timestamp = new Date().toISOString();
      const enhancedAnswer: SurveyAnswerItem = {
        value: newValue,
        audit: {
          ma1Kuerzel: currentUser,
          ma1Timestamp: timestamp
        }
      };
      setEnhancedAnswers(prev => {
        const newAnswers = {
          ...prev,
          [questionName]: enhancedAnswer
        };
        // Prüfe Validierungsgruppen wie gehabt ...
        // ...
        return newAnswers;
      });
      // Speichere Fortschritt in Datei
      await writeJsonFile(getSurveyInProgressPath(), {
        data: sender.data,
        enhancedData: { ...enhancedAnswers, [questionName]: enhancedAnswer },
        ma2Completions,
        pendingMA2Groups,
        currentPageNo: sender.currentPageNo
      });
    });
    setSurvey(surveyModel);
    return () => {
      surveyModel.dispose();
    };
  }, [productionOrder, initialAnswers, onSurveyComplete]);

  // Block navigation when MA2 validations are pending (unverändert)
  useEffect(() => {
    if (survey) {
      survey.onCurrentPageChanging.clear();
      survey.onCurrentPageChanging.add((sender, options) => {
        if (pendingMA2Groups.length > 0) {
          options.allowChanging = false;
          alert('Bitte alle MA2-Validierungen abschließen, bevor Sie fortfahren.');
        }
      });
    }
  }, [survey, pendingMA2Groups]);

  // Handle MA2 validation for a group
  const handleMA2Validation = async (groupName: string, ma2Data: { kuerzel: string; kommentar?: string; pruefungOK?: boolean }) => {
    const group = (validationGroups as ValidationGroup[]).find(g => g.name === groupName);
    if (!group) return;
    const timestamp = new Date().toISOString();
    const updatedAnswers = { ...enhancedAnswers };
    group.questions.forEach(questionName => {
      if (updatedAnswers[questionName]) {
        const currentAnswer = updatedAnswers[questionName] as SurveyAnswerItem;
        updatedAnswers[questionName] = {
          ...currentAnswer,
          audit: {
            ...currentAnswer.audit,
            ma2Kuerzel: ma2Data.kuerzel,
            ma2Timestamp: timestamp,
            ma2Kommentar: ma2Data.kommentar,
            ma2PruefungOK: ma2Data.pruefungOK
          }
        };
      }
    });
    setEnhancedAnswers(updatedAnswers);
    setMA2Completions(prev => ({ ...prev, [groupName]: true }));
    setPendingMA2Groups(prev => prev.filter(name => name !== groupName));
    // Speichere Fortschritt in Datei
    await writeJsonFile(getSurveyInProgressPath(), {
      data: survey?.data || {},
      enhancedData: updatedAnswers,
      ma2Completions: { ...ma2Completions, [groupName]: true },
      pendingMA2Groups: pendingMA2Groups.filter(name => name !== groupName),
      currentPageNo: survey?.currentPageNo || 0
    });
  };

  // Get answers for a specific validation group
  const getGroupAnswers = (group: ValidationGroup) => {
    const groupAnswers: { [key: string]: any } = {};
    
    console.log(`Getting answers for group ${group.title}:`);
    console.log(`Enhanced answers:`, enhancedAnswers);
    console.log(`Survey data:`, survey?.data);
    
    group.questions.forEach(questionName => {
      // First try enhanced answers
      const enhancedAnswer = enhancedAnswers[questionName];
      if (enhancedAnswer && typeof enhancedAnswer === 'object' && 'value' in enhancedAnswer) {
        groupAnswers[questionName] = (enhancedAnswer as SurveyAnswerItem).value;
      } 
      // Fallback to survey data
      else if (survey?.data && survey.data[questionName] !== undefined) {
        groupAnswers[questionName] = survey.data[questionName];
      }
      // Final fallback
      else {
        groupAnswers[questionName] = enhancedAnswer;
      }
      
      console.log(`Question ${questionName}: enhanced=${enhancedAnswer}, survey=${survey?.data?.[questionName]}, final=${groupAnswers[questionName]}`);
    });
    
    console.log(`Final group answers for ${group.title}:`, groupAnswers);
    return groupAnswers;
  };

  // Check if current page needs MA2 validation
  const getCurrentPageValidationGroups = () => {
    if (!survey) return [];
    
    const currentPage = survey.pages[currentPageIndex];
    if (!currentPage) return [];

    // Function to recursively find all questions in elements (including panels)
    const getAllQuestionNames = (elements: any[]): string[] => {
      const questionNames: string[] = [];
      elements.forEach(element => {
        if (element.name && element.type !== 'panel' && element.type !== 'html') {
          questionNames.push(element.name);
        }
        // Recursively search in panel elements
        if (element.elements && Array.isArray(element.elements)) {
          questionNames.push(...getAllQuestionNames(element.elements));
        }
        // Also check templateElements for dynamic panels
        if (element.templateElements && Array.isArray(element.templateElements)) {
          questionNames.push(...getAllQuestionNames(element.templateElements));
        }
      });
      return questionNames;
    };

    const allPageQuestions = getAllQuestionNames(currentPage.elements);
    console.log(`Page ${currentPageIndex} all questions:`, allPageQuestions);

    const groups = (validationGroups as ValidationGroup[]).filter(group => {
      // Check if any question from this group is on the current page
      const hasQuestionOnPage = group.questions.some(questionName => 
        allPageQuestions.includes(questionName)
      );
      
      // Debug logging
      if (hasQuestionOnPage) {
        console.log(`Found validation group on page: ${group.title}`, group.questions);
      }
      
      return hasQuestionOnPage;
    });
    
    console.log(`Current page ${currentPageIndex} validation groups:`, groups.length);
    return groups;
  };

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
      <div className="survey-header-compact">
        <div className="header-line-1">
          <span className="order-name">{productionOrder.produktName}</span>
          <span className="material-type">({productionOrder.materialType})</span>
          <button className="btn-minimal" onClick={handleBackToOrder}>Auftrag wechseln</button>
        </div>
        <div className="header-line-2">
          <div className="current-step">{getCurrentPageTitle()}</div>
          <div className="progress-info">Seite {currentPageIndex + 1} von {getTotalPages()}</div>
        </div>
      </div>
      
      {/* Full-width progress bar */}
      <div className="full-width-progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((currentPageIndex + 1) / getTotalPages()) * 100}%` }}
        ></div>
      </div>
      
      <div className="survey-content">
        
        <div className="survey-split-container">
          {/* Left Panel: MA1 Questions */}
          <div className="survey-left-panel">
            <div className={`survey-wrapper ${pendingMA2Groups.length > 0 ? 'ma2-pending' : ''}`}>
              <Survey model={survey} />
            </div>
          </div>
          
          {/* Right Panel: MA2 Validation */}
          <div className="survey-right-panel">
            <div className="ma2-validation-wrapper">
              {getCurrentPageValidationGroups().map(group => (
                <MA2Validation
                  key={group.name}
                  group={group}
                  groupAnswers={getGroupAnswers(group)}
                  onMA2Validation={handleMA2Validation}
                  isCompleted={ma2Completions[group.name] || false}
                  surveyData={survey?.data}
                />
              ))}
              
              {pendingMA2Groups.length > 0 && (
                <div className="ma2-pending-notice">
                  <div style={{
                    background: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: '4px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    textAlign: 'center'
                  }}>
                    <strong>⚠️ Zweite Person erforderlich</strong>
                    <p>Bitte alle Validierungen abschließen, bevor Sie fortfahren können.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="survey-footer-compact">
        <span>Fortschritt wird automatisch gespeichert</span>
      </div>
    </div>
  );
};

export default SurveyComponent;