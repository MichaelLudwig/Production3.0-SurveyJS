# Project Requirements Document (PRD)

## 1. Zielsetzung

Das Ziel dieses Projekts ist die Entwicklung einer digitalen, tablet-optimierten Webanwendung zur lückenlosen Dokumentation des Cannabis-Produktionsprozesses (insbesondere GACP → GMP) im Reinraum. Die Anwendung ersetzt papierbasierte Formulare und unterstützt die Einhaltung regulatorischer Anforderungen (GxP, Vier-Augen-Prinzip, Audit-Trail) durch einen strukturierten, geführten Fragekatalog.

## 2. Systemüberblick

- **Frontend-Backend-Architektur:** React SPA mit Node.js/Express Backend für lokale Datenpersistenz und Multi-User-Unterstützung.
- **SurveyJS-Integration:** Der gesamte Produktionsprozess wird als hierarchischer, dynamischer Fragebogen abgebildet.
- **Custom Dashboard für Produktionslauf:** Spezielle Benutzeroberfläche für die Abfüllung von Bulkbeuteln mit Echtzeit-Überwachung und automatischer Datenintegration.
- **Tablet-Optimierung:** UI/UX ist für Touch-Bedienung und große Bedienelemente ausgelegt.
- **Lokale Datenpersistenz:** Backend speichert Survey-Fortschritt und Validierungsdaten lokal (keine SAP-Anbindung).
- **Datenexport:** Export als JSON (strukturiert) und PDF (menschenlesbar) für Archivierung und Qualitätssicherung.

## 3. Hauptfunktionen

### 3.1 Produktionsauftragsverwaltung
- Anlegen, Bearbeiten, Löschen und Auswählen von Produktionsaufträgen.
- Auftragsdaten umfassen Produkt, Materialtyp (GACP/GMP), Chargen, Mengen, Probenzug, Packmittel, Schablonen etc.
- Persistenz im Local Storage.
- **Erweiterte Auftragsverwaltung:** Status-Tracking für jeden Auftrag (none, in_progress, completed) mit direkter Fortsetzung von begonnenen Surveys.

### 3.2 Geführter Fragebogen (Survey)
- **Gesamtstruktur:** 26 Seiten in 10 Kapiteln:
  - **Kapitel 1:** Information/Auftrag (1.1-1.5): Information Produktionsauftrag; Beteiligte Mitarbeiter; Datum + Uhrzeit Beginn; Vorbereitung Kennzeichnung; Raumstatus überprüfen
  - **Kapitel 2:** Materialbereitstellung (2.1-2.4): Primärpackmittel; Bulkmaterial; Zubehör Schablonen/GMP; Abschluss
  - **Kapitel 3:** Reinraum-Vorbereitung (3.1-3.3): Line Clearing; Waage; Kammerschweißgerät
  - **Kapitel 4:** Produktion (4.1-4.5): Herstellprozess Beginn; Primärverpackung Produktionslauf; Pause; Pause Details; Kumulierte Restmenge und Probenzug
  - **Kapitel 5:** Restmenge (5.1): Restmenge
  - **Kapitel 6:** Schleusung (6.1): Eurocontainer
  - **Kapitel 7:** Nachbereitung Reinraum (7.1): Schleusung und Nachbereitung
  - **Kapitel 8:** Einlagern (8.1-8.2): Einlagern; Nicht genutzte Eingangsmaterialien
  - **Kapitel 9:** Nachbereitung (9.1): Reinraum Final
  - **Kapitel 10:** Abschluss (10.1-10.2): Abschluss; Herstellung abgeschlossen
