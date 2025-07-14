# PLANNING.md – Projektplan für die digitale Produktionsprozess-Dokumentation

## 1. Kontext & Zielsetzung

Dieses Projekt entwickelt eine tablet-optimierte Webanwendung zur GMP-konformen, digitalen Dokumentation des Cannabis-Produktionsprozesses. Ziel ist die vollständige Ablösung papierbasierter Formulare und die Einhaltung regulatorischer Anforderungen (Audit-Trail, Vier-Augen-Prinzip, etc.).

**Scope (MVP):**
- React SPA, SurveyJS, keine Backend- oder SAP-Anbindung
- Audit-Trail und Validierungsgruppen pro Fragengruppe
- Export als JSON und PDF, alles clientseitig

**Nicht im Scope:**
- SAP-Integration (siehe sap-integration.md)
- Benutzerverwaltung, Mehrsprachigkeit, digitale Signatur

## 2. Globale Regeln & Prinzipien

- Beachte alle Coding- und Testregeln aus [CLAUDE.md](../CLAUDE.md)
- Jede kritische Funktion wird durch Unit-Tests und Linting abgesichert
- UI und Logik sind klar getrennt, keine Backend-Calls im MVP

## 3. Systemarchitektur

- Die Anwendung besteht aus den Hauptkomponenten: App, ProductionOrderManager, SurveyComponent, MA2Validation, CompletionScreen
- Datenfluss: Produktionsauftrag → Survey → Validierung → Export

## 4. Technologie-Stack

- **Frontend:** React, TypeScript, SurveyJS, Vite
- **Testing:** Jest, React Testing Library
- **Styling:** CSS, eigene Stylesheets
- **Tools:** VS Code, npm, PDF-Generator

## 5. Implementierungsplan

1. **Projekt-Setup & Abhängigkeiten installieren**
2. **UI-Komponenten entwickeln**
3. **Fragekatalog (SurveyJS-Definition) erstellen**
   - Strukturierung des gesamten Produktionsprozesses in SurveyJS (Seiten, Panels, Fragen, Bedingungen)
   - Parallel: Für jede Seite/Gruppe die Validierungslogik und Audit-Trail-Implementierung anpassen/ergänzen
4. **Exportfunktionen (JSON, PDF) umsetzen**
5. **Tests & Qualitätssicherung**
6. **Review & Abnahme**

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