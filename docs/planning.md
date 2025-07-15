# PLANNING.md – Projektplan für die digitale Produktionsprozess-Dokumentation

## 1. Kontext & Zielsetzung

Dieses Projekt entwickelt eine tablet-optimierte Webanwendung zur GMP-konformen, digitalen Dokumentation des Cannabis-Produktionsprozesses. Ziel ist die vollständige Ablösung papierbasierter Formulare und die Einhaltung regulatorischer Anforderungen (Audit-Trail, Vier-Augen-Prinzip, etc.).

**Scope (MVP):**
- React SPA mit Node.js/Express Backend für lokale Datenpersistenz
- SurveyJS für Fragekatalog mit standardisierten Validierungsgruppen
- Audit-Trail und Validierungsgruppen pro Fragengruppe
- Export als JSON und PDF, clientseitig generiert
- Multi-User-Unterstützung durch Backend-Datenhaltung

**Nicht im Scope:**
- SAP-Integration (siehe sap-integration.md)
- Benutzerverwaltung, Mehrsprachigkeit, digitale Signatur

## 2. Globale Regeln & Prinzipien

- Beachte alle Coding- und Testregeln aus [CLAUDE.md](../CLAUDE.md)
- Jede kritische Funktion wird durch Unit-Tests und Linting abgesichert
- UI und Logik sind klar getrennt, API-Calls über standardisierte Schnittstellen
- Backend und Frontend sind lose gekoppelt über REST-API

## 3. Systemarchitektur

### Frontend (React SPA)
- **Hauptkomponenten:** App, ProductionOrderManager, SurveyComponent, MA2Validation, CompletionScreen
- **Datenfluss:** Produktionsauftrag → Survey → Validierung → Export
- **API-Client:** Kommunikation mit Backend über REST-API

### Backend (Node.js/Express)
- **Datenpersistenz:** Lokale JSON-Dateien für Aufträge, Surveys und Master-Data
- **API-Endpunkte:** REST-API für CRUD-Operationen
- **Datenhaltung:** Getrennte Ordner für Orders, Surveys, Master-Data
- **Multi-User:** Unterstützung für gleichzeitige Bearbeitung verschiedener Aufträge

### Datenfluss
1. Frontend lädt Auftragsliste und Master-Data vom Backend
2. Survey-Bearbeitung wird bei Seitenwechsel/Auftragswechsel im Backend gespeichert
3. Validierungen werden pro Gruppe im Backend persistiert
4. Export wird clientseitig aus Backend-Daten generiert

## 4. Technologie-Stack

- **Frontend:** React, TypeScript, SurveyJS, Vite
- **Backend:** Node.js, Express, TypeScript, ts-node
- **Testing:** Jest, React Testing Library
- **Styling:** CSS, eigene Stylesheets
- **Tools:** VS Code, npm, PDF-Generator, nodemon

## 5. Implementierungsplan

1. **Projekt-Setup & Abhängigkeiten installieren** ✅
2. **UI-Komponenten entwickeln** ✅
3. **Backend-Architektur implementieren** ✅
   - Node.js/Express Server mit REST-API
   - Lokale JSON-Datenpersistenz
   - API-Endpunkte für Aufträge, Surveys, Master-Data
4. **Fragekatalog (SurveyJS-Definition) erstellen** ✅
   - Strukturierung des gesamten Produktionsprozesses in SurveyJS (Seiten, Panels, Fragen, Bedingungen)
   - Standardisierte Validierungsgruppen mit einheitlicher Struktur
5. **Validierungslogik optimieren** ✅
   - Timing-Probleme bei Validierung behoben
   - Einheitliche ValidationGroup-Struktur
   - Audit-Trail-Implementierung pro Fragengruppe
6. **Exportfunktionen (JSON, PDF) umsetzen**
7. **Tests & Qualitätssicherung**
8. **Review & Abnahme**

## 6. Validierung & Qualitätssicherung

- Alle Pflichtfelder und Validierungen funktionieren wie spezifiziert
- Exportierte Dokumente enthalten alle relevanten Daten und Audit-Trail
- Das Vier-Augen-Prinzip ist technisch und UI-seitig umgesetzt

## 7. Verweise & Artefakte

- [prd.md](./prd.md): Vollständige Anforderungen
- [CLAUDE.md](../CLAUDE.md): Coding- und Testregeln
- [sap-integration.md](./sap-integration.md): Zukünftige SAP-Schnittstelle
- [tasks.md](./tasks.md): Dynamische Task-Liste

--- 