- Hierarchische Struktur: Prozessschritt > Teilschritt > Frage.
- Verschiedene Fragetypen: Checkbox, Radiobutton, Matrix, Zahl, Datum/Uhrzeit, Freitext, Signatur/Kürzel, dynamische Panels.
- **MaterialType-spezifische Sichtbarkeit:** Fragen/Abschnitte erscheinen nur, wenn sie für den jeweiligen Materialtyp (GACP/GMP) relevant sind.
- **MaterialType-spezifische Validierungsgruppen:** Separate Vier-Augen-Validierungen je nach Materialtyp aufgrund unterschiedlicher Prozessschritte.
- **Standort-basierte Orientierung:** Farbliche Unterscheidung zwischen Lager- (blau: Kapitel 1 "Information/Auftrag", 2 "Materialbereitstellung", 8 "Einlagern", 9 "Nachbereitung", 10 "Abschluss") und Reinraum-Bereichen (grün: Kapitel 3 "Reinraum-Vorbereitung", 4 "Produktion", 5 "Restmenge", 6 "Schleusung", 7 "Nachbereitung Reinraum"). Hintergrund und Seitenrahmen passen sich automatisch an.
- **Integrierte Infografiken:** Prozessabläufe, Etiketten-Beispiele und Zielzustände werden durch Grafiken veranschaulicht.
- Dynamische Wiederholungen: z.B. für Bulkbeutel, Mitarbeiterlisten.
- Pflichtfelder und Validierungen (inkl. bedingter Validierung).
- Vier-Augen-Prinzip: Kritische Kontrollpunkte erfordern Bestätigung durch zwei Personen (MA1/MA2) inkl. Audit-Trail.
- Fortschrittsanzeige, seitenweise Navigation, Breadcrumbs.

### 3.3 Datenpersistenz & Wiederaufnahme
- Automatisches Speichern des Bearbeitungsstands im Backend bei Seitenwechsel und Auftragswechsel.
- Möglichkeit, einen begonnenen Auftrag fortzusetzen oder neu zu starten.
- Multi-User-Unterstützung: Verschiedene Benutzer können gleichzeitig an verschiedenen Aufträgen arbeiten.
- Auftragsliste zeigt alle in Bearbeitung befindlichen Surveys an.
- **Erweiterte Persistenz:** Separate Speicherung von Survey-Daten und Dashboard-Zustand.

### 3.4 Custom Dashboard für Produktionslauf
- **Spezielle Benutzeroberfläche:** Ersetzt die Standard-SurveyJS-Seite für "4.2 Primärverpackung - Produktionslauf".
- **Vier-Spalten-Layout:** Material Eingang, Produktionslauf, Material Ausgang, Eurocontainer.
- **Automatische Bulkbeutel-Generierung:** Erstellt Bulkbeutel-Liste basierend auf den eingegebenen Gebinden beim Material-Eingang (`bulkgebinde_liste`).
- **Echtzeit-Status-Tracking:** Jeder Bulkbeutel hat einen Status (nicht_verarbeitet, in_bearbeitung, abgeschlossen).
- **Visuelle Fortschrittsanzeige:** Donut-Charts für verarbeitete Bulkbeutel und erzeugte Gebinde.
- **Integrierte Abfüllform:** Custom Formular für jeden Bulkbeutel mit Validierung und Warnungen.
- **Automatische Datenintegration:** Speichert Abfüll-Daten direkt in das SurveyJS `bulk_beutel_production` paneldynamic.
- **Eurocontainer-Verwaltung:** Verplomben von Gebinden mit Plomben-Nummern und automatische Integration in die Schleusungsseite.
- **Automatische Datenverarbeitung:** Berechnung der kumulierten Restmenge und automatische Erstellung der Eurocontainer-Liste.

### 3.5 Abschluss & Export
- Abschlussseite mit Zusammenfassung und Platzhalter für Produktionsleitung-Benachrichtigung.
- Export als JSON (strukturierte Rohdaten inkl. Audit-Trail) und PDF (formatierter Bericht).
- Dateinamen-Konvention: `Protokoll_{orderID}_{timestamp}.{extension}`.


## 4. Datenmodelle (Auszug)

### 4.1 Produktionsauftrag
```typescript
interface ProductionOrder {
  id: string;
  produktName: string;
  protokollNummer?: string;
  materialType: 'GACP' | 'GMP';
  eingangsmaterial: {
    artikelNummer: string;
    produktbezeichnung?: string;
    charge: string;
    verfallsdatum?: string;
    menge?: string;
    eingangsMenge?: number;
  };
  schablone?: {
    eqNummer: string;
    charge: string;
    anzahl: number;
  };
  primaerPackmittel: {
    artikelNummer: string;
    produktbezeichnung?: string;
    charge: string;
    anzahl: number;
  };
  zwischenprodukt: {
    artikelNummer: string;
    gebindeNummer: string;
    vorgGebindezahl?: number;
  };
  probenzug: {
    plan: string;
    freigabeVorgesehen?: string;
    anzahl: number;
    fuellmenge?: number;
    fuellmenge1?: number;
    fuellmenge2?: number;
  };

  createdAt: string;
}
```

### 4.2 Dashboard-spezifische Datenmodelle

