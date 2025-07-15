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
- 2.1.2 Routing zwischen App-Zuständen (order-selection, survey, completion) 🟡 [AI draft]
- 2.1.3 localStorage Integration für Resume-Funktion ✅ [umgesetzt]
- 2.1.4 TypeScript Interfaces für alle State-Typen (types/index.ts) ✅ [umgesetzt]

#### 2.2 Produktionsauftragsverwaltung (CRUD, Übersicht, Detail, Bearbeiten, Löschen, Neu anlegen) 🟡 [AI draft]
*Vollständige Verwaltung von Produktionsaufträgen mit allen CRUD-Operationen und Local Storage Persistenz*
- 2.2.1 CRUD-Interface mit useState-Management ✅ [umgesetzt]
- 2.2.2 Übersichtskarten-Layout mit Auftragsdaten ✅ [umgesetzt]
- 2.2.3 Detailansicht mit vollständigen Auftragsinformationen ✅ [umgesetzt]
- 2.2.4 Bearbeiten-Funktion für alle Auftragsfelder ✅ [umgesetzt]
- 2.2.5 Löschen-Funktion mit Bestätigungsdialog ✅ [umgesetzt]
- 2.2.6 Neue Aufträge erstellen - Formular-Implementierung 🟡 [AI draft]
- 2.2.7 Formular-Validierung für erforderliche Felder 🟡 [AI draft - zu validieren]
- 2.2.8 Persistierung in localStorage mit Synchronisation 🟡 [AI draft]

#### 2.3 Survey-Komponente mit SurveyJS-Integration und Navigation ✅ [umgesetzt]
*Hauptfragebogen mit hierarchischer Struktur (Prozessschritt > Teilschritt > Frage) und verschiedenen Fragetypen*
- 2.3.1 SurveyJS-Komponente mit Model-Integration ✅ [umgesetzt]
- 2.3.2 Leicester Cough Questionnaire Theme ✅ [umgesetzt]
- 2.3.3 Progress Bar und Seitennavigation 🟡 [AI draft]
- 2.3.4 Automatische Speicherung in localStorage bei Änderungen ✅ [umgesetzt]
- 2.3.5 Vollbild-Layout für Tablet-Optimierung ✅ [umgesetzt]

#### 2.4 MA2-Validierungskomponente für Vier-Augen-Prinzip und Leitungssignatur 🟡 [AI draft]
*Kritische Kontrollpunkte erfordern Bestätigung durch zwei Personen (MA1/MA2) inkl. Audit-Trail mit Kürzel und Zeitstempel*
- 2.4.1 Vier-Augen-Prinzip Interface (MA1/MA2 Checkboxes) ✅ [umgesetzt]
- 2.4.2 Validierungsgruppen-Verarbeitung aus validationGroups.json ✅ [umgesetzt]
- 2.4.3 Kürzel-Eingabe und automatische Zeitstempel-Erfassung 🟡 [AI draft]
- 2.4.4 Kommentar-Felder für MA2-Prüfungen ✅ [umgesetzt]
- 2.4.5 Leitungssignatur-Workflow (requiresSignature) 🟡 [AI draft - zu validieren]
- 2.4.6 Split-Screen Layout für MA1 Eingabe und MA2 Validierung ✅ [umgesetzt]

#### 2.5 Abschluss-Workflow mit Zusammenfassung und Export 🟡 [AI draft]
*Abschlussseite mit Zusammenfassung und Export als JSON (strukturiert) und PDF (menschenlesbar)*
- 2.5.1 CompletionScreen mit Survey-Zusammenfassung 🟡 [AI draft]
- 2.5.2 JSON-Export mit vollständigem Audit-Trail 🟡 [AI draft]
- 2.5.3 PDF-Export mit formatierter Darstellung 🟡 [AI draft]
- 2.5.4 Dateinamen-Konventionen (Protokoll_{orderID}_{timestamp}) 🟡 [AI draft - zu validieren]
- 2.5.5 Client-seitige Download-Funktionalität 🟡 [AI draft]
- 2.5.6 Produktionsleitung-Benachrichtigung (MVP-Platzhalter) 🟡 [AI draft]
- 2.5.7 "Neuer Auftrag" Workflow nach Abschluss 🟡 [AI draft]

#### 2.6 Responsive, tablet-optimierte UI und Stylesheets ✅ [umgesetzt]
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
- 2.7.4 Nahtlose Navigation zwischen App-Zuständen 🟡 [AI draft]

