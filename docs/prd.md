# Project Requirements Document (PRD)

## 1. Zielsetzung

Das Ziel dieses Projekts ist die Entwicklung einer digitalen, tablet-optimierten Webanwendung zur lückenlosen Dokumentation des Cannabis-Produktionsprozesses (insbesondere GACP → GMP) im Reinraum. Die Anwendung ersetzt papierbasierte Formulare und unterstützt die Einhaltung regulatorischer Anforderungen (GxP, Vier-Augen-Prinzip, Audit-Trail) durch einen strukturierten, geführten Fragekatalog.

## 2. Systemüberblick

- **Frontend-Backend-Architektur:** React SPA mit Node.js/Express Backend für lokale Datenpersistenz und Multi-User-Unterstützung.
- **SurveyJS-Integration:** Der gesamte Produktionsprozess wird als hierarchischer, dynamischer Fragebogen abgebildet.
- **Tablet-Optimierung:** UI/UX ist für Touch-Bedienung und große Bedienelemente ausgelegt.
- **Lokale Datenpersistenz:** Backend speichert Survey-Fortschritt und Validierungsdaten lokal (keine SAP-Anbindung).
- **Datenexport:** Export als JSON (strukturiert) und PDF (menschenlesbar) für Archivierung und Qualitätssicherung.

## 3. Hauptfunktionen

### 3.1 Produktionsauftragsverwaltung
- Anlegen, Bearbeiten, Löschen und Auswählen von Produktionsaufträgen.
- Auftragsdaten umfassen Produkt, Materialtyp (GACP/GMP), Chargen, Mengen, Probenzug, Packmittel, Schablonen etc.
- Persistenz im Local Storage.

### 3.2 Geführter Fragebogen (Survey)
- Hierarchische Struktur: Prozessschritt > Teilschritt > Frage.
- Verschiedene Fragetypen: Checkbox, Radiobutton, Matrix, Zahl, Datum/Uhrzeit, Freitext, Signatur/Kürzel, dynamische Panels.
- Bedingte Sichtbarkeit: Fragen/Abschnitte erscheinen nur, wenn sie relevant sind (z.B. GACP-spezifisch, Pause durchgeführt).
- Dynamische Wiederholungen: z.B. für Bulkbeutel, Mitarbeiterlisten.
- Pflichtfelder und Validierungen (inkl. bedingter Validierung).
- Vier-Augen-Prinzip: Kritische Kontrollpunkte erfordern Bestätigung durch zwei Personen (MA1/MA2) inkl. Audit-Trail.
- Fortschrittsanzeige, seitenweise Navigation, Breadcrumbs.

### 3.3 Datenpersistenz & Wiederaufnahme
- Automatisches Speichern des Bearbeitungsstands im Backend bei Seitenwechsel und Auftragswechsel.
- Möglichkeit, einen begonnenen Auftrag fortzusetzen oder neu zu starten.
- Multi-User-Unterstützung: Verschiedene Benutzer können gleichzeitig an verschiedenen Aufträgen arbeiten.
- Auftragsliste zeigt alle in Bearbeitung befindlichen Surveys an.

### 3.4 Abschluss & Export
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
  bulkBeutelAnzahl: number;
  createdAt: string;
}
```

### 4.2 Survey-Antworten & Audit-Trail

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

### 4.3 Validierungsgruppen (Vier-Augen-Prinzip)
```typescript
interface ValidationGroup {
  name: string;
  title: string;
  validationType: "signature" | "validation";
  label: string;
  questions: string[];
}
```

### 4.4 Backend-Datenmodell (Survey-Datei)

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

## 6. Export & Compliance

- **JSON-Export:** Vollständige Rohdaten inkl. Audit-Trail, geeignet für Archivierung und Weiterverarbeitung.
- **PDF-Export:** Formatierter, menschenlesbarer Bericht mit allen beantworteten Fragen, Audit-Trail, Unterschriften/Kürzel.
- **Audit-Trail:** Jede kritische Antwort enthält Kürzel und Zeitstempel von MA1 und ggf. MA2.
- **Vier-Augen-Prinzip:** Für alle Validierungsgruppen wird die Bestätigung durch einen zweiten Mitarbeiter (MA2) mit Kürzel und Zeitstempel dokumentiert.
- **Lokale Datenhaltung:** Alle Daten werden lokal im Backend gespeichert, Exporte werden clientseitig generiert und heruntergeladen.

## 7. Architektur & Projektstruktur

### 7.1 Frontend (React SPA)
```
/src
  /components     # React-Komponenten
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

## 8. Nicht im Umfang (Out of Scope)

- Keine SAP-Integration (lokale Datenhaltung).
- Keine Benutzerverwaltung oder Authentifizierung.
- Keine elektronische Signatur nach 21 CFR Part 11 (nur Kürzel als Textfeld).
- Keine Mehrsprachigkeit (nur Deutsch).
- Keine Admin-UI zur Konfiguration des Fragekatalogs (Survey-Definition ist statisch als JSON).

## 9. Akzeptanzkriterien (Auszug)

- Der gesamte Produktionsprozess ist digital, lückenlos und nachvollziehbar dokumentierbar.
- Alle Pflichtfelder und Validierungen funktionieren wie spezifiziert.
- Die Anwendung ist auf Tablets intuitiv und performant bedienbar.
- Exportierte Dokumente (JSON, PDF) enthalten alle relevanten Daten und Audit-Trail.
- Das Vier-Augen-Prinzip ist an allen kritischen Stellen technisch und UI-seitig umgesetzt.
- Alle Daten werden lokal im Backend gespeichert und verwaltet.

---

*Dieses PRD beschreibt die Anforderungen und Ziele für die technische Umsetzung der digitalen Produktionsprozess-Dokumentation. Es dient als Grundlage für die Implementierung und spätere Abnahme.* 