#### BulkBeutel Interface
```typescript
interface BulkBeutel {
  id: number;
  gebindegroesse: number;
  anzahl: number;
  probenzug_verwendet: boolean;
  dicht_sauber: boolean;
  status: 'nicht_verarbeitet' | 'in_bearbeitung' | 'abgeschlossen';
}
```

#### Dashboard State
```typescript
interface DashboardState {
  produktionslauf: {
    bulkBeutel: BulkBeutel[];
    selectedBulkBeutel: number | null;
  };
  survey: Record<string, any>; // SurveyJS-Daten
}
```

#### BulkBeutel Production Entry
```typescript
interface BulkBeutelProductionEntry {
  bulk_nummer: string;
  soll_inhalt: number;
  ist_inhalt: string;
  anzahl_gebinde: string;
  blueten_unauffaellig: boolean;
  gebinde_korrekt_abgewogen: boolean;
  restmenge: string;
  aussortiertes_material: string;
  probenzug_ipk: string;
  bruch: string;
  kommentar: string;
  erfasst_kuerzel: string;
  geprueft_kuerzel: string;
  schweissnaht_ok: boolean;
  timestamp: string;
}
```

### 4.3 Survey-Antworten & Audit-Trail

Die Survey-Antworten werden als einfaches Key-Value-Objekt gespeichert:
```typescript
survey: Record<string, any>;
```

Der Audit-Trail (Vier-Augen-Prinzip / MA2) erfolgt **pro Validierungsgruppe** und wird im `validation`-Objekt abgelegt. Jede Validierungsgruppe enthält:
- den Status der Validierung ("pending", "completed", "aborted")
- Kürzel und Zeitstempel des zweiten Mitarbeiters (MA2)
- optional einen Kommentar
- ein explizites Feld, ob die Validierung erfolgreich war (`validationOK`)
- ein Array der validierten Fragen (`validatedQuestions`)

```typescript
interface ValidationGroupStatus {
  status: 'pending' | 'completed' | 'aborted';
  ma2Kuerzel?: string;
  ma2Timestamp?: string;
  ma2Kommentar?: string;
  validationOK?: boolean;
  validatedQuestions?: string[];
}
```

Die Survey-Antworten selbst enthalten **keinen** Audit-Trail mehr auf Feldebene.

---

### 4.4 Validierungsgruppen (Vier-Augen-Prinzip)
```typescript
interface ValidationGroup {
  name: string;
  title: string;
  validationType: "signature" | "validation";
  label: string;
  materialType?: "ALL" | "GACP" | "GMP"; // MaterialType-spezifische Validierung
  questions: string[];
}
```

**MaterialType-spezifische Validierungsgruppen:**
Das System unterstützt separate Validierungsgruppen je nach Materialtyp (GACP/GMP), da die Eingabefelder und Prozessschritte teilweise stark unterschiedlich sind:

- **GACP-spezifische Gruppen:** Zubehör Schablonen, Kumulierte Restmenge (GACP), Finale Restmenge (GACP), Einlagern Eingangsmaterialien (GACP)
- **GMP-spezifische Gruppen:** Kumulierte Restmenge (GMP), Finale Restmenge (GMP), Einlagern Eingangsmaterialien (GMP)  
- **ALL-Gruppen:** Für beide Materialtypen gültige Validierungen (Eingangsmaterialien, Raumstatus, etc.)

**Beispiele für GACP-spezifische Unterschiede:**
- Schablonen-Verwaltung (nur GACP)
- IPK-Probenzug (erste, mittlere, letzte Probe bei GACP)
- Aussortiertes Material und Bruch-Trennung (GACP)
- Schablonen-Entsorgung (nur GACP)

**Beispiele für GMP-spezifische Unterschiede:**
- Vereinfachte Restmenge-Berechnung (Bruch wird zur Restmenge hinzugefügt)
- Keine Schablonen-Verwaltung
- Keine IPK-Probenzug-Anforderungen

### 4.5 Backend-Datenmodell (Survey-Datei)

Die Survey-Datei speichert alle relevanten Informationen zu einem Bearbeitungsstand:

```typescript
interface SurveyFile {
  orderId: string;
  timestamp: string;
  status: 'in_progress' | 'completed' | 'aborted';
  survey: Record<string, any>; // Survey-Antworten
  validation: Record<string, ValidationGroupStatus>; // Validierungsgruppen inkl. Audit-Trail
  currentPageNo?: number;
}
```