#### 2.8 Fortschrittsbalken, Seitenzähler, Breadcrumbs, TOC 🟡 [AI draft]
*Fortschrittsanzeige, seitenweise Navigation und Breadcrumbs für bessere Nutzerführung*
- 2.8.1 SurveyJS Progress Bar (showProgressBar: "top") ✅ [umgesetzt]
- 2.8.2 Seitenzähler in Survey-Navigation 🟡 [AI draft - SurveyJS Standard]
- 2.8.3 Breadcrumb-Navigation für Survey-Seiten 🟡 [AI draft - zu implementieren]
- 2.8.4 Table of Contents (TOC) für Übersicht 🟡 [AI draft - zu implementieren]

#### 2.9 Split-Screen Layout für MA1/MA2 Vier-Augen-Prinzip ✅ [umgesetzt]
*Visuelle Trennung und gleichzeitige Anzeige von MA1- und MA2-Bereichen für Validierungsgruppen*
- 2.9.1 CSS Grid Layout für MA1/MA2 Bereiche ✅ [umgesetzt]
- 2.9.2 Synchronisation zwischen MA1/MA2 States 🟡 [AI draft]
- 2.9.3 Visuelle Trennung und Kennzeichnung ✅ [umgesetzt]
- 2.9.4 Responsive Anpassung für verschiedene Bildschirmgrößen ✅ [umgesetzt]

### 3. Fragekatalog & Datenmodell

#### 3.1 SurveyJS-Fragekatalog (surveyDefinition.json) strukturieren und implementieren 🟡 [AI draft]
*Hierarchischer, dynamischer Fragebogen mit verschiedenen Fragetypen und bedingter Sichtbarkeit*
- 3.1.1 Hierarchische Struktur (Prozessschritt > Teilschritt > Frage) 🟡 [AI draft - Grundstruktur vorhanden]
- 3.1.2 Verschiedene Fragetypen (Checkbox, Matrix, Zahl, Datum/Uhrzeit, Freitext) ✅ [umgesetzt]
- 3.1.3 Bedingte Sichtbarkeit (GACP-spezifisch, Pause durchgeführt) 🟡 [AI draft]
- 3.1.4 Vollständiger 28-seitiger Fragenkatalog 🟡 [AI draft - nach Word Katalog AI generiert - aktuell in Überarbeitung]
  - 3.1.4.01 Seite 1.1 Information Produktionsauftrag ✅ [umgesetzt]
  - 3.1.4.02 Seite 1.3 Beteiligte Mitarbeiter ✅ [umgesetzt]
  - 3.1.4.03 Seite 1.4 Datum + Uhrzeit Beginn ✅ [umgesetzt]
  - 3.1.4.04 Seite 1.5 Vorbereitung Kennzeichnung ✅ [umgesetzt]
  - 3.1.4.05 Seite 1.6 Raumstatus überprüfen ✅ [umgesetzt]
  - 3.1.4.06 Seite 2.1 Materialbereitstellung - Primärpackmittel ✅ [umgesetzt]
  - 3.1.4.07 Seite 2.2 Materialbereitstellung - Bulkmaterial ✅ [umgesetzt]
  - 3.1.4.08 Seite 2.3 Zubehör - Schablonen 🟡 [AI draft]
  - 3.1.4.09 Seite 2.4 Materialbereitstellung - Abschluss 🟡 [AI draft]
  - 3.1.4.10 Seite 3.1 Vorbereitung Reinraum - Line Clearing 🟡 [AI draft]
  - 3.1.4.11 Seite 3.2 Vorbereitung Waage 🟡 [AI draft]
  - 3.1.4.12 Seite 3.3 Vorbereitung Kammerschweißgerät 🟡 [AI draft]
  - 3.1.4.13 Seite 4.1 Herstellprozess - Beginn 🟡 [AI draft]
  - 3.1.4.14 Seite 4.2 Primärverpackung - Produktionslauf 🟡 [AI draft]
  - 3.1.4.15 Seite 4.3 Pause 🟡 [AI draft]
  - 3.1.4.16 Seite 4.4 Pause Details 🟡 [AI draft]
  - 3.1.4.17 Seite 4.5 Kumulierte Restmenge und Probenzug 🟡 [AI draft]
  - 3.1.4.18 Seite 5.1 Restmenge 🟡 [AI draft]
  - 3.1.4.19 Seite 6.1 Schleusung - Eurocontainer 🟡 [AI draft]
  - 3.1.4.20 Seite 7.1 Nachbereitung Reinraum 🟡 [AI draft]
  - 3.1.4.21 Seite 8.1 Einlagern - Hergestellte Zwischenprodukte 🟡 [AI draft]
  - 3.1.4.22 Seite 8.2 Einlagern - Proben (Freigabeanalytik) 🟡 [AI draft]
  - 3.1.4.23 Seite 8.3 Einlagern - Finale Restmenge 🟡 [AI draft]
  - 3.1.4.24 Seite 8.4 Einlagern - Müllbeutel 🟡 [AI draft]
  - 3.1.4.25 Seite 8.5 Einlagern - Nicht genutzte Eingangsmaterialien 🟡 [AI draft]
  - 3.1.4.26 Seite 9.1 Nachbereitung Reinraum - Final 🟡 [AI draft]
  - 3.1.4.27 Seite 10.1 Abschluss 🟡 [AI draft]
  - 3.1.4.28 Seite 10.2 Herstellung abgeschlossen 🟡 [AI draft]
