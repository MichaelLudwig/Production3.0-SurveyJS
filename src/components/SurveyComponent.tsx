import React, { useEffect, useState } from 'react';
import 'survey-core/survey-core.min.css';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { ProductionOrder, SurveyAnswer, ValidationGroup } from '../types';
import MA2Validation from './MA2Validation';
import BulkBeutelDashboard from './BulkBeutelDashboard';
import './SurveyComponent.css';
import { surveyLocalization } from 'survey-core';
surveyLocalization.currentLocale = 'de';
import { readJsonFile, writeJsonFile } from '../utils/exportUtils';

interface SurveyComponentProps {
  productionOrder: ProductionOrder;
  initialAnswers: SurveyAnswer;
  onSurveyComplete: (answers: SurveyAnswer, validation?: Record<string, any>) => void;
  onBackToOrder: () => void;
}

// Lokale Erweiterung für materialType
interface ValidationGroupWithMaterialType extends ValidationGroup {
  materialType?: string;
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
  const [surveyData, setSurveyData] = useState<any>(null);

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

    delete surveyAnswers.eingangsmaterial;
    delete surveyAnswers.primaerPackmittel;
    delete surveyAnswers.zwischenprodukt;
    delete surveyAnswers.probenzug;
    delete surveyAnswers.schablone;
    delete surveyAnswers.bulkmaterial;
    return surveyAnswers;
  };

  // Hilfsfunktion für sicheren Zugriff auf verschachtelte Properties
  function getNested(obj: any, path: string[]) {
    return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }

  // Lade Survey-Definition, Validierungsgruppen und Survey-Daten über API
  useEffect(() => {
    (async () => {
      try {
        console.log('[Survey] Loading survey definition, validation groups and survey data from API...');
        
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
        
        // Lade Survey-Daten für Dashboard
        const surveyDataPath = getSurveyInProgressPath();
        console.log('[Survey] Loading survey data from:', surveyDataPath);
        const surveyDataFromFile = await readJsonFile(surveyDataPath);
        console.log('[Survey] Survey data loaded:', surveyDataFromFile ? 'success' : 'failed');
        console.log('[Survey] Survey data content:', surveyDataFromFile);
        
        if (surveyDataFromFile) {
          setSurveyData(surveyDataFromFile);
        } else {
          // Fallback zu initialAnswers wenn keine Datei existiert
          setSurveyData(initialAnswers);
        }
        
      } catch (error) {
        console.error('[Survey] Error loading survey data:', error);
        // Wenn die Datei nicht existiert, ist das normal - starte mit leeren Daten
        if ((error as any).message?.includes('File not found')) {
          console.log('[Survey] No existing survey data found - starting fresh');
          setSurveyData(initialAnswers);
        } else {
          // Nur bei echten Fehlern eine Warnung anzeigen
          alert('Fehler beim Laden der Survey-Daten. Bitte versuchen Sie es erneut.');
        }
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

      eingangsmaterial: productionOrder.eingangsmaterial,
      primaerPackmittel: productionOrder.primaerPackmittel,
      zwischenprodukt: productionOrder.zwischenprodukt,
      probenzug: productionOrder.probenzug,
      schablone: productionOrder.schablone,
      bulkmaterial: productionOrder.eingangsmaterial // NEU: für Soll-Ist-Vergleich Bulkmaterial
    };
    
    // Debug: Überprüfe materialType
    console.log('[Survey] Production order materialType:', productionOrder.materialType);
    console.log('[Survey] Order data materialType:', orderData.materialType);
    // Dynamische Soll-Wert-Beschreibungen für relevante Felder setzen
    const sollMappings = [
      // Bulkmaterial
      { frage: "produktbezeichnung_bulk_ist", pfad: ["eingangsmaterial", "produktbezeichnung"] },
      { frage: "artikelnr_bulk_ist", pfad: ["eingangsmaterial", "artikelNummer"] },
      { frage: "charge_bulk_ist", pfad: ["eingangsmaterial", "charge"] },
      { frage: "verfall_bulk_ist", pfad: ["eingangsmaterial", "verfall"] },
      // Schablonen
      { frage: "schablonen_eq_ist", pfad: ["schablone", "eqNummer"] },
      { frage: "schablonen_charge_ist", pfad: ["schablone", "charge"] },
      { frage: "schablonen_anzahl_ist", pfad: ["schablone", "anzahl"] },
      // Primärpackmittel (Beispiel)
      { frage: "produktbezeichnung_ist", pfad: ["primaerPackmittel", "produktbezeichnung"] },
      { frage: "artikelnummer_ist", pfad: ["primaerPackmittel", "artikelNummer"] },
      { frage: "charge_ist", pfad: ["primaerPackmittel", "charge"] },
      { frage: "anzahl_ist", pfad: ["primaerPackmittel", "anzahl"] },
      // ... weitere Felder nach Bedarf
    ];
    sollMappings.forEach(({ frage, pfad }) => {
      const question = surveyModel.getQuestionByName(frage);
      const soll = getNested(orderData, pfad);
      if (question && soll !== undefined) {
        question.description = `Soll: ${soll}`;
      }
    });
    // Initialisiere Survey-Model nur mit Auftragsdaten, nicht mit initialAnswers
    surveyModel.data = { ...orderData };
    
    // Debug: Direkte Überprüfung der materialType und Sichtbarkeitsbedingungen
    console.log('[Survey] Survey initialized with materialType:', surveyModel.data.materialType);
    
    // Teste Sichtbarkeitsbedingungen für GACP-spezifische Fragen
    const testGACPQuestions = [
      'probenzug_ipk_titel',
      'probenzug_ipk_abgefuellt_ma1', 
      'gesamtmenge_probenzug_ipk'
    ];
    testGACPQuestions.forEach(questionName => {
      const question = surveyModel.getQuestionByName(questionName);
      if (question) {
        console.log(`[Survey] Initial GACP Question ${questionName}:`, {
          visible: question.isVisible,
          materialType: surveyModel.data.materialType,
          condition: question.visibleIf
        });
      } else {
        console.log(`[Survey] Initial GACP Question ${questionName} not found`);
      }
    });
    
    surveyModel.onComplete.add(async (sender) => {
      const answers = sender.data;
      onSurveyComplete(answers, validationData);
      
      try {
        // Speichere als abgeschlossenes Survey - neue saubere Struktur
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const surveyAnswers = filterSurveyAnswers(answers);
        
        // Speichere lokal
        await writeJsonFile(getSurveyCompletedPath(timestamp), {
          orderId: productionOrder.id,
          timestamp,
          status: 'completed',
          survey: surveyAnswers, // Nur Survey-Antworten
          validation: validationData // Validierungsgruppen (finaler Stand)
        });
        
        // Rufe Backend API auf
        const response = await fetch(`/api/surveys/${productionOrder.id}/complete`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            answers: surveyAnswers,
            auditTrail: validationData,
            productionOrder: productionOrder,
            completedAt: timestamp
          })
        });
        
        if (response.ok) {
          console.log('[Survey] Backend completion API called successfully');
        } else {
          console.error('[Survey] Backend completion API failed:', response.statusText);
        }
        
        // Lösche den in-progress-Stand
        await writeJsonFile(getSurveyInProgressPath(), {});
      } catch (error) {
        console.error('[Survey] Error during survey completion:', error);
      }
    });
    surveyModel.onCurrentPageChanged.add(async (sender) => {
      setCurrentPageIndex(sender.currentPageNo);
      
      // Debug: Überprüfe materialType und Sichtbarkeitsbedingungen bei jedem Seitenwechsel
      console.log('[Survey] Page changed - materialType in survey data:', sender.data.materialType);
      console.log('[Survey] Page changed - current page name:', sender.currentPage?.name);
      
      // Überprüfe GACP-spezifische Fragen auf der aktuellen Seite
      if (sender.currentPage?.name === 'kumulierte_restmenge_probenzug') {
        const ipkQuestions = [
          'probenzug_ipk_titel',
          'probenzug_ipk_abgefuellt_ma1',
          'gesamtmenge_probenzug_ipk'
        ];
        ipkQuestions.forEach(questionName => {
          const question = sender.getQuestionByName(questionName);
          if (question) {
            console.log(`[Survey] GACP Question ${questionName}:`, {
              visible: question.isVisible,
              parentVisible: question.parent?.isVisible,
              materialType: sender.data.materialType,
              condition: question.visibleIf
            });
          } else {
            console.log(`[Survey] GACP Question ${questionName} not found`);
          }
        });
      }
      
      // Lade produktliste wenn zur Schleusungsseite navigiert wird
      if (sender.currentPage?.name === 'schleusung_eurocontainer') {
        try {
          const savedData = await readJsonFile(getSurveyInProgressPath());
          if (savedData?.survey?.schleusung_eurocontainer?.produktliste) {
            console.log('[Survey] Loading produktliste for schleusung_eurocontainer page:', savedData.survey.schleusung_eurocontainer.produktliste);
            
            // Stelle sicher, dass alle art_inhalt Werte korrekt gesetzt sind
            const produktliste = savedData.survey.schleusung_eurocontainer.produktliste.map((item: any) => ({
              ...item,
              art_inhalt: item.art_inhalt || "Hergestellte Zwischenprodukte"
            }));
            
            sender.setValue('produktliste', produktliste);
            
            // Verzögerung für die Anzeige
            setTimeout(() => {
              console.log('[Survey] Refreshing produktliste display');
              sender.render();
            }, 100);
          }
        } catch (error) {
          console.log('[Survey] No saved produktliste data found');
        }
      }
      
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
          
          // Prüfe ob Validierungsdaten gültig sind (nicht leer)
          if (Object.keys(currentValidationData).length === 0) {
            console.log(`[Survey] Empty validation data found, using current state instead`);
            currentValidationData = validationData; // Verwende aktuellen State
          }
        } catch (error) {
          console.log(`[Survey] No existing validation data found for page change, using current state`);
          currentValidationData = validationData; // Verwende aktuellen State
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
          
          // Debug: Überprüfe materialType vor dem Laden der Survey-Antworten
          console.log('[Survey] Survey data materialType before loading answers:', surveyData.materialType);
          
          // Lade Survey-Antworten aus dem neuen "survey" Feld
          if (saved.survey && Object.keys(saved.survey).length > 0) {
            console.log('[Survey] Loading survey answers:', saved.survey);
            surveyData = { ...surveyData, ...saved.survey };
            
            // Debug: Überprüfe materialType nach dem Laden der Survey-Antworten
            console.log('[Survey] Survey data materialType after loading answers:', surveyData.materialType);
            
            // Stelle sicher, dass materialType nicht überschrieben wurde
            if (surveyData.materialType !== orderData.materialType) {
              console.log('[Survey] WARNING: materialType was overwritten, restoring from order data');
              surveyData.materialType = orderData.materialType;
            }
            
            // Spezielle Behandlung für produktliste - lade aus schleusung_eurocontainer.produktliste
            if (saved.survey.schleusung_eurocontainer?.produktliste) {
              console.log('[Survey] Loading produktliste from schleusung_eurocontainer:', saved.survey.schleusung_eurocontainer.produktliste);
              surveyData.produktliste = saved.survey.schleusung_eurocontainer.produktliste;
            }
          }
          
          // Setze Survey-Daten
          if (Object.keys(surveyData).length > 0) {
            console.log('[Survey] Restoring survey data:', surveyData);
            surveyModel.data = surveyData;
            
            // Debug: Überprüfe materialType in SurveyJS-Model
            console.log('[Survey] SurveyJS model materialType:', surveyModel.data.materialType);
            
            // Test: Überprüfe Sichtbarkeitsbedingungen für GACP-spezifische Fragen
            const ipkQuestions = [
              'probenzug_ipk_abgefuellt_ma1',
              'gesamtmenge_probenzug_ipk'
            ];
            ipkQuestions.forEach(questionName => {
              const question = surveyModel.getQuestionByName(questionName);
              if (question) {
                console.log(`[Survey] Question ${questionName} visible:`, question.isVisible);
                console.log(`[Survey] Question ${questionName} parent visible:`, question.parent?.isVisible);
              } else {
                console.log(`[Survey] Question ${questionName} not found`);
              }
            });
            
            // Spezielle Behandlung für produktliste nach dem Setzen der Daten
            if (saved.survey?.schleusung_eurocontainer?.produktliste) {
              console.log('[Survey] Setting produktliste in survey model:', saved.survey.schleusung_eurocontainer.produktliste);
              surveyModel.setValue('produktliste', saved.survey.schleusung_eurocontainer.produktliste);
            }
          }
          
          // Setze aktuelle Seite
          if (saved.currentPageNo !== undefined && saved.currentPageNo >= 0 && saved.currentPageNo < surveyModel.pageCount) {
            console.log(`[Survey] Setting current page to: ${saved.currentPageNo}`);
            surveyModel.currentPageNo = saved.currentPageNo;
            setCurrentPageIndex(saved.currentPageNo);
          } else if (saved.currentPageNo === -1 || saved.currentPageNo === undefined) {
            console.log(`[Survey] Invalid currentPageNo (${saved.currentPageNo}), starting from page 0`);
            surveyModel.currentPageNo = 0;
            setCurrentPageIndex(0);
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
        // Prüfe, ob zurück navigiert wird
        const isBackwards = options.newCurrentPage && options.oldCurrentPage &&
          survey.visiblePages.indexOf(options.newCurrentPage) < survey.visiblePages.indexOf(options.oldCurrentPage);

        if (!isBackwards && pendingMA2Groups.length > 0) {
          options.allowChanging = false;
          setMa2NoticeHighlight(true);
          setTimeout(() => setMa2NoticeHighlight(false), 2000);
        }
        // Beim Zurückgehen: keine Blockade!
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
    
    // Sammle die validierten Antworten für diese Gruppe
    const validatedAnswers: { [questionName: string]: any } = {};
    group.questions.forEach(questionName => {
      if (survey?.data && survey.data[questionName] !== undefined) {
        validatedAnswers[questionName] = survey.data[questionName];
      }
    });
    
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
        validatedQuestions: group.questions,
        validatedAnswers: validatedAnswers // NEU: Speichere die validierten Antworten
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
    
    const currentPage = survey.visiblePages[survey.currentPageNo];
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

    const currentMaterialType = survey?.data?.materialType || "ALL";
    const groups = (validationGroups as ValidationGroupWithMaterialType[]).filter(group => {
      if (group.materialType && group.materialType !== "ALL" && group.materialType !== currentMaterialType) {
        return false;
      }
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

  // Neue Funktion: Bestimme den aktuellen Standort basierend auf der Seite
  const getCurrentLocation = () => {
    const currentTitle = getCurrentPageTitle();
    
    // Reinraum-Bereich: Nur Produktionsseiten "3.x" bis "7.x"
    if (currentTitle.startsWith('3.') || 
        currentTitle.startsWith('4.') || 
        currentTitle.startsWith('5.') || 
        currentTitle.startsWith('6.') || 
        currentTitle.startsWith('7.')) {
      return 'reinraum';
    }
    
    // Lager-Bereich: Alle anderen Seiten (1.x, 2.x, 8.x, 9.x, 10.x, 11.x, 12.x)
    return 'lager';
  };

  // Debug: Log location changes
  useEffect(() => {
    const currentLocation = getCurrentLocation();
    console.log('[Location Debug]', {
      currentTitle: getCurrentPageTitle(),
      location: currentLocation,
      pageIndex: currentPageIndex,
      containerClasses: `survey-container location-${currentLocation}`
    });
  }, [currentPageIndex, survey]);

  // Prüfe ob wir auf der Dashboard-Seite sind
  const isDashboardPage = () => {
    const currentTitle = getCurrentPageTitle();
    return currentTitle === '4.2 Primärverpackung - Produktionslauf';
  };

  // Handler für Dashboard-Daten-Updates
  const handleDashboardDataUpdate = async (data: any) => {
    setSurveyData(data);
    
    // Aktualisiere auch das Survey-Model für Konsistenz
    if (survey && data.survey) {
      survey.data = data.survey;
    }
    
    // Speichere die aktualisierten Daten in die Survey JSON
    try {
      // Lade aktuelle Validierungsdaten aus der Datei, um sie nicht zu verlieren
      let currentValidationData = {};
      try {
        const currentSaved = await readJsonFile(getSurveyInProgressPath());
        currentValidationData = currentSaved?.validation || {};
        console.log(`[Dashboard] Loaded current validation data:`, currentValidationData);
      } catch (error) {
        console.log(`[Dashboard] No existing validation data found`);
      }
      
      const response = await fetch(`/api/surveys/${productionOrder.id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          validation: currentValidationData, // Behalte Validierungsdaten bei
          currentPageNo: currentPageIndex
        })
      });
      
      if (response.ok) {
        console.log('[Dashboard] Survey data saved successfully');
        
        // Aktualisiere auch die lokale Datei für Konsistenz
        try {
          const surveyAnswers = filterSurveyAnswers(data.survey || {});
          await writeJsonFile(getSurveyInProgressPath(), {
            orderId: productionOrder.id,
            timestamp: new Date().toISOString(),
            status: 'in_progress',
            survey: surveyAnswers,
            validation: currentValidationData,
            currentPageNo: currentPageIndex
          });
          console.log('[Dashboard] Local file updated successfully');
        } catch (error) {
          console.error('[Dashboard] Error updating local file:', error);
        }
      } else {
        console.error('[Dashboard] Failed to save survey data:', response.statusText);
      }
    } catch (error) {
      console.error('[Dashboard] Error saving survey data:', error);
    }
  };

  // Navigation Handler für Dashboard
  const handleDashboardNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPageIndex > 0) {
      survey?.prevPage();
    } else if (direction === 'next' && currentPageIndex < getTotalPages() - 1) {
      // Prüfe, ob alle Bulk Beutel abgeschlossen sind und setze restmenge_eingang
      if (isDashboardPage()) {
        const existingProduction = surveyData?.survey?.bulk_beutel_production || [];
        const totalBulkBeutel = surveyData?.survey?.bulkgebinde_liste?.reduce((total: number, item: any) => total + item.anzahl, 0) || 0;
        
        // Zähle nur die tatsächlich ausgefüllten BulkBeutel (mit bulk_nummer)
        const completedBulkBeutel = existingProduction.filter((entry: any) => 
          entry.bulk_nummer && entry.bulk_nummer !== ""
        ).length;
        
        console.log(`[Navigation] Total bulk beutel: ${totalBulkBeutel}, Completed: ${completedBulkBeutel}`);
        
        // Wenn alle Bulk Beutel abgeschlossen sind
        if (completedBulkBeutel === totalBulkBeutel && totalBulkBeutel > 0) {
          // Berechne kummulierte Restmenge
          const kummulierteRestmenge = existingProduction.reduce((total: number, entry: any) => {
            const restmenge = parseFloat(entry.restmenge) || 0;
            return total + restmenge;
          }, 0);
          
          // Setze den Wert in das restmenge_eingang Feld
          if (survey && kummulierteRestmenge > 0) {
            console.log(`[Survey] Setting restmenge_eingang to ${kummulierteRestmenge} after completing all bulk beutels`);
            survey.setValue('restmenge_eingang', kummulierteRestmenge.toFixed(2));
          }
          
          // Erstelle automatisch die Eurocontainer-Liste für die Schleusungsseite
          const produktliste = existingProduction.map((entry: any, index: number) => ({
            art_inhalt: "Hergestellte Zwischenprodukte",
            anzahl_gebinde: entry.anzahl_gebinde || "0",
            plomben_nr: (1000000 + index + 1).toString(),
            plomben_nr_2: null
          }));
          
          if (survey && produktliste.length > 0) {
            console.log(`[Survey] Setting produktliste with ${produktliste.length} entries for schleusung_eurocontainer`);
            survey.setValue('produktliste', produktliste);
          }
        }
      }
      
      // Stelle sicher, dass SurveyJS die Seite als valid betrachtet
      if (survey) {
        // Setze alle required fields der paneldynamic als "beantwortet"
        const currentPage = survey.currentPage;
        if (currentPage && currentPage.elements) {
          currentPage.elements.forEach((element: any) => {
            if (element.type === 'paneldynamic' && element.name === 'bulk_beutel_production') {
              // Markiere das paneldynamic als valid
              survey.setValue(element.name, surveyData?.survey?.bulk_beutel_production || []);
            }
          });
        }
        
        console.log('[Navigation] Attempting to navigate to next page...');
        
        // Direkte Navigation umgeht SurveyJS-Validierung
        const nextPageIndex = currentPageIndex + 1;
        if (nextPageIndex < getTotalPages()) {
          console.log(`[Navigation] Direct navigation to page ${nextPageIndex}`);
          survey.currentPageNo = nextPageIndex;
          setCurrentPageIndex(nextPageIndex);
        } else {
          console.log('[Navigation] Already on last page');
        }
      }
    }
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
    <div className={`survey-container location-${getCurrentLocation()}`} 
         data-location={getCurrentLocation()}>
      <div className="survey-header-compact">
        <div className="header-line-1">
          <span className="order-name">{productionOrder.produktName}</span>
          <span
            className={`material-type-badge ${productionOrder.materialType === 'GMP' ? 'badge-gmp' : 'badge-gacp'}`}
          >
            {productionOrder.materialType}
          </span>
          <button className="btn-minimal" onClick={handleBackToOrder}>Auftrag wechseln</button>
        </div>
        <div className="header-line-2">
          <div className="current-step">
            <span className={`location-indicator ${getCurrentLocation()}`}>
              {getCurrentLocation() === 'lager' ? 'LAGER' : 'REINRAUM'}
            </span>
            {getCurrentPageTitle()}


          </div>
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
        {isDashboardPage() ? (
          <>
            <BulkBeutelDashboard
              productionOrder={productionOrder}
              surveyData={surveyData}
              onSurveyDataUpdate={handleDashboardDataUpdate}
              surveyDefinition={surveyDefinition}
            />
            {/* Navigation für Dashboard */}
            <div className="dashboard-navigation">
              <button 
                className="nav-btn nav-prev"
                onClick={() => handleDashboardNavigation('prev')}
                disabled={currentPageIndex === 0}
              >
                ← Zurück
              </button>
              <button 
                className="nav-btn nav-next"
                onClick={() => handleDashboardNavigation('next')}
                disabled={currentPageIndex === getTotalPages() - 1}
              >
                Weiter →
              </button>
            </div>
          </>
        ) : (
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
                      surveyData={productionOrder}
                      validationData={validationData}
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
        )}
      </div>
      
      <div className="survey-footer-compact">
        <span>Fortschritt wird automatisch gespeichert</span>
      </div>
    </div>
  );
};

export default SurveyComponent;