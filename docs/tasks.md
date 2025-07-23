# TASKS.md – Aufgabenliste für Production3.0-SurveyJS

## Mögliche Task-Status
- **📋 geplant**: Aufgabe ist vorgesehen, aber noch nicht begonnen
- **🟡 AI draft**: Erste Umsetzung durch Claude Code/AI-Agent erstellt, aber noch nicht validiert
- **🔄 in arbeit**: Aufgabe wird aktuell bearbeitet
- **✅ umgesetzt**: Aufgabe ist abgeschlossen und validiert
- **⏸️ zurückgestellt**: Aufgabe ist aktuell nicht relevant oder verschoben

---

## Aufgaben nach Themenblöcken

### 1. Projekt-Setup & Infrastruktur

#### 1.1 Projekt-Repository initialisieren und Grundstruktur anlegen ✅ [umgesetzt]
*Grundlegende Projektinitialisierung mit Git, Ordnerstruktur und Dokumentation*
- 1.1.1 Git Repository initialisieren ✅ [umgesetzt]
- 1.1.2 Ordnerstruktur erstellen (src/, docs/, public/) ✅ [umgesetzt]
- 1.1.3 README.md und CLAUDE.md erstellen ✅ [umgesetzt]
- 1.1.4 .gitignore für Node.js/React konfigurieren ✅ [umgesetzt]

#### 1.2 Abhängigkeiten installieren (React, TypeScript, Vite, SurveyJS, etc.) ✅ [umgesetzt]
*Installation aller erforderlichen Dependencies für React SPA mit SurveyJS-Integration*
- 1.2.1 React 18 + TypeScript + Vite Setup ✅ [umgesetzt]
- 1.2.2 SurveyJS Dependencies (survey-react-ui, survey-core, survey-pdf) ✅ [umgesetzt]
- 1.2.3 Export-Dependencies (jsPDF, file-saver) ✅ [umgesetzt]
- 1.2.4 Development Dependencies (ESLint, TypeScript) ✅ [umgesetzt]

#### 1.3 Linting, TypeScript- und Build-Konfiguration einrichten ✅ [umgesetzt]
*Konfiguration der Entwicklungsumgebung und Build-Pipeline*
- 1.3.1 Vite-Konfiguration (vite.config.ts) für WSL2 ✅ [umgesetzt]
- 1.3.2 TypeScript-Konfiguration (tsconfig.json, tsconfig.node.json) ✅ [umgesetzt]
- 1.3.3 Package.json Scripts (dev, build, preview) ✅ [umgesetzt]
- 1.3.4 Entwicklungsserver-Setup mit restart-dev.sh ✅ [umgesetzt]

### 2. UI-Komponenten

#### 2.1 Haupt-App-Komponente mit State-Management und Routing ✅ [umgesetzt]
*Zentrale App-Komponente mit State-Management für verschiedene App-Zustände (order-selection, survey, completion)*
- 2.1.1 App.tsx mit zentralem State-Management (AppState-Enum) ✅ [umgesetzt]
- 2.1.2 Routing zwischen App-Zuständen (order-selection, survey, completion) ✅ [umgesetzt]
- 2.1.3 localStorage Integration für Resume-Funktion ✅ [umgesetzt]
- 2.1.4 TypeScript Interfaces für alle State-Typen (types/index.ts) ✅ [umgesetzt]
- 2.1.5 Umstellung auf dateibasierte Speicherung aller Bearbeitungsstände und Audit-Trails (statt localStorage) ✅ [umgesetzt]
  - 2.1.5.1 Analyse aller localStorage-Nutzungen und Datenflüsse in App, SurveyComponent, MA2Validation, ProductionOrderManager ✅ [umgesetzt]
  - 2.1.5.2 Implementierung von Utility-Funktionen zum Lesen/Schreiben von JSON-Dateien in data/master-data, data/orders, data/surveys ✅ [umgesetzt]
  - 2.1.5.3 Refaktorierung: SurveyComponent speichert und lädt Bearbeitungsstände ausschließlich aus data/surveys/ ✅ [umgesetzt]
  - 2.1.5.4 Refaktorierung: ProductionOrderManager erkennt und verwaltet Bearbeitungsstände pro Auftrag anhand der Survey-JSONs ✅ [umgesetzt]
  - 2.1.5.5 Refaktorierung: MA2Validation schreibt Audit-Trail/Validierungsdaten in die Survey-JSONs (oder separates Revisions-JSON) ✅ [umgesetzt]
  - 2.1.5.6 Migration: Überführe ggf. vorhandene Daten aus localStorage in die neue Struktur (einmalig, falls nötig) ✅ [umgesetzt]
  - 2.1.5.7 Test: Parallele Bearbeitung, Unterbrechung, Fortsetzung und Abschluss von Surveys für mehrere Aufträge ✅ [umgesetzt]
  - 2.1.5.8 Sicherstellen: Revisionssichere Speicherung und vollständige Wiederaufnahme aller Bearbeitungsstände ✅ [umgesetzt]

