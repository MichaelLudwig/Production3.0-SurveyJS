import React, { useEffect, useState } from 'react';
import 'survey-core/survey-core.min.css';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { ProductionOrder, SurveyAnswer, ValidationGroup } from '../types';
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
  const [validationData, setValidationData] = useState<{ [groupName: string]: any }>({});
  const [pendingMA2Groups, setPendingMA2Groups] = useState<string[]>([]);
  const [surveyDefinition, setSurveyDefinition] = useState<any>(null);
  const [validationGroups, setValidationGroups] = useState<ValidationGroup[]>([]);
  
  // Debug ValidationGroups State Änderungen
  useEffect(() => {
    console.log('[DEBUG] ValidationGroups state changed:', validationGroups);
    console.log('[DEBUG] ValidationGroups count:', validationGroups.length);
    if (validationGroups.length > 0) {
      console.log('[DEBUG] First group in state:', validationGroups[0]);
      console.log('[DEBUG] Raumstatus group in state:', validationGroups.find(g => g.name === 'raumstatus_pruefen'));
    }
  }, [validationGroups]);
  const [validationTrigger, setValidationTrigger] = useState(0);
  const [ma2NoticeHighlight, setMa2NoticeHighlight] = useState(false);

  // Hilfsfunktionen für Dateipfade
  const getSurveyInProgressPath = () => `data/surveys/survey-${productionOrder.id}-inprogress.json`;
  const getSurveyCompletedPath = (timestamp: string) => `data/surveys/survey-${productionOrder.id}-${timestamp}.json`;

  // Get current user entfernt - wird nicht mehr verwendet
  
  // Hilfsfunktion: Entferne Auftragsdaten aus Survey-Antworten
  const filterSurveyAnswers = (data: any) => {
    const surveyAnswers = { ...data };
    delete surveyAnswers.produktName;
    delete surveyAnswers.materialType;
    delete surveyAnswers.protokollNummer;
    delete surveyAnswers.bulkBeutelAnzahl;
    delete surveyAnswers.eingangsmaterial;
    delete surveyAnswers.primaerPackmittel;
    delete surveyAnswers.zwischenprodukt;
    delete surveyAnswers.probenzug;
    delete surveyAnswers.schablone;
    delete surveyAnswers.bulkmaterial;
    return surveyAnswers;
  };

  // Lade Survey-Definition und Validierungsgruppen über API
  useEffect(() => {
    (async () => {
      try {
        console.log('[Survey] Loading survey definition and validation groups from API...');
        
        // Lade Survey-Definition
        const surveyDef = await readJsonFile('data/master-data/surveyDefinition.json');
        console.log('[Survey] Survey definition loaded:', surveyDef ? 'success' : 'failed');
        setSurveyDefinition(surveyDef);
        
        // Lade Validierungsgruppen
        const validationGroupsData = await readJsonFile('data/master-data/validationGroups.json');
        console.log('[Survey] Validation groups loaded:', validationGroupsData ? 'success' : 'failed');
        console.log('[DEBUG] ValidationGroups API response:', validationGroupsData);
        console.log('[DEBUG] First group from API:', validationGroupsData?.[0]);
        console.log('[DEBUG] Setting validationGroups state...');
        setValidationGroups(validationGroupsData || []);
        console.log('[DEBUG] setValidationGroups called with:', validationGroupsData || []);
        
      } catch (error) {
        console.error('[Survey] Error loading survey configuration:', error);
        alert('Fehler beim Laden der Survey-Konfiguration. Bitte versuchen Sie es erneut.');
      }
    })();
  }, []);


  useEffect(() => {
    // Nur ausführen, wenn Survey-Definition geladen ist
    if (!surveyDefinition) {
      console.log('[Survey] Waiting for survey definition to load...');
      return;
    }
    
    console.log('[Survey] Creating survey model with loaded definition...');
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
    // Initialisiere Survey-Model nur mit Auftragsdaten, nicht mit initialAnswers
    surveyModel.data = { ...orderData };
    surveyModel.onComplete.add(async (sender) => {
      const answers = sender.data;
      onSurveyComplete(answers);
      // Speichere als abgeschlossenes Survey - neue saubere Struktur
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const surveyAnswers = filterSurveyAnswers(answers);
      await writeJsonFile(getSurveyCompletedPath(timestamp), {
        orderId: productionOrder.id,
        timestamp,
        status: 'completed',
        survey: surveyAnswers, // Nur Survey-Antworten
        validation: validationData // Validierungsgruppen (finaler Stand)
      });
      // Lösche den in-progress-Stand
      await writeJsonFile(getSurveyInProgressPath(), {});
    });
    surveyModel.onCurrentPageChanged.add(async (sender) => {
      setCurrentPageIndex(sender.currentPageNo);
      
      // Speichere Fortschritt bei Seitenwechsel
      try {
        console.log(`[Survey] Saving progress on page change to page ${sender.currentPageNo}`);
        const surveyAnswers = filterSurveyAnswers(sender.data);
        
        // Lade aktuelle Validierungsdaten aus der Datei (nicht aus dem State)
        let currentValidationData = {};
        try {
          const currentSaved = await readJsonFile(getSurveyInProgressPath());
          currentValidationData = currentSaved?.validation || {};
          console.log(`[Survey] Loaded current validation data for page change:`, currentValidationData);
        } catch (error) {
          console.log(`[Survey] No existing validation data found for page change`);
        }
        
        await writeJsonFile(getSurveyInProgressPath(), {
          orderId: productionOrder.id,
          timestamp: new Date().toISOString(),
          status: 'in_progress',
          survey: surveyAnswers,
          validation: currentValidationData, // Use data from file, not state
          currentPageNo: sender.currentPageNo
        });
        
        console.log(`[Survey] Progress saved successfully on page change`);
      } catch (error) {
        console.error('[Survey] Failed to save progress on page change:', error);
        // Navigation trotzdem erlauben - User nicht blockieren
      }
    });
    surveyModel.onValueChanged.add((_sender, options) => {
      const questionName = options.name;
      const newValue = options.value;
      console.log(`[Survey] Value changed: ${questionName} = ${JSON.stringify(newValue)}`);
      
      // Trigger Validierung nach State-Update (wartet bis SurveyJS survey.data aktualisiert hat)
      setTimeout(() => {
        console.log('[Survey] Triggering validation re-check after survey data update');
        setValidationTrigger(prev => prev + 1);
      }, 0);
    });
    setSurvey(surveyModel);
    
    // Lade saved progress NACH Survey-Model-Erstellung
    (async () => {
      try {
        console.log(`[Survey] Loading saved progress for freshly created survey model: ${productionOrder.id}`);
        const saved = await readJsonFile(getSurveyInProgressPath());
        if (saved) {
          console.log('[Survey] Loading saved progress - new structure:', {
            hasSurvey: !!saved.survey,
            hasValidation: !!saved.validation,
            currentPage: saved.currentPageNo,
            validationGroups: Object.keys(saved.validation || {}).length
          });
          
          // Neue saubere Struktur: Kombiniere Auftragsdaten mit Survey-Antworten
          let surveyData = { ...orderData }; // Starte mit Auftragsdaten
          
          // Lade Survey-Antworten aus dem neuen "survey" Feld
          if (saved.survey && Object.keys(saved.survey).length > 0) {
            console.log('[Survey] Loading survey answers:', saved.survey);
            surveyData = { ...surveyData, ...saved.survey };
          }
          
          // Setze Survey-Daten
          if (Object.keys(surveyData).length > 0) {
            console.log('[Survey] Restoring survey data:', surveyData);
            surveyModel.data = surveyData;
          }
          
          // Setze aktuelle Seite
          if (saved.currentPageNo !== undefined && saved.currentPageNo < surveyModel.pageCount) {
            console.log(`[Survey] Setting current page to: ${saved.currentPageNo}`);
            surveyModel.currentPageNo = saved.currentPageNo;
            setCurrentPageIndex(saved.currentPageNo);
          }
          
          // Validierungen laden für MA2-Logik
          if (saved.validation) {
            console.log('[Survey] Loading validation data:', saved.validation);
            setValidationData(saved.validation);
          }
        } else {
          console.log('[Survey] No saved progress for this survey');
        }
      } catch (error) {
        console.log('[Survey] No saved progress - starting fresh survey');
      }
    })();
    
    return () => {
      surveyModel.dispose();
    };
  }, [productionOrder, initialAnswers, onSurveyComplete, surveyDefinition]);

  // Block navigation when MA2 validations are pending (unverändert)
  useEffect(() => {
    if (survey) {
      survey.onCurrentPageChanging.clear();
      survey.onCurrentPageChanging.add((_sender, options) => {
        if (pendingMA2Groups.length > 0) {
          options.allowChanging = false;
          setMa2NoticeHighlight(true);
          setTimeout(() => setMa2NoticeHighlight(false), 2000);
        }
      });
    }
  }, [survey, pendingMA2Groups]);

  // Handle MA2 validation for a group - neue saubere Struktur
  const handleMA2Validation = async (groupName: string, ma2Data: { kuerzel: string; kommentar?: string; pruefungOK?: boolean }) => {
    const group = validationGroups.find(g => g.name === groupName);
    if (!group) return;
    const timestamp = new Date().toISOString();
    
    // Lade aktuelle Daten - handle missing file gracefully
    let currentSaved;
    try {
      currentSaved = await readJsonFile(getSurveyInProgressPath());
    } catch (error) {
      console.log('[MA2] No existing file found, creating new validation data');
      currentSaved = { validation: {} };
    }
    
    // Neue Validierungsstruktur - merge with existing validation data
    const updatedValidationData = {
      ...validationData, // Use current local state as base
      ...currentSaved?.validation, // Then merge any saved validation data
      [groupName]: {
        status: 'completed',
        ma2Kuerzel: ma2Data.kuerzel,
        ma2Timestamp: timestamp,
        ma2Kommentar: ma2Data.kommentar,
        validationOK: ma2Data.pruefungOK,
        validatedQuestions: group.questions
      }
    };
    
    // Update lokalen State
    setValidationData(updatedValidationData);
    
    // Filtere Survey-Antworten
    const surveyAnswers = filterSurveyAnswers(survey?.data || {});
    
    // Speichere mit neuer sauberer Struktur
    await writeJsonFile(getSurveyInProgressPath(), {
      orderId: productionOrder.id,
      timestamp: new Date().toISOString(),
      status: 'in_progress',
      survey: surveyAnswers, // Nur Survey-Antworten
      validation: updatedValidationData, // Validierungsgruppen
      currentPageNo: survey?.currentPageNo || 0
    });
    
    console.log(`[MA2] Validation completed for group: ${groupName}`, updatedValidationData[groupName]);
  };

  // Get answers for a specific validation group - direkter Zugriff auf lokale SurveyJS-Daten
  const getGroupAnswers = (group: ValidationGroup) => {
    const groupAnswers: { [key: string]: any } = {};
    
    console.log(`[Validation] Getting answers for group ${group.title}:`);
    console.log(`[Validation] Survey model data:`, survey?.data);
    
    group.questions.forEach(questionName => {
      // Direkter Zugriff auf lokale SurveyJS-Daten (sofort verfügbar)
      if (survey?.data && survey.data[questionName] !== undefined) {
        groupAnswers[questionName] = survey.data[questionName];
        console.log(`[Validation] ✅ Found answer for ${questionName}: ${JSON.stringify(survey.data[questionName])}`);
      } else {
        console.log(`[Validation] ❌ No answer found for ${questionName}`);
      }
    });
    
    console.log(`[Validation] Final group answers for ${group.title}:`, groupAnswers);
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

    const groups = validationGroups.filter(group => {
      // Check if any question from this group is on the current page
      const hasQuestionOnPage = group.questions.some(questionName => 
        allPageQuestions.includes(questionName)
      );
      
      // Debug logging
      if (hasQuestionOnPage) {
        console.log(`Found validation group on page: ${group.title}`, group.questions);
        console.log(`[DEBUG] ValidationGroup from state:`, {
          name: group.name,
          validationType: group.validationType,
          label: group.label,
          hasValidationType: group.validationType !== undefined
        });
      }
      
      return hasQuestionOnPage;
    });
    
    console.log(`Current page ${currentPageIndex} validation groups:`, groups.length);
    return groups;
  };

  // Trigger validation re-check when survey data or trigger changes
  useEffect(() => {
    if (!survey || !validationGroups.length) return;
    
    console.log('[Survey] Survey data changed, re-checking validation');
    
    const currentGroups = getCurrentPageValidationGroups();
    // Jetzt: Sowohl 'validation' als auch 'signature' blockieren
    const newPendingGroups = currentGroups
      .filter(group => (group.validationType === "validation" || group.validationType === "signature"))
      .filter(group => !validationData[group.name] || validationData[group.name].status !== 'completed')
      .map(group => group.name);
    
    console.log(`[MA2] Page ${currentPageIndex} - New pending groups:`, newPendingGroups);
    console.log(`[MA2] Current validation data:`, validationData);
    
    if (newPendingGroups.length !== pendingMA2Groups.length || 
        !newPendingGroups.every(name => pendingMA2Groups.includes(name))) {
      console.log(`[MA2] Updating pending groups from [${pendingMA2Groups}] to [${newPendingGroups}]`);
      setPendingMA2Groups(newPendingGroups);
    }
  }, [currentPageIndex, survey, validationGroups, validationData, validationTrigger]);

  const handleBackToOrder = async () => {
    // Speichere Fortschritt vor dem Wechsel
    try {
      console.log('[Survey] Saving progress before order switch...');
      const surveyAnswers = filterSurveyAnswers(survey?.data || {});
      
      // Lade aktuelle Validierungsdaten aus der Datei (nicht aus dem State)
      let currentValidationData = {};
      try {
        const currentSaved = await readJsonFile(getSurveyInProgressPath());
        currentValidationData = currentSaved?.validation || {};
        console.log(`[Survey] Loaded current validation data for order switch:`, currentValidationData);
      } catch (error) {
        console.log(`[Survey] No existing validation data found for order switch`);
      }
      
      await writeJsonFile(getSurveyInProgressPath(), {
        orderId: productionOrder.id,
        timestamp: new Date().toISOString(),
        status: 'in_progress',
        survey: surveyAnswers,
        validation: currentValidationData, // Use data from file, not state
        currentPageNo: survey?.currentPageNo || 0
      });
      
      console.log('[Survey] Progress saved successfully before order switch');
    } catch (error) {
      console.error('[Survey] Failed to save progress before order switch:', error);
      // Trotzdem navigieren - User nicht blockieren
    }
    
    onBackToOrder();
  };

  const getTotalPages = () => {
    return survey?.pageCount || 0;
  };

  const getCurrentPageTitle = () => {
    return survey?.currentPage?.title || '';
  };

  if (!surveyDefinition || !survey) {
    return (
      <div className="survey-loading">
        <p>Fragekatalog wird geladen...</p>
        {!surveyDefinition && <p>• Survey-Definition wird von Server geladen...</p>}
        {!survey && surveyDefinition && <p>• Survey wird initialisiert...</p>}
      </div>
    );
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
              {getCurrentPageValidationGroups().map(group => {
                console.log(`[DEBUG] Rendering MA2Validation for group: ${group.name}`, {
                  validationType: group.validationType,
                  label: group.label,
                  title: group.title,
                  fullGroup: group
                });
                return (
                  <MA2Validation
                    key={group.name}
                    group={group}
                    groupAnswers={getGroupAnswers(group)}
                    onMA2Validation={handleMA2Validation}
                    isCompleted={validationData[group.name]?.status === 'completed' || false}
                    surveyData={survey?.data}
                  />
                );
              })}
              
              {pendingMA2Groups.length > 0 && (
                <div className={`ma2-pending-notice${ma2NoticeHighlight ? ' highlight' : ''}`}>
                  <div>
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