- 3.1.5 Integration von Produktionsauftragsdaten in Survey ✅ [umgesetzt]

#### 3.2 Validierungsgruppen (validationGroups.json) definieren 🟡 [AI draft]
*Definition von Gruppen für Vier-Augen-Prinzip und Leitungssignatur mit entsprechenden Validierungsregeln*
- 3.2.1 MA2-Validierungsgruppen für kritische Kontrollpunkte ✅ [umgesetzt]
- 3.2.2 Leitungssignatur-Gruppen (requiresSignature) 🟡 [AI draft - zu validieren]
- 3.2.3 Zuordnung von Fragen zu Validierungsgruppen ✅ [umgesetzt]
- 3.2.4 Validierungstypen und -attribute definieren 🟡 [AI draft - zu erweitern im Zuge der Fragen Überarbeitung]

#### 3.3 Beispiel-Produktionsaufträge (sampleOrders.json) anlegen ✅ [umgesetzt]
*Realistische Testdaten für verschiedene Materialtypen und Szenarien*
- 3.3.1 GACP-Material Beispielaufträge ✅ [umgesetzt]
- 3.3.2 GMP-Material Beispielaufträge ✅ [umgesetzt]
- 3.3.3 Verschiedene Bulkbeutel-Anzahlen für Tests 🟡 [AI draft - Bulkbeutelanzahl wird erst im Fragekatalog gesetzt und nicht aus dem Produktionsauftrag entnommen (da nur Gram Zahl des Eingansmaterials)]
- 3.3.4 Vollständige Auftragsdaten (Peace Naturals GC 31/1) ✅ [umgesetzt]

#### 3.4 TypeScript-Typisierung für alle Kernmodelle 🟡 [AI draft]
*Vollständige TypeScript-Interfaces für type-safe Entwicklung*
- 3.4.1 ProductionOrder Interface 🟡 [AI draft]
- 3.4.2 SurveyAnswer und Audit-Trail Interfaces 🟡 [AI draft]
- 3.4.3 ValidationGroup Interface 🟡 [AI draft]
- 3.4.4 AppState und Navigation Types 🟡 [AI draft]

#### 3.5 Dynamische Panels für Bulkbeutel, Mitarbeiterlisten etc. 🟡 [AI draft]
*Wiederholbare Abschnitte für variable Anzahlen von Elementen*
- 3.5.1 Dynamische Bulkbeutel-Panels (paneldynamic) 🟡 [AI draft]
- 3.5.2 Mitarbeiterlisten mit variablen Einträgen ✅ [umgesetzt]
- 3.5.3 Probegebinde-Listen ✅ [umgesetzt]
- 3.5.4 Conditional Logic für Panel-Sichtbarkeit 🟡 [AI draft - zu validieren]

### 4. Validierungslogik & Audit-Trail

#### 4.1 Pflichtfelder und Validierungen gemäß SurveyJS-Definition 🟡 [AI draft]
*Alle kritischen Fragen als Pflichtfelder markiert mit entsprechenden Validierungsregeln*
- 4.1.1 isRequired-Markierung für kritische Fragen ✅ [umgesetzt]
- 4.1.2 Numerische Feldvalidierung mit Bereichen 🟡 [AI draft - teils umgesetz - zu erweitern]
- 4.1.3 Datum/Zeit-Format-Validierung 🟡 [AI draft - zu implementieren]
- 4.1.4 Textfeld-Validierung (Kürzel, Chargen) 🟡 [AI draft - Validierung in 4-Augen Validierungsfenster teils umgesetzt - zu erweitern]

#### 4.2 Bedingte Validierungen (abhängig von Materialtyp oder Vorantworten) 🟡 [AI draft]
*Validierungsregeln die nur unter bestimmten Bedingungen greifen*
- 4.2.1 GACP vs GMP bedingte Pflichtfelder 🟡 [AI draft]
- 4.2.2 Pause-abhängige Validierungen 🟡 [AI draft]
- 4.2.3 Kommentar-Pflicht bei "Nein"-Antworten ✅ [umgesetzt]
- 4.2.4 Cross-Field-Validierungen 🟡 [AI draft - zu erweitern]

#### 4.3 Audit-Trail-Logik pro Fragengruppe 🟡 [AI draft]
*Kürzel, Zeitstempel und Kommentare für jede kritische Antwort*
- 4.3.1 MA1-Kürzel und Zeitstempel-Erfassung 🟡 [AI draft]
- 4.3.2 MA2-Kürzel und Zeitstempel-Erfassung 🟡 [AI draft]
- 4.3.3 Kommentar-System für MA2-Prüfungen ✅ [umgesetzt]
- 4.3.4 Audit-Trail-Export in JSON/PDF 🟡 [AI draft - zu validieren]

