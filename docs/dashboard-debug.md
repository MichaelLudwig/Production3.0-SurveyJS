# Dashboard Probleme - Analyse und Lösungen

## Übersicht

Dieses Dokument beschreibt zwei kritische Probleme mit dem BulkBeutel Dashboard und deren Lösungen:

1. **Problem 1: Datenverlust beim Seitenwechsel** - Survey-Daten werden beim Übergang zum Dashboard gelöscht
2. **Problem 2: Bulk Beutel Boxen werden nicht angezeigt** - Material Eingang zeigt keine Bulk Beutel beim ersten Übergang

---

## Problem 1: Datenverlust beim Seitenwechsel

### Symptome
- Beim Übergang von Seite 12 zu Seite 13 werden **alle Survey-Daten** in der `survey-{id}-inprogress.json` gelöscht
- Nur **Validierungsdaten** bleiben erhalten
- Problem tritt **inkonsistent** auf

### Ursache
**Architekturproblem: Zwei unsynchronisierte Datenquellen**
- SurveyJS-Model (`survey.data`) hat alle aktuellen Daten
- Lokaler State (`surveyData`) ist nicht synchronisiert
- Dashboard überschreibt SurveyJS-Daten mit unvollständigen Daten

### Lösung: Sichere Datenfusion

**Datei:** `src/components/SurveyComponent.tsx`  
**Funktion:** `handleDashboardDataUpdate`

#### Vorher (Problem):
```typescript
survey.data = data.survey; // ← Überschreibt alle SurveyJS-Daten
const surveyAnswers = data.survey || {}; // ← Nur Dashboard-Daten
```

#### Nachher (Lösung):
```typescript
// SICHERE DATENFUSION
const currentSurveyData = survey.data || {};
const mergedData = {
  ...currentSurveyData,  // ← BEHALTE ALLE SURVEYJS-DATEN
  ...data.survey         // ← FÜGE DASHBOARD-ÄNDERUNGEN HINZU
};
survey.data = mergedData;

// VERWENDE FUSIONIERTE DATEN
const surveyAnswers = survey?.data || data.survey || {};
```

**Status:** ✅ Gelöst  
**Aufwand:** Minimal (2 Zeilen Code)

---

## Problem 2: Bulk Beutel Boxen werden nicht angezeigt

### Symptome
- Beim ersten Übergang zum Dashboard werden **keine Bulk Beutel Boxen** im "Material Eingang" angezeigt
- Funktioniert nur nach **F5-Refresh** und erneuter Auftragsauswahl
- **Hin- und Zurück-Navigation** hilft nicht

### Ursache
**Datenstruktur-Inkonsistenz:**
- Dashboard erwartet: `surveyData.survey.bulkgebinde_liste`
- `initialAnswers` ist: `{}` (leer)
- JSON-Datei hat: `{ survey: { bulkgebinde_liste: [...] }, validation: {...} }`
- Dashboard bekommt **leere Daten** statt der korrekten JSON-Daten

### Lösung: Direkter Zugriff auf SurveyJS-Daten

**Datei:** `src/components/BulkBeutelDashboard.tsx`  
**Zeile:** 49

#### Vorher (Problem):
```typescript
const bulkgebinde = surveyData?.survey?.bulkgebinde_liste || [];
//                                 ^^^^^^^^^^^^^^^^ LEER!
```

#### Nachher (Lösung):
```typescript
// PRIORISIERE SURVEY.DATA ÜBER SURVEYDATA.SURVEY
const bulkgebinde = survey?.data?.bulkgebinde_liste || surveyData?.survey?.bulkgebinde_liste || (productionOrder as any)?.bulkgebinde_liste || [];
//                    ^^^^^^^^^^^^^^^^^^^^^^^^ KORREKTE DATEN AUS JSON
```

**Zusätzliche Änderungen:**
- `survey` Prop zum Dashboard hinzugefügt
- Interface erweitert: `survey?: any`
- SurveyComponent übergibt: `survey={survey}`
- **Alle `bulk_beutel_production` Datenquellen** auf `survey.data` umgestellt (Restmenge-Übernahme)
- **Dritter Fallback** für `bulkgebinde_liste` aus `productionOrder` hinzugefügt

### Warum das funktioniert
- `survey.data` enthält **immer** die korrekten Daten aus der JSON-Datei
- `surveyData.survey.bulkgebinde_liste` bleibt als Fallback erhalten
- Dashboard bekommt die Daten, die es erwartet
- **Restmenge-Übernahme** funktioniert wieder, da `bulk_beutel_production` aus korrekten Daten gelesen wird
- **Dritter Fallback** aus `productionOrder` sorgt für sofortige Verfügbarkeit



---

## Deployment-Hinweise

### Für andere Deployments
Beide Änderungen müssen in **allen Deployments** eingearbeitet werden:

#### Änderung 1: Sichere Datenfusion
1. **Datei:** `src/components/SurveyComponent.tsx`
2. **Funktion:** `handleDashboardDataUpdate` (Zeile ~719-766)
3. **Änderungen:** 
   - Zeile ~722-724: Sichere Datenfusion implementieren
   - Zeile ~756: Fusionierte Daten verwenden

#### Änderung 2: Direkter SurveyJS-Zugriff
1. **Datei:** `src/components/BulkBeutelDashboard.tsx`
2. **Zeile:** 49: Datenquelle ändern
3. **Interface:** `survey?: any` hinzufügen
4. **Datei:** `src/components/SurveyComponent.tsx`
5. **Zeile:** ~897: `survey={survey}` Prop hinzufügen

### Testen nach Deployment
1. Survey bis Seite 12 ausfüllen
2. Zu Seite 13 (Dashboard) navigieren
3. **Bulk Beutel Boxen müssen angezeigt werden**
4. Zurück zu Seite 12 navigieren
5. **Alle Daten müssen noch vorhanden sein**

---

## Fazit

Beide Probleme waren **Implementierungsfehler** in der Datenbehandlung zwischen Dashboard und SurveyJS. Die Lösungen sind **minimal-invasiv** und stellen die **Datenintegrität** wieder her, ohne die bestehende Architektur zu ändern.

**Gesamtaufwand:** Minimal (3 Zeilen Code + Props)  
**Risiko:** Niedrig (nur Datenfusion, keine Architektur-Änderungen)
