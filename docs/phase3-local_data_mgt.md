# Phase 3: Lokale, dateibasierte Datenhaltung & Management – Project Requirements Document (PRD)

## 1. Zielsetzung & Motivation

Die Anwendung soll alle Bearbeitungsstände, Audit-Trails und Auftragsdaten GMP-konform, revisionssicher, nachvollziehbar und teamfähig in einer klaren Dateistruktur (JSON) ablegen. Dies ersetzt die bisherige Speicherung im localStorage und ermöglicht parallele, unterbrechbare Bearbeitung mehrerer Produktionsaufträge. 

**Mit Phase 3 wird ein vollständiges Node.js-Backend eingeführt, das als zentrale Daten- und Integrationsschicht dient.**

- **Zentrale Speicherung:** Alle Daten werden serverseitig verwaltet, nicht mehr im Browser.
- **Mehrbenutzerfähigkeit:** Gleichzeitige Bearbeitung und Statusmanagement mehrerer Aufträge durch verschiedene Nutzer.
- **Revisionssicherheit & Audit-Trail:** Jede Änderung wird nachvollziehbar protokolliert.
- **Vorbereitung SAP-Integration:** Die Architektur ist so ausgelegt, dass eine spätere Anbindung an SAP (siehe @sap-integration.md) mit minimalem Mehraufwand möglich ist.
- **GMP-Compliance:** Die Lösung erfüllt die Anforderungen an elektronische Aufzeichnungen und Audit-Trails gemäß GMP.

## 2. Neue Datenstruktur & Backend-Architektur

**Verzeichnisstruktur (Server-seitig):**
```
data/
  master-data/
    surveyDefinition.json
    validationGroups.json
  orders/
    orders.json
  surveys/
    survey-<orderId>-<timestamp>.json
```

**Backend-Architektur:**
- Node.js/Express-Server als zentrale API-Schicht
- REST-API für CRUD-Operationen auf Orders, Surveys, Master-Data
- Utility-Module für sichere Dateioperationen (lesen, schreiben, listen, löschen)
- Erweiterbar um Authentifizierung, Benutzerverwaltung, Audit-Trail, SAP-Schnittstellen
- GMP-konformes Logging und Fehlerhandling

**Survey-Antwortdatei:**
```typescript
interface SurveyFile {
  orderId: string;
  timestamp: string; // ISO 8601
  status: 'in_progress' | 'completed' | 'aborted';
  answers: Record<string, SurveyAnswerItem>;
  auditTrail: Record<string, any>; 
  // weitere Metadaten (z. B. Version, User-Agent, etc.)
}
```

**Revisionsdatei (optional):**
```typescript
interface SurveyRevisionFile {
  orderId: string;
  revisions: Array<{
    timestamp: string;
    user: string;
    changes: any;
  }>;
}
```

## 3. Utility-Funktionen & Backend-API

**Im Backend:**
- `readJsonFile(path: string): Promise<any>`
- `writeJsonFile(path: string, data: any): Promise<void>`
- `listSurveyFiles(orderId?: string): Promise<string[]>`
- `deleteSurveyFile(filename: string): Promise<void>`
- **REST-API:**
  - GET/POST/PUT/DELETE für Orders, Surveys, Master-Data
  - Validierung und Fehlerbehandlung auf Server-Seite
  - Audit-Trail-Mechanismen für alle schreibenden Operationen

**Im Frontend:**
- Die bisherigen Utility-Funktionen werden zu API-Clients, die mit dem Backend kommunizieren (z. B. via fetch/axios)
- Keine direkte Dateisystem- oder localStorage-Nutzung mehr im Frontend

## 4. Refaktorierung der Komponenten & Systemlogik

- **SurveyComponent:**  
  - Lädt und speichert Bearbeitungsstände ausschließlich über die Backend-API in `data/surveys/`.
  - Erzeugt neue Survey-JSONs beim Start eines neuen Fragekatalogs über das Backend.
  - Setzt und verwaltet den Status (`in_progress`, `completed`, `aborted`) serverseitig.
  - Holt Audit-Trail und Validierungsdaten aus der API.

- **ProductionOrderManager:**  
  - Zeigt alle Aufträge aus `orders.json` (via Backend-API).
  - Prüft für jeden Auftrag, ob ein Survey-JSON existiert und zeigt den Status an (API-Call).
  - Ermöglicht Fortsetzen, Neu starten, Abbrechen von Surveys über API-Operationen.

- **MA2Validation:**  
  - Schreibt Audit-Trail/Validierungsdaten in die Survey-JSONs (bzw. Revisionsdatei) über das Backend.

- **App.tsx & Navigation:**
  - Die gesamte State- und Navigationslogik ist auf die neue, serverbasierte Datenhaltung umgestellt.
  - Resume-Dialog prüft per API, ob in-progress-Surveys existieren und bietet Fortsetzen/Neustart an.

- **Synchronisation & Mehrbenutzerfähigkeit:**
  - Das Backend verwaltet den Bearbeitungsstatus und verhindert Konflikte bei paralleler Bearbeitung.
  - Spätere Erweiterung um Authentifizierung und Benutzerrechte ist vorbereitet.