#### 2.2 Produktionsauftragsverwaltung (CRUD, Übersicht, Detail, Bearbeiten, Löschen, Neu anlegen) ✅ [umgesetzt]
*Vollständige Verwaltung von Produktionsaufträgen mit allen CRUD-Operationen und Local Storage Persistenz*
- 2.2.1 CRUD-Interface mit useState-Management ✅ [umgesetzt]
- 2.2.2 Übersichtskarten-Layout mit Auftragsdaten ✅ [umgesetzt]
- 2.2.3 Detailansicht mit vollständigen Auftragsinformationen ✅ [umgesetzt]
- 2.2.4 Bearbeiten-Funktion für alle Auftragsfelder ✅ [umgesetzt]
- 2.2.5 Löschen-Funktion mit Bestätigungsdialog ✅ [umgesetzt]
- 2.2.6 Neue Aufträge erstellen - Formular-Implementierung ✅ [umgesetzt]
- 2.2.7 Formular-Validierung für erforderliche Felder ✅ [umgesetzt]
- 2.2.8 Persistierung in localStorage mit Synchronisation ✅ [umgesetzt]
- 2.2.9 Integration der neuen Survey-Bearbeitungsstände in die Auftragsübersicht ✅ [umgesetzt]
  - 2.2.9.1 Anzeige des Status (offen, in Bearbeitung, abgeschlossen) pro Auftrag anhand der Survey-JSONs ✅ [umgesetzt]
  - 2.2.9.2 Button „Fragekatalog fortsetzen“ für jeden Auftrag mit begonnenem Survey 🟡 [AI draft]
  - 2.2.9.3 Möglichkeit, mehrere Surveys parallel zu beginnen, zu unterbrechen und fortzusetzen ✅ [umgesetzt]
  - 2.2.9.4 Löschen/Abbrechen eines Surveys entfernt nur die zugehörige Survey-JSON, nicht den Auftrag ✅ [umgesetzt]

#### 2.3 Survey-Komponente mit SurveyJS-Integration und Navigation ✅ [umgesetzt]
*Hauptfragebogen mit hierarchischer Struktur (26 Seiten in 10 Kapiteln) und verschiedenen Fragetypen*
- 2.3.1 SurveyJS-Komponente mit Model-Integration ✅ [umgesetzt]
- 2.3.2 Leicester Cough Questionnaire Theme ✅ [umgesetzt]
- 2.3.3 Progress Bar und Seitennavigation ✅ [umgesetzt]
- 2.3.4 Automatische Speicherung in localStorage bei Änderungen ✅ [umgesetzt]
- 2.3.5 Vollbild-Layout für Tablet-Optimierung ✅ [umgesetzt]
- 2.3.6 Standort-basierte Orientierung (Lager/Reinraum) mit farblicher Hervorhebung ✅ [umgesetzt]
- 2.3.7 MaterialType-spezifische Validierungsgruppen (GACP/GMP) ✅ [umgesetzt]

#### 2.4 Custom Dashboard für Produktionslauf ✅ [umgesetzt]
*Spezielle Benutzeroberfläche für die Produktionslauf-Dokumentation mit Vier-Spalten-Layout*
- 2.4.1 BulkBeutelDashboard-Komponente mit Vier-Spalten-Layout ✅ [umgesetzt]
- 2.4.2 Automatische Bulkbeutel-Generierung aus Material-Eingangsdaten ✅ [umgesetzt]
- 2.4.3 Echtzeit-Status-Tracking und Fortschritts-Charts ✅ [umgesetzt]
- 2.4.4 Integrierte Abfüllform mit Validierung ✅ [umgesetzt]
- 2.4.5 Eurocontainer-Verwaltung mit Plomben-Nummern ✅ [umgesetzt]
- 2.4.6 Automatische Datenintegration in SurveyJS-Struktur ✅ [umgesetzt]

