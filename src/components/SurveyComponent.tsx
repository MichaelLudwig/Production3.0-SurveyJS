import React, { useEffect, useState } from 'react';
import 'survey-core/survey-core.min.css';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { ProductionOrder, SurveyAnswer, ValidationGroup, SurveyAnswerItem } from '../types';
import surveyDefinition from '../data/surveyDefinition.json';
import validationGroups from '../data/validationGroups.json';
import MA2Validation from './MA2Validation';
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
  const [enhancedAnswers, setEnhancedAnswers] = useState<SurveyAnswer>(initialAnswers);
  const [ma2Completions, setMA2Completions] = useState<{ [groupName: string]: boolean }>({});
  const [pendingMA2Groups, setPendingMA2Groups] = useState<string[]>([]);
  
  // Get current user (in real app, this would come from auth)
  const getCurrentUser = () => 'MA1'; // Placeholder - in real app get from auth context

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
      protokollNummer: productionOrder.protokollNummer,
      bulkBeutelAnzahl: productionOrder.bulkBeutelAnzahl,
      eingangsmaterial: productionOrder.eingangsmaterial,
      primaerPackmittel: productionOrder.primaerPackmittel,
      zwischenprodukt: productionOrder.zwischenprodukt,
      probenzug: productionOrder.probenzug,
      schablone: productionOrder.schablone,
      bulkmaterial: productionOrder.eingangsmaterial // NEU: für Soll-Ist-Vergleich Bulkmaterial
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
    
    
    surveyModel.onValueChanged.add((sender, options) => {
      // Enhanced MA1 tracking with audit trail
      const questionName = options.name;
      const newValue = options.value;
      const currentUser = getCurrentUser();
      const timestamp = new Date().toISOString();
      
      // Create enhanced answer with audit trail
      const enhancedAnswer: SurveyAnswerItem = {
        value: newValue,
        audit: {
          ma1Kuerzel: currentUser,
          ma1Timestamp: timestamp
        }
      };
      
      // Update enhanced answers
      setEnhancedAnswers(prev => {
        const newAnswers = {
          ...prev,
          [questionName]: enhancedAnswer
        };
        
        // Check if this question belongs to a validation group that now needs MA2
        const validationGroupsData = validationGroups as ValidationGroup[];
        const affectedGroups = validationGroupsData.filter(group => 
          group.requiresMA2 && group.questions.includes(questionName)
        );
        
        affectedGroups.forEach(group => {
          // Check if all questions in this group are now answered
          const allAnswered = group.questions.every(qName => {
            const answer = qName === questionName ? enhancedAnswer : newAnswers[qName];
            return answer && ((typeof answer === 'object' && 'value' in answer && answer.value !== undefined && answer.value !== '') || 
                             (typeof answer !== 'object' && answer !== undefined && answer !== ''));
          });
          
          if (allAnswered && !ma2Completions[group.name]) {
            // Add to pending MA2 groups
            setPendingMA2Groups(prev => 
              prev.includes(group.name) ? prev : [...prev, group.name]
            );
          }
        });
        
        return newAnswers;
      });
      
      // Auto-save with enhanced structure including MA2 state
      localStorage.setItem('surveyProgress', JSON.stringify({
        data: sender.data,
        enhancedData: { ...enhancedAnswers, [questionName]: enhancedAnswer },
        ma2Completions,
        pendingMA2Groups,
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
        
        // Restore enhanced answers and MA2 completions
        if (progress.enhancedData) {
          setEnhancedAnswers(progress.enhancedData);
        }
        if (progress.ma2Completions) {
          setMA2Completions(progress.ma2Completions);
        }
        
        // Restore pending MA2 groups
        if (progress.pendingMA2Groups) {
          setPendingMA2Groups(progress.pendingMA2Groups);
        }
      } catch (error) {
        console.error('Error loading survey progress:', error);
      }
    }
    
    setSurvey(surveyModel);
    
    return () => {
      surveyModel.dispose();
    };
  }, [productionOrder, initialAnswers, onSurveyComplete]);

  // Block navigation when MA2 validations are pending
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
  const handleMA2Validation = (groupName: string, ma2Data: { kuerzel: string; kommentar?: string }) => {
    const group = (validationGroups as ValidationGroup[]).find(g => g.name === groupName);
    if (!group) return;

    const timestamp = new Date().toISOString();

    // Update all questions in the group with MA2 data
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
            ma2Kommentar: ma2Data.kommentar
          }
        };
      }
    });

    setEnhancedAnswers(updatedAnswers);
    setMA2Completions(prev => ({ ...prev, [groupName]: true }));
    
    // Remove from pending groups
    setPendingMA2Groups(prev => prev.filter(name => name !== groupName));

    // Update localStorage with all MA2 state
    const updatedMA2Completions = { ...ma2Completions, [groupName]: true };
    const updatedPendingGroups = pendingMA2Groups.filter(name => name !== groupName);
    
    localStorage.setItem('surveyProgress', JSON.stringify({
      data: survey?.data || {},
      enhancedData: updatedAnswers,
      ma2Completions: updatedMA2Completions,
      pendingMA2Groups: updatedPendingGroups,
      currentPageNo: survey?.currentPageNo || 0
    }));
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