## 5. Migration bestehender Daten aus localStorage

- Einmalige Überführung vorhandener Bearbeitungsstände aus localStorage in die neue Backend-Dateistruktur (Script oder Migrationsfunktion im Backend).
- Nach Migration: localStorage-Nutzung vollständig entfernen, alle Daten werden zentral im Backend verwaltet.
- Sicherstellung, dass keine Daten verloren gehen und alle Bearbeitungsstände revisionssicher übernommen werden.

## 6. Detaillierte Taskliste

- 8.1 Backend-Architektur & Node.js-Server: Architektur & Grundgerüst
  - 8.1.1 Anforderungsanalyse & Zieldefinition
    - Detaillierte Analyse der Anforderungen an das Backend (Datei-API, Auth, Multi-User, SAP-Readiness, GMP-Anforderungen, Audit-Trail, Performance, Fehlerbehandlung).
  - 8.1.2 Technologiewahl & Projektsetup
    - Auswahl der Node.js-Basis (Express.js), Projektinitialisierung, Verzeichnisstruktur, Linter, TypeScript (optional), Package-Management.
  - 8.1.3 API-Design & Schnittstellendefinition
    - Definition der REST-API-Endpunkte für CRUD-Operationen auf Orders, Surveys, Master-Data, inkl. Dateinamen-Konventionen, Fehlercodes, Response-Formate.

- 8.2 Implementierung der Datei-API
  - 8.2.1 Implementierung: Lesen/Schreiben von JSON-Dateien
    - Entwicklung von Utility-Funktionen im Backend zum sicheren Lesen, Schreiben, Listen und Löschen von JSON-Dateien in den Verzeichnissen `data/master-data/`, `data/orders/`, `data/surveys/`.
  - 8.2.2 API-Endpunkte für Orders
    - Endpunkte zum Abrufen, Anlegen, Bearbeiten und Löschen von Produktionsaufträgen (`orders.json`).
  - 8.2.3 API-Endpunkte für Surveys
    - Endpunkte zum Anlegen, Laden, Aktualisieren, Listen und Löschen von Survey-JSONs pro Auftrag und Bearbeitungsstand (inkl. Statuswechsel, Audit-Trail).
  - 8.2.4 API-Endpunkte für Master-Data
    - Endpunkte zum Abrufen der Survey-Definition und Validierungsgruppen (Read-Only).
  - 8.2.5 Fehlerbehandlung & Validierung
    - Robuste Fehlerbehandlung, Validierung der Dateiinhalte, Logging von Fehlern und Zugriffen.

- 8.3 Integration Frontend <-> Backend
  - 8.3.1 Anpassung der Utility-Funktionen im Frontend
    - Refaktorierung der Utility-Funktionen (`readJsonFile`, `writeJsonFile`, etc.) im Frontend, sodass sie per HTTP-Request mit dem Backend kommunizieren.
  - 8.3.2 CORS & Sicherheit
    - Konfiguration von CORS im Backend, um lokale Entwicklung und späteren produktiven Betrieb zu ermöglichen.
  - 8.3.3 Test: End-to-End-Durchläufe
    - Testen aller Kern-Workflows (Anlegen, Unterbrechen, Fortsetzen, Abschließen von Surveys, parallele Bearbeitung) über die neue API.

- 8.4 Erweiterungen & GMP/SAP-Readiness
  - 8.4.1 Audit-Trail & Revisionssicherheit
    - Implementierung von Audit-Trail-Mechanismen (z. B. Änderungsprotokoll, Zeitstempel, User-Tracking) für alle Dateioperationen.
  - 8.4.2 Authentifizierung & Benutzerverwaltung (optional, vorbereitend)
    - Grundlegende Authentifizierung (z. B. Token-basiert), Benutzerrollen, Vorbereitung für GMP-konforme Benutzeridentifikation.
  - 8.4.3 Vorbereitung SAP-Integration
    - Definition und Implementierung von Schnittstellen (z. B. Import/Export von Survey- und Auftragsdaten), Mapping der JSON-Struktur auf das SAP-Datenmodell laut `sap-integration.md`.
  - 8.4.4 Dokumentation & Betriebskonzepte
    - Ausführliche Dokumentation der Backend-Architektur, API, Betriebskonzepte (Backup, Recovery, Deployment, Security, GMP-Compliance).

- 8.5 Migration & Rollout
  - 8.5.1 Migration bestehender Daten
    - Entwicklung eines Scripts oder Migrationsprozesses zur Überführung vorhandener localStorage-Daten in die neue Backend-Struktur.
  - 8.5.2 Rollout & Schulung
    - Planung und Durchführung des Rollouts, Schulung der Nutzer, Feedbackschleifen, Anpassungen nach Erstbetrieb.

---

**Hinweis:**
Diese Taskliste bildet die Grundlage für die schrittweise Einführung eines Node.js-Backends als zentrales Element der lokalen, GMP-konformen und SAP-fähigen Datenhaltung. Sie kann je nach Projektfortschritt und Anforderungen weiter verfeinert werden.

--- 