#### 2.5 MA2-Validierungskomponente für Vier-Augen-Prinzip und Leitungssignatur 🟡 [AI draft]
*Kritische Kontrollpunkte erfordern Bestätigung durch zwei Personen (MA1/MA2) inkl. Audit-Trail mit Kürzel und Zeitstempel*
- 2.4.1 Vier-Augen-Prinzip Interface (MA1/MA2 Checkboxes) ✅ [umgesetzt]
- 2.4.2 Validierungsgruppen-Verarbeitung aus validationGroups.json ✅ [umgesetzt]
- 2.4.3 Kürzel-Eingabe und automatische Zeitstempel-Erfassung ✅ [umgesetzt]
- 2.4.4 Kommentar-Felder für MA2-Prüfungen ✅ [umgesetzt]
- 2.4.5 Leitungssignatur-Workflow (requiresSignature) 🟡 [AI draft - zu validieren]
- 2.4.6 Split-Screen Layout für MA1 Eingabe und MA2 Validierung ✅ [umgesetzt]

#### 2.6 Abschluss-Workflow mit Zusammenfassung und Export 🟡 [AI draft]
*Abschlussseite mit Zusammenfassung und Export als JSON (strukturiert) und PDF (menschenlesbar)*
- 2.5.1 CompletionScreen mit Survey-Zusammenfassung 🟡 [AI draft]
- 2.5.2 JSON-Export mit vollständigem Audit-Trail ✅ [umgesetzt]
- 2.5.3 PDF-Export mit formatierter Darstellung ✅ [umgesetzt]
- 2.5.4 Angepasster SurveyJS-Export mit tabellarischer Darstellung ✅ [umgesetzt]
- 2.5.4 Dateinamen-Konventionen (Protokoll_{orderID}_{timestamp}) ✅ [umgesetzt]
- 2.5.5 Client-seitige Download-Funktionalität ✅ [umgesetzt]
- 2.5.6 Produktionsleitung-Benachrichtigung (MVP-Platzhalter) ✅ [umgesetzt]
- 2.5.7 "Neuer Auftrag" Workflow nach Abschluss 🟡 [AI draft]

#### 2.7 Responsive, tablet-optimierte UI und Stylesheets ✅ [umgesetzt]
*UI/UX für Touch-Bedienung mit mind. 44px großen Bedienelementen, großer Schrift und großzügigen Abständen*
- 2.6.1 CSS Grid/Flexbox Layout-System ✅ [umgesetzt]
- 2.6.2 Touch-optimierte Bedienelemente (44px+ Mindestgröße) ✅ [umgesetzt]
- 2.6.3 Responsive Breakpoints für Tablet/Desktop ✅ [umgesetzt]
- 2.6.4 SurveyJS-konforme Farb- und Design-Palette (#f3f3f3, #19b394) ✅ [umgesetzt]

#### 2.7 Resume-Dialog für unterbrochene Protokolle ✅ [umgesetzt]
*Automatisches Speichern des Bearbeitungsstands mit Möglichkeit, begonnenen Auftrag fortzusetzen oder neu zu starten*
- 2.7.1 Resume-Dialog beim App-Start ✅ [umgesetzt]
- 2.7.2 "Fortsetzen" vs "Neu starten" Optionen ✅ [umgesetzt]
- 2.7.3 localStorage-State-Wiederherstellung ✅ [umgesetzt]
- 2.7.4 Nahtlose Navigation zwischen App-Zuständen ✅ [umgesetzt]

#### 2.8 Fortschrittsbalken, Seitenzähler, Breadcrumbs, TOC 🟡 [AI draft]
*Fortschrittsanzeige, seitenweise Navigation und Breadcrumbs für bessere Nutzerführung*
- 2.8.1 SurveyJS Progress Bar (showProgressBar: "top") ✅ [umgesetzt]
- 2.8.2 Seitenzähler in Survey-Navigation ✅ [umgesetzt]


#### 2.9 Split-Screen Layout für MA1/MA2 Vier-Augen-Prinzip ✅ [umgesetzt]
*Visuelle Trennung und gleichzeitige Anzeige von MA1- und MA2-Bereichen für Validierungsgruppen*
- 2.9.1 CSS Grid Layout für MA1/MA2 Bereiche ✅ [umgesetzt]
- 2.9.2 Synchronisation zwischen MA1/MA2 States ✅ [umgesetzt]
- 2.9.3 Visuelle Trennung und Kennzeichnung ✅ [umgesetzt]
- 2.9.4 Responsive Anpassung für verschiedene Bildschirmgrößen ✅ [umgesetzt]

### 3. Fragekatalog & Datenmodell

#### 3.1 SurveyJS-Fragekatalog (surveyDefinition.json) strukturieren und implementieren 🟡 [AI draft]
*Hierarchischer, dynamischer Fragebogen mit verschiedenen Fragetypen und bedingter Sichtbarkeit*
- 3.1.1 Hierarchische Struktur (Prozessschritt > Teilschritt > Frage) 🟡 [AI draft - Grundstruktur vorhanden]
- 3.1.2 Verschiedene Fragetypen (Checkbox, Matrix, Zahl, Datum/Uhrzeit, Freitext) ✅ [umgesetzt]
- 3.1.3 Bedingte Sichtbarkeit (GACP-spezifisch, Pause durchgeführt) 🟡 [AI draft]
- 3.1.4 Vollständiger 25-seitiger Fragenkatalog ✅ [umgesetzt - aktualisierte Struktur mit zusammengefassten Seiten]
  - 3.1.4.01 Seite 1.1 Information Produktionsauftrag ✅ [umgesetzt]
  - 3.1.4.02 Seite 1.2 Beteiligte Mitarbeiter ✅ [umgesetzt]
  - 3.1.4.03 Seite 1.3 Datum + Uhrzeit Beginn ✅ [umgesetzt]
  - 3.1.4.04 Seite 1.4 Vorbereitung Kennzeichnung ✅ [umgesetzt]
  - 3.1.4.05 Seite 1.5 Raumstatus überprüfen ✅ [umgesetzt]
  - 3.1.4.06 Seite 2.1 Materialbereitstellung - Primärpackmittel ✅ [umgesetzt]
  - 3.1.4.07 Seite 2.2 Materialbereitstellung - Bulkmaterial ✅ [umgesetzt]
  - 3.1.4.08 Seite 2.3 Zubehör - Schablonen ✅ [umgesetzt]
  - 3.1.4.09 Seite 2.4 Materialbereitstellung - Abschluss ✅ [umgesetzt]
  - 3.1.4.10 Seite 3.1 Vorbereitung Reinraum - Line Clearing ✅ [umgesetzt]
  - 3.1.4.11 Seite 3.2 Vorbereitung Waage ✅ [umgesetzt]
  - 3.1.4.12 Seite 3.3 Vorbereitung Kammerschweißgerät ✅ [umgesetzt]
  - 3.1.4.13 Seite 4.1 Herstellprozess - Beginn ✅ [umgesetzt]
  - 3.1.4.14 Seite 4.2 Primärverpackung - Produktionslauf ✅ [umgesetzt]
  - 3.1.4.15 Seite 4.3 Pause ✅ [umgesetzt]
  - 3.1.4.16 Seite 4.4 Pause Details ✅ [umgesetzt]
  - 3.1.4.17 Seite 4.5 Kumulierte Restmenge und Probenzug ✅ [umgesetzt]
  - 3.1.4.18 Seite 5.1 Restmenge ✅ [umgesetzt]
  - 3.1.4.19 Seite 6.1 Schleusung - Eurocontainer ✅ [umgesetzt]
  - 3.1.4.20 Seite 7.1 Nachbereitung Reinraum ✅ [umgesetzt]
  - 3.1.4.21 Seite 8.1 Einlagern ✅ [umgesetzt]
  - 3.1.4.22 Seite 8.2 Einlagern - Nicht genutzte Eingangsmaterialien ✅ [umgesetzt]
  - 3.1.4.23 Seite 9.1 Nachbereitung Reinraum - Final ✅ [umgesetzt]
  - 3.1.4.24 Seite 10.1 Abschluss ✅ [umgesetzt]
  - 3.1.4.25 Seite 10.2 Herstellung abgeschlossen ✅ [umgesetzt]
- 3.1.5 Integration von Produktionsauftragsdaten in Survey ✅ [umgesetzt]

#### 3.2 Validierungsgruppen (validationGroups.json) definieren ✅ [umgesetzt]
*Definition von Gruppen für Vier-Augen-Prinzip und Leitungssignatur mit entsprechenden Validierungsregeln*
- 3.2.1 MA2-Validierungsgruppen für kritische Kontrollpunkte ✅ [umgesetzt]
- 3.2.2 Leitungssignatur-Gruppen (requiresSignature --> im MVP auch nur Kürzel) ✅ [umgesetzt]
- 3.2.3 Zuordnung von Fragen zu Validierungsgruppen ✅ [umgesetzt]
- 3.2.4 Validierungstypen und -attribute definieren ✅ [umgesetzt]

#### 3.3 Beispiel-Produktionsaufträge (sampleOrders.json) anlegen ✅ [umgesetzt]
*Realistische Testdaten für verschiedene Materialtypen und Szenarien*
- 3.3.1 GACP-Material Beispielaufträge ✅ [umgesetzt]
- 3.3.2 GMP-Material Beispielaufträge ✅ [umgesetzt]
- 3.3.3 Vollständige Auftragsdaten (Peace Naturals GC 31/1) ✅ [umgesetzt]

> **Hinweis:** Produktionsaufträge werden ab sofort ausschließlich in `data/orders/orders.json` gepflegt. Die Datei `sampleOrders.json` ist veraltet und wird nicht mehr verwendet.
- Es ist möglich, mehrere Produktionsaufträge parallel zu beginnen, zu unterbrechen und fortzusetzen.
- Der Bearbeitungsstand jedes Auftrags ist jederzeit revisionssicher im Dateisystem verfügbar.
- Ein abgebrochener Survey kann entfernt werden, ohne den Auftrag zu löschen.

#### 3.4 TypeScript-Typisierung für alle Kernmodelle ✅ [umgesetzt]
*Vollständige TypeScript-Interfaces für type-safe Entwicklung*
- 3.4.1 ProductionOrder Interface (Frontend & Backend) ✅ [umgesetzt]
- 3.4.2 SurveyAnswer und Audit-Trail Interfaces ✅ [umgesetzt]
  - 3.4.2.1 SurveyAnswerItem mit Audit-Trail ✅ [umgesetzt]
  - 3.4.2.2 SurveyAnswer mit backward compatibility ✅ [umgesetzt]
  - 3.4.2.3 AuditTrail mit MA1/MA2 Kürzel und Zeitstempel ✅ [umgesetzt]
- 3.4.3 ValidationGroup Interface ✅ [umgesetzt]
  - 3.4.3.1 Frontend ValidationGroup mit validationType ✅ [umgesetzt]
  - 3.4.3.2 Backend ValidationGroup mit erweiterten Feldern ✅ [umgesetzt]
- 3.4.4 AppState und Navigation Types ✅ [umgesetzt]
  - 3.4.4.1 AppState Union Type ('order-selection' | 'survey' | 'completed') ✅ [umgesetzt]
  - 3.4.4.2 BulkBeutel Interface für Dashboard ✅ [umgesetzt]
  - 3.4.4.3 Mitarbeiter Interface mit Kürzel und Unterschrift ✅ [umgesetzt]
- 3.4.5 Backend-spezifische Interfaces ✅ [umgesetzt]
  - 3.4.5.1 SurveyFile Interface für Datei-API ✅ [umgesetzt]
  - 3.4.5.2 ApiResponse Generic Interface ✅ [umgesetzt]
  - 3.4.5.3 SurveyStatus Interface ✅ [umgesetzt]
  - 3.4.5.4 Request/Response Interfaces für API-Endpunkte ✅ [umgesetzt]
- 3.4.6 ExportData Interface für JSON/PDF Export ✅ [umgesetzt]

#### 3.5 Dynamische Komponenten für variable Datenstrukturen ✅ [umgesetzt]
*Wiederholbare Abschnitte für variable Anzahlen von Elementen mit paneldynamic und matrixdynamic*
- 3.5.1 Dynamische Bulkbeutel-Panels (paneldynamic) für Produktionslauf ✅ [umgesetzt]
- 3.5.2 Mitarbeiterlisten mit variablen Einträgen (paneldynamic) ✅ [umgesetzt]
- 3.5.3 Probegebinde-Listen (matrixdynamic) für Freigabeanalytik ✅ [umgesetzt]
- 3.5.4 Conditional Logic für dynamische Komponenten-Sichtbarkeit ✅ [umgesetzt]
- 3.5.5 Matrixdynamic-Komponenten für Soll-Ist-Vergleiche ✅ [umgesetzt]
- 3.5.6 Validierung und Pflichtfelder in dynamischen Komponenten ✅ [umgesetzt]

### 4. Validierungslogik & Audit-Trail

#### 4.1 Pflichtfelder und Validierungen gemäß SurveyJS-Definition 🟡 [AI draft]
*Alle kritischen Fragen als Pflichtfelder markiert mit entsprechenden Validierungsregeln*
- 4.1.1 isRequired-Markierung für kritische Fragen ✅ [umgesetzt]
- 4.1.2 Numerische Feldvalidierung mit Bereichen 🟡 [AI draft - teils umgesetz - zu erweitern]
- 4.1.3 Datum/Zeit-Format-Validierung ✅ [umgesetzt]
- 4.1.4 Textfeld-Validierung (verleich mit Soll werten in Vier Augen Prinzip Überprüfung) ✅ [umgesetzt]

#### 4.2 Bedingte Validierungen (abhängig von Materialtyp oder Vorantworten) [teils umgesetzt]
*Validierungsregeln die nur unter bestimmten Bedingungen greifen*
- 4.2.1 GACP vs GMP bedingte Pflichtfelder ✅ [umgesetzt]
- 4.2.2 Pause-abhängige Validierungen 🟡 [AI draft]
- 4.2.3 Kommentar-Pflicht bei "Nein"-Antworten ✅ [umgesetzt]
- 4.2.4 Cross-Field-Validierungen 🟡 [AI draft - zu erweitern]
- 4.2.5 **Validierung der Gesammtsummen** z.B. beim abfüllen von Bulk Beuteln [offen]

#### 4.3 Audit-Trail-Logik pro Fragengruppe [teils offen]
*Kürzel, Zeitstempel und Kommentare für jede kritische Antwort*
- 4.3.1 MA1-Kürzel und Zeitstempel-Erfassung ✅ [umgesetzt]
- 4.3.2 MA2-Kürzel und Zeitstempel-Erfassung (über Vier-Augen-Prüfung) ✅ [umgesetzt]
- 4.3.3 Kommentar-System für MA2-Prüfungen ✅ [umgesetzt]
- 4.3.4 Audit-Trail-Export in JSON/PDF (Eingaben + MA Kürzel + Zeitstempel) [offen]

#### 4.4 Dynamische Komponenten und bedingte Sichtbarkeit (GACP/GMP, Pause, etc.) ✅ [umgesetzt]
*visibleIf-Bedingungen für material- und situationsspezifische Abschnitte*
- 4.4.1 GACP-spezifische Fragen (IPK, Sortierung) ✅ [umgesetzt]
- 4.4.2 GMP-Material überspringt GACP-Abschnitte ✅ [umgesetzt]
- 4.4.3 Pause-Abschnitt nur bei Bedarf ✅ [umgesetzt]
- 4.4.4 Bedingte dynamische Komponenten-Wiederholungen ✅ [umgesetzt]
- 4.4.5 MaterialType-basierte Sichtbarkeit in paneldynamic/matrixdynamic ✅ [umgesetzt]

#### 4.5 Matrix/Soll-Ist-Vergleiche für Primärpackmittel, Bulkmaterial, Schablonen ✅ [umgesetzt]
*Vergleichstabellen zwischen Soll- und Ist-Werten mit Abweichungserkennung*
- 4.5.1 Primärpackmittel Soll-Ist-Matrix ✅ [umgesetzt]
- 4.5.2 Bulkmaterial Vergleichstabellen ✅ [umgesetzt]
- 4.5.3 Schablonen-Verifikation ✅ [umgesetzt]
- 4.5.4 Automatische Abweichungsmarkierung in Vier Augen Prüfung ✅ [umgesetzt]

#### 4.6 Kommentarfelder bei "Nein"-Antworten und bedingte Validierung ✅ [umgesetzt]
*Pflicht-Kommentare bei negativen Antworten für lückenlose Dokumentation*
- 4.6.1 Bedingte Kommentarfelder bei boolean:false ✅ [umgesetzt]
- 4.6.2 Validierung von Kommentar-Pflichtfeldern ✅ [umgesetzt]
- 4.6.3 Export von Kommentaren in JSON/PDF ✅ [umgesetzt]

### 5. Exportfunktionen

#### 5.1 JSON-Export mit vollständigen Rohdaten und Audit-Trail 🟡 [AI draft]
*Strukturierte Rohdaten geeignet für Archivierung und Weiterverarbeitung*
- 5.1.1 SurveyJS-Resultatstruktur Export ✅ [umgesetzt]
- 5.1.2 Audit-Trail-Daten pro Validierungsgruppe ✅ [umgesetzt]
- 5.1.3 Produktionsauftragsdaten Integration ✅ [umgesetzt]

#### 5.2 PDF-Export mit formatierter, menschenlesbarer Darstellung [teils umgesetzt]
*Formatierter Bericht mit allen beantworteten Fragen, Audit-Trail und Unterschriften/Kürzel*
- 5.2.1 PDF-Generierung mit survey-pdf ✅ [umgesetzt]
- 5.2.2 Formatierte Darstellung aller Antworten ✅ [umgesetzt]
- 5.2.3 Audit-Trail-Sektion in PDF [offen]
- 5.2.4 GMP-konforme Archivierungsformat [offen]

#### 5.3 Dateinamen-Konventionen für Exporte 🟡 [AI draft]
*Einheitliche Benennungsschema: Protokoll_{orderID}_{timestamp}.{extension}*
- 5.3.1 Protokoll-Präfix Implementation 🟡 [AI draft]
- 5.3.2 OrderID-Integration aus Produktionsauftrag ✅ [umgesetzt]
- 5.3.3 Timestamp-Format (ISO 8601) 🟡 [AI draft - zu validieren]
- 5.3.4 Extension-Handling (.json, .pdf) 🟡 [AI draft]

#### 5.4 Client-seitige Generierung und Download der Exporte 🟡 [AI draft]
*Alle Exporte werden ausschließlich clientseitig generiert ohne Server-Übertragung*
- 5.4.1 Browser-Download-API Integration ✅ [umgesetzt]
- 5.4.2 File-Saver.js für Cross-Browser-Support 🟡 [AI draft]
- 5.4.3 Error-Handling bei Export-Fehlern 🟡 [AI draft - zu erweitern]
- 5.4.4 Performance-Optimierung für große Exporte 🟡 [AI draft - zu implementieren]

### 6. Tests & Qualitätssicherung

#### 6.1 Unit-Tests für kritische Komponenten und Logik 📋 [geplant]
*Automatisierte Tests für Kernfunktionalitäten*
- 6.1.1 Survey-Logik Tests (GACP vs GMP) 📋 [geplant]
- 6.1.2 Validierungsgruppen-Tests 📋 [geplant]
- 6.1.3 Export-Funktionen Tests 📋 [geplant]
- 6.1.4 State-Management Tests 📋 [geplant]

#### 6.2 Review aller Validierungsgruppen und Audit-Trail-Einträge 📋 [geplant]
*Konsistenzprüfung der Validierungslogik*
- 6.2.1 MA2-Validierungsgruppen Review 📋 [geplant]
- 6.2.2 Audit-Trail-Vollständigkeit prüfen 📋 [geplant]
- 6.2.3 Cross-Validation zwischen Gruppen 📋 [geplant]
- 6.2.4 Zeitstempel-Konsistenz validieren 📋 [geplant]

#### 6.3 Review der Exportdaten (JSON/PDF) auf Vollständigkeit 📋 [geplant]
*Validierung der Export-Qualität und -Vollständigkeit*
- 6.3.1 JSON-Export Strukturvalidierung 📋 [geplant]
- 6.3.2 PDF-Export Formatprüfung 📋 [geplant]
- 6.3.3 Audit-Trail-Export Vollständigkeit 📋 [geplant]
- 6.3.4 Cross-Format Konsistenz (JSON vs PDF) 📋 [geplant]

#### 6.4 Review der Tablet-Optimierung und Barrierefreiheit 📋 [geplant]
*Usability und Accessibility Testing*
- 6.4.1 Touch-Target Größen validieren (44px+) 📋 [geplant]
- 6.4.2 Responsive Design auf verschiedenen Geräten 📋 [geplant]
- 6.4.3 Fokus-Indikatoren und Kontraste prüfen 📋 [geplant]
- 6.4.4 Performance auf Tablet-Hardware 📋 [geplant]

#### 6.5 Review der GACP/GMP-Logik und material-spezifischen Bedingungen 📋 [geplant]
*Fachliche Korrektheit der Prozesslogik*
- 6.5.1 GACP-spezifische Abschnitte validieren 📋 [geplant]
- 6.5.2 GMP-Vereinfachungen prüfen 📋 [geplant]
- 6.5.3 Bedingte Sichtbarkeit testen 📋 [geplant]
- 6.5.4 Edge Cases für Materialtypen 📋 [geplant]

#### 6.6 Review der Hilfetexte und erweiterte Barrierefreiheit 📋 [geplant]
*Nutzerführung und erweiterte Accessibility Features*
- 6.6.1 Inline-Hilfen und Kontextbeschreibungen 📋 [geplant]
- 6.6.2 Dark Mode Unterstützung 📋 [geplant]
- 6.6.3 Reduzierte Bewegung (prefers-reduced-motion) 📋 [geplant]
- 6.6.4 Screen Reader Kompatibilität 📋 [geplant]

### 7. Review & Abnahme

#### 7.1 Review und Abnahme aller Kernfunktionen gemäß PRD 📋 [geplant]
*Finale Validierung gegen alle Akzeptanzkriterien*
- 7.1.1 Alle PRD-Anforderungen abgleichen 📋 [geplant]
- 7.1.2 Akzeptanzkriterien durchgehen 📋 [geplant]
- 7.1.3 End-to-End Workflow-Tests 📋 [geplant]
- 7.1.4 Stakeholder-Feedback einarbeiten 📋 [geplant]

#### 7.2 Dokumentation für Endnutzer und Admins ergänzen/aktualisieren 📋 [geplant]
*Vollständige Projektdokumentation*
- 7.2.1 Benutzerhandbuch erstellen 📋 [geplant]
- 7.2.2 Admin-Dokumentation 📋 [geplant]
- 7.2.3 Deployment-Anleitung 📋 [geplant]
- 7.2.4 Troubleshooting-Guide 📋 [geplant]

### 8. Backend-Architektur & Node.js-Server

#### 8.1 Architektur & Grundgerüst ✅ [umgesetzt]
- 8.1.1 Anforderungsanalyse & Zieldefinition ✅ [umgesetzt]
  - Detaillierte Analyse der Anforderungen an das Backend (Datei-API, Multi-User, GMP-Anforderungen, Audit-Trail, Performance, Fehlerbehandlung).
- 8.1.2 Technologiewahl & Projektsetup ✅ [umgesetzt]
  - Node.js/Express.js, TypeScript, Projektinitialisierung, Verzeichnisstruktur, Package-Management.
- 8.1.3 API-Design & Schnittstellendefinition ✅ [umgesetzt]
  - REST-API-Endpunkte für CRUD-Operationen auf Orders, Surveys, Master-Data, Dateinamen-Konventionen, Response-Formate.

#### 8.2 Implementierung der Datei-API ✅ [umgesetzt]
- 8.2.1 Implementierung: Lesen/Schreiben von JSON-Dateien ✅ [umgesetzt]
  - Utility-Funktionen im Backend zum sicheren Lesen, Schreiben, Listen und Löschen von JSON-Dateien in `data/master-data/`, `data/orders/`, `data/surveys/`.
- 8.2.2 API-Endpunkte für Orders ✅ [umgesetzt]
  - GET/POST Endpunkte zum Abrufen und Verwalten von Produktionsaufträgen (`orders.json`).
- 8.2.3 API-Endpunkte für Surveys ✅ [umgesetzt]
  - Endpunkte zum Laden, Aktualisieren von Survey-JSONs pro Auftrag und Bearbeitungsstand (inkl. Statuswechsel, Audit-Trail).
- 8.2.4 API-Endpunkte für Master-Data ✅ [umgesetzt]
  - Endpunkte zum Abrufen der Survey-Definition und Validierungsgruppen (Read-Only).
- 8.2.5 Fehlerbehandlung & Validierung ✅ [umgesetzt]
  - Robuste Fehlerbehandlung, Validierung der Dateiinhalte, Logging von Fehlern und Zugriffen.

#### 8.3 Integration Frontend <-> Backend ✅ [umgesetzt]
- 8.3.1 Anpassung der Utility-Funktionen im Frontend ✅ [umgesetzt]
  - Refaktorierung der Utility-Funktionen (`readJsonFile`, `writeJsonFile`, etc.) im Frontend für HTTP-Request mit dem Backend.
- 8.3.2 CORS & Sicherheit ✅ [umgesetzt]
  - Konfiguration von CORS im Backend für lokale Entwicklung und produktiven Betrieb.
- 8.3.3 Test: End-to-End-Durchläufe ✅ [umgesetzt]
  - Testen aller Kern-Workflows (Anlegen, Unterbrechen, Fortsetzen, Abschließen von Surveys, parallele Bearbeitung) über die neue API.

#### 8.4 Erweiterungen & GMP/SAP-Readiness 📋 [geplant]
- 8.4.1 Audit-Trail & Revisionssicherheit 📋 [geplant]
  - Implementierung von Audit-Trail-Mechanismen (z. B. Änderungsprotokoll, Zeitstempel, User-Tracking) für alle Dateioperationen.
- 8.4.2 Authentifizierung & Benutzerverwaltung (optional, vorbereitend) 📋 [geplant]
  - Grundlegende Authentifizierung (z. B. Token-basiert), Benutzerrollen, Vorbereitung für GMP-konforme Benutzeridentifikation.
- 8.4.3 Vorbereitung SAP-Integration 📋 [geplant]
  - Definition und Implementierung von Schnittstellen (z. B. Import/Export von Survey- und Auftragsdaten), Mapping der JSON-Struktur auf das SAP-Datenmodell laut `sap-integration.md`.
- 8.4.4 Dokumentation & Betriebskonzepte 📋 [geplant]
  - Ausführliche Dokumentation der Backend-Architektur, API, Betriebskonzepte (Backup, Recovery, Deployment, Security, GMP-Compliance).

#### 8.5 Migration & Rollout 📋 [geplant]
- 8.5.1 Migration bestehender Daten 📋 [geplant]
  - Entwicklung eines Scripts oder Migrationsprozesses zur Überführung vorhandener localStorage-Daten in die neue Backend-Struktur.
- 8.5.2 Rollout & Schulung 📋 [geplant]
  - Planung und Durchführung des Rollouts, Schulung der Nutzer, Feedbackschleifen, Anpassungen nach Erstbetrieb.



*Diese erweiterte Taskliste bietet eine detaillierte Übersicht über alle Projektaufgaben mit präzisen Subtasks und Status-Tracking. Sie dient als Grundlage für die finale Validierung und Abnahme des Projekts.*