**Beispiel:**
```json
{
  "orderId": "3",
  "timestamp": "2025-07-15T22:34:17.058Z",
  "status": "in_progress",
  "survey": {
    "eingangsmaterial_ausgebucht": true,
    "mitarbeiter_liste": [
      { "name": "ert", "kuerzel": "ert" },
      { "name": "ert", "kuerzel": "ert" }
    ],
    "bulkgebinde_liste": [
      {
        "anzahl": 2,
        "gebindegroesse": 500,
        "probenzug_verwendet": true,
        "dicht_sauber": true
      }
    ],
    "bulk_beutel_production": [
      {
        "bulk_nummer": "1",
        "soll_inhalt": 500,
        "ist_inhalt": "485.5",
        "anzahl_gebinde": "32",
        "blueten_unauffaellig": true,
        "gebinde_korrekt_abgewogen": true,
        "restmenge": "14.5",
        "aussortiertes_material": "2.3",
        "probenzug_ipk": "1.2",
        "bruch": "0.5",
        "erfasst_kuerzel": "MA1",
        "geprueft_kuerzel": "MA2",
        "schweissnaht_ok": true,
        "timestamp": "2025-07-15T22:30:00.000Z"
      }
    ]
    // ... weitere Antworten ...
  },
  "validation": {
    "eingangsmaterialien_ausbuchen": {
      "status": "completed",
      "ma2Kuerzel": "ert",
      "ma2Timestamp": "2025-07-15T21:45:23.925Z",
      "validationOK": true,
      "validatedQuestions": ["eingangsmaterial_ausgebucht"]
    },
    "raumstatus_pruefen": {
      "status": "completed",
      "ma2Kuerzel": "34",
      "ma2Timestamp": "2025-07-15T21:46:23.979Z",
      "validationOK": true,
      "validatedQuestions": [
        "arbeitsraum_ist_druck_matrix",
        "schleusen_ist_druck_matrix",
        "reinraumstatus_ampel",
        "reinraum_nutzbar"
      ]
    }
    // ... weitere Validierungsgruppen ...
  },
  "currentPageNo": 6
}
```

## 5. Nutzerführung & UI/UX

- **Touch-Optimierung:** Mind. 44px große Bedienelemente, große Schrift, großzügige Abstände.
- **Responsives Design:** Optimiert für Tablets (Hoch- und Querformat), aber auch auf Desktop nutzbar.
- **Klares Farbschema:** Helle, kontrastreiche Farben, SurveyJS-Standardfarben.
- **Barrierefreiheit:** Fokus-Indikatoren, hohe Kontraste, Unterstützung für reduzierte Bewegung und Dark Mode.
- **Fortschrittsanzeige:** Fortschrittsbalken, Seitenzähler, Breadcrumbs.
- **Hilfetexte:** Inline-Hilfen und Kontextbeschreibungen für kritische Felder.
- **Dashboard-spezifische UI:** 
  - Vier-Spalten-Layout für optimale Übersicht
  - Donut-Charts für visuelle Fortschrittsanzeige
  - Status-basierte Farbkodierung (grün/rot/gelb)
  - Toggle-Switches für Ja/Nein-Fragen
  - Warnungen für kritische Probenzug-Anforderungen

## 6. Export & Compliance

- **JSON-Export:** Vollständige Rohdaten inkl. Audit-Trail, geeignet für Archivierung und Weiterverarbeitung.
- **PDF-Export:** Formatierter, menschenlesbarer Bericht mit allen beantworteten Fragen, Audit-Trail, Unterschriften/Kürzel.
- **Audit-Trail:** Jede kritische Antwort enthält Kürzel und Zeitstempel von MA1 und ggf. MA2.
- **Vier-Augen-Prinzip:** Für alle Validierungsgruppen wird die Bestätigung durch einen zweiten Mitarbeiter (MA2) mit Kürzel und Zeitstempel dokumentiert.
- **Lokale Datenhaltung:** Alle Daten werden lokal im Backend gespeichert, Exporte werden clientseitig generiert und heruntergeladen.
- **Dashboard-Datenintegration:** Alle Dashboard-Eingaben werden vollständig in die SurveyJS-Struktur integriert und sind im Export enthalten.

### 6.1 Angepasster SurveyJS-Export

**Signifikante Anpassungen am Standard-SurveyJS-Export:**