#### 4.4 Dynamische Panels und bedingte Sichtbarkeit (GACP/GMP, Pause, etc.) 🟡 [AI draft]
*visibleIf-Bedingungen für material- und situationsspezifische Abschnitte*
- 4.4.1 GACP-spezifische Fragen (IPK, Sortierung) 🟡 [AI draft]
- 4.4.2 GMP-Material überspringt GACP-Abschnitte 🟡 [AI draft]
- 4.4.3 Pause-Abschnitt nur bei Bedarf 🟡 [AI draft]
- 4.4.4 Bedingte Panel-Wiederholungen 🟡 [AI draft - zu validieren]

#### 4.5 Matrix/Soll-Ist-Vergleiche für Primärpackmittel, Bulkmaterial, Schablonen ✅ [umgesetzt]
*Vergleichstabellen zwischen Soll- und Ist-Werten mit Abweichungserkennung*
- 4.5.1 Primärpackmittel Soll-Ist-Matrix ✅ [umgesetzt]
- 4.5.2 Bulkmaterial Vergleichstabellen ✅ [umgesetzt]
- 4.5.3 Schablonen-Verifikation ✅ [umgesetzt]
- 4.5.4 Automatische Abweichungsmarkierung ✅ [umgesetzt]

#### 4.6 Kommentarfelder bei "Nein"-Antworten und bedingte Validierung 🟡 [AI draft]
*Pflicht-Kommentare bei negativen Antworten für lückenlose Dokumentation*
- 4.6.1 Bedingte Kommentarfelder bei boolean:false ✅ [umgesetzt]
- 4.6.2 Validierung von Kommentar-Pflichtfeldern ✅ [umgesetzt]
- 4.6.3 Integration in Audit-Trail 🟡 [AI draft]
- 4.6.4 Export von Kommentaren in JSON/PDF 🟡 [AI draft]

### 5. Exportfunktionen

#### 5.1 JSON-Export mit vollständigen Rohdaten und Audit-Trail 🟡 [AI draft]
*Strukturierte Rohdaten geeignet für Archivierung und Weiterverarbeitung*
- 5.1.1 SurveyJS-Resultatstruktur Export 🟡 [AI draft]
- 5.1.2 Audit-Trail-Daten pro Validierungsgruppe 🟡 [AI draft]
- 5.1.3 Produktionsauftragsdaten Integration ✅ [umgesetzt]
- 5.1.4 Vollständige Metadaten (Zeitstempel, Version) 🟡 [AI draft - zu erweitern]

#### 5.2 PDF-Export mit formatierter, menschenlesbarer Darstellung 🟡 [AI draft]
*Formatierter Bericht mit allen beantworteten Fragen, Audit-Trail und Unterschriften/Kürzel*
- 5.2.1 PDF-Generierung mit survey-pdf 🟡 [AI draft]
- 5.2.2 Formatierte Darstellung aller Antworten 🟡 [AI draft]
- 5.2.3 Audit-Trail-Sektion in PDF 🟡 [AI draft]
- 5.2.4 GMP-konforme Archivierungsformat 🟡 [AI draft - zu validieren]

#### 5.3 Dateinamen-Konventionen für Exporte 🟡 [AI draft]
*Einheitliche Benennungsschema: Protokoll_{orderID}_{timestamp}.{extension}*
- 5.3.1 Protokoll-Präfix Implementation 🟡 [AI draft]
- 5.3.2 OrderID-Integration aus Produktionsauftrag ✅ [umgesetzt]
- 5.3.3 Timestamp-Format (ISO 8601) 🟡 [AI draft - zu validieren]
- 5.3.4 Extension-Handling (.json, .pdf) 🟡 [AI draft]

#### 5.4 Client-seitige Generierung und Download der Exporte 🟡 [AI draft]
*Alle Exporte werden ausschließlich clientseitig generiert ohne Server-Übertragung*
- 5.4.1 Browser-Download-API Integration 🟡 [AI draft]
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

---


**Fokus-Bereiche für nächste Validierung:**
- MA2-Validierungskomponente (Leitungssignatur-Workflow)
- Export-Funktionen (Dateinamen-Konventionen, GMP-Konformität)
- Survey-Validation (erweiterte Feldvalidierungen)
- Navigation-Features (Breadcrumbs, TOC)

---

*Diese erweiterte Taskliste bietet eine detaillierte Übersicht über alle Projektaufgaben mit präzisen Subtasks und Status-Tracking. Sie dient als Grundlage für die finale Validierung und Abnahme des Projekts.*