- **Tabellarische Darstellung:** Matrix-Daten (Mitarbeiterlisten, Druck-Messungen, Bulkgebinde, etc.) werden in übersichtlichen Tabellen dargestellt statt als JSON-Arrays
- **Strukturierte Sektionen:** Export ist nach Survey-Seiten organisiert mit klaren Überschriften und Unterabschnitten
- **Intelligente Datenformatierung:** 
  - Boolean-Werte werden als ✓ Ja / ✗ Nein dargestellt
  - Datum/Uhrzeit-Werte werden im deutschen Format formatiert
  - Leere Werte werden ausgeblendet
- **Vier-Augen-Validierung Integration:** Validierungsdaten werden direkt in die jeweiligen Sektionen integriert mit spezieller Formatierung
- **Produktionslauf-Details:** Bulk-Beutel-Produktionsdaten werden in detaillierten Tabellen mit allen relevanten Feldern dargestellt
- **Responsive Design:** PDF-Layout ist für A4-Druck optimiert mit angepassten Schriftgrößen und Spacing
- **Vollständige Datenabdeckung:** Alle SurveyJS-Felder, Dashboard-Eingaben und Backend-Daten werden konsolidiert exportiert

## 7. Architektur & Projektstruktur

### 7.1 Frontend (React SPA)
```
/src
  /components     # React-Komponenten
    /BulkBeutelDashboard.tsx    # Custom Dashboard für Produktionslauf
    /BulkBeutelForm.tsx         # Formular für einzelne Bulkbeutel
    /ProductionOrderManager.tsx # Auftragsverwaltung
    /SurveyComponent.tsx        # Haupt-Survey-Komponente
    /MA2Validation.tsx          # Vier-Augen-Validierung
  /types         # TypeScript-Interfaces
  /utils         # Hilfsfunktionen und API-Client
  /styles        # CSS-Dateien
```

### 7.2 Backend (Node.js/Express)
```
/backend
  /src
    /controllers # API-Controller
    /routes      # Express-Routes
    /types       # TypeScript-Interfaces
    /middleware  # Express-Middleware
    server.ts    # Server-Hauptdatei
  /data
    /orders      # Produktionsaufträge
    /surveys     # Survey-Fortschritt und -Abschlüsse
    /master-data # Fragekatalog und Validierungsgruppen
```

### 7.3 API-Endpunkte
- `GET /api/orders` - Produktionsaufträge laden
- `GET /api/master-data/survey-definition` - Fragekatalog laden
- `GET /api/master-data/validation-groups` - Validierungsgruppen laden
- `GET /api/surveys/:orderId/data` - Survey-Fortschritt laden
- `POST /api/surveys/:orderId/data` - Survey-Fortschritt speichern
- `PUT /api/surveys/:orderId/progress` - Dashboard-Daten speichern
- `GET /api/surveys/:orderId/status` - Survey-Status abfragen

## 9. Integrierte Infografiken

### 8.1 Prozessablauf-Grafiken
- **Herstellprozess GACP:** Drei-stufige Flussdiagramme (`herstellung-GACP-1.png`, `herstellung-GACP-2.png`, `herstellung-GACP-3.png`) zeigen den kompletten Abfüllungsprozess für GACP-Material
- **Herstellprozess GMP:** Vereinfachtes Flussdiagramm (`herstellung-GMP-1.png`) für GMP-Material
- **Probenzug GACP:** Spezielle Grafiken (`probenzug-GACP-1.png`, `probenzug-GACP-2.png`) zeigen die IPK-Probenzug-Anforderungen für erste, mittlere und letzte Bulkbeutel
- **Restmenge-Verarbeitung:** Flussdiagramm (`restmenge.png`) für die Abfüllung der kumulierten Restmenge

### 8.2 Etiketten- und Material-Beispiele
- **Primärpackmittel-Etikett:** Beispiel (`packmittel-etikett.png`) für die Identifikation von Primärpackmitteln
- **Bulkbeutel-Etikett:** Beispiel (`bulkbeutel-etikett.png`) für die Identifikation von Bulkmaterial
- **Eurocontainer:** Referenzbild (`eurocontainer.png`) für die korrekte Verpackung

### 8.3 Arbeitsplatz- und Zielzustand-Grafiken
- **Arbeitsplatz GACP:** Layout (`raum-GACP.png`) mit Utensilien und Equipment für GACP-Prozesse
- **Arbeitsplatz GMP:** Layout (`raum-GMP.png`) mit vereinfachtem Equipment für GMP-Prozesse
- **Reinraum-Clearing:** Zielzustand (`reinraum_clearing.png`) nach der Nachbereitung
- **Ausschleusung:** Prozess (`ausschleusen_ec.png`) für die Vorbereitung der Eurocontainer

### 8.4 Integration in SurveyJS
- **HTML-Elemente:** Alle Grafiken sind als HTML-Elemente in der Survey-Definition integriert
- **Responsive Design:** Grafiken sind mit `max-width` und `margin-top` für optimale Darstellung konfiguriert
- **MaterialType-spezifisch:** Einige Grafiken werden nur für bestimmte Materialtypen angezeigt (z.B. GACP-spezifische Herstellprozesse)

## 10. Dashboard-Funktionalitäten

### 9.1 Material Eingang (Spalte 1)
- **Bulkbeutel-Liste:** Automatische Generierung basierend auf `bulkgebinde_liste`
- **Status-Tracking:** Visuelle Anzeige des Verarbeitungsstatus jedes Bulkbeutels
- **Fortschritts-Chart:** Donut-Chart für verarbeitete vs. Gesamt-Bulkbeutel
- **Sequentielle Verarbeitung:** Nur der nächste verfügbare Bulkbeutel kann bearbeitet werden

### 9.2 Produktionslauf (Spalte 2)
- **Dynamisches Formular:** Custom Formular für jeden Bulkbeutel
- **Validierung:** Pflichtfelder und Warnungen für kritische Probenzug-Anforderungen
- **Datenintegration:** Automatische Speicherung in `bulk_beutel_production`
- **Status-Management:** Übergang zwischen Bearbeitungszuständen

### 9.3 Material Ausgang (Spalte 3)
- **Erzeugte Gebinde:** Donut-Chart mit Soll-Ist-Vergleich
- **Probenzug-Überwachung:** Tracking der IPK-Proben (erste, mittlere, letzte)
- **Kummulierte Werte:** Automatische Berechnung von Restmenge, Bruch, aussortiertem Material
- **Echtzeit-Updates:** Alle Werte werden automatisch aktualisiert

### 9.4 Eurocontainer (Spalte 4)
- **Verplomben-Funktion:** Verpacken von Gebinden mit Plomben-Nummern
- **Validierung:** 7-stellige Plomben-Nummern, Verfügbarkeitsprüfung
- **Automatische Integration:** Daten werden in die Schleusungsseite übertragen
- **Container-Liste:** Übersicht aller verplombten Container

## 10. Nicht im Umfang (Out of Scope)

- Keine SAP-Integration (lokale Datenhaltung).
- Keine Benutzerverwaltung oder Authentifizierung.
- Keine elektronische Signatur nach 21 CFR Part 11 (nur Kürzel als Textfeld).
- Keine Mehrsprachigkeit (nur Deutsch).
- Keine Admin-UI zur Konfiguration des Fragekatalogs (Survey-Definition ist statisch als JSON).
- Keine automatische Synchronisation zwischen mehreren Geräten.

## 12. Akzeptanzkriterien (Auszug)

- Der gesamte Produktionsprozess ist digital, lückenlos und nachvollziehbar dokumentierbar.
- Alle Pflichtfelder und Validierungen funktionieren wie spezifiziert.
- Die Anwendung ist auf Tablets intuitiv und performant bedienbar.
- Exportierte Dokumente (JSON, PDF) enthalten alle relevanten Daten und Audit-Trail.
- Das Vier-Augen-Prinzip ist an allen kritischen Stellen technisch und UI-seitig umgesetzt.
- Alle Daten werden lokal im Backend gespeichert und verwaltet.
- **MaterialType-spezifisch:**
  - GACP- und GMP-spezifische Fragen werden korrekt angezeigt/versteckt
  - Separate Validierungsgruppen funktionieren je nach Materialtyp
  - Prozessschritte werden materialtyp-spezifisch validiert
- **Dashboard-spezifisch:**
  - Bulkbeutel werden automatisch aus den Material-Eingangsdaten generiert
  - Produktionslauf-Daten werden vollständig in die SurveyJS-Struktur integriert
  - Eurocontainer-Verwaltung funktioniert nahtlos mit der Schleusungsseite
  - Alle Berechnungen (Restmenge, Bruch, etc.) erfolgen automatisch und korrekt

---

*Dieses PRD beschreibt die Anforderungen und Ziele für die technische Umsetzung der digitalen Produktionsprozess-Dokumentation. Es dient als Grundlage für die Implementierung und spätere Abnahme.* 