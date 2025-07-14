# Project Requirements Document (PRD)

## 1. Zielsetzung

Das Ziel dieses Projekts ist die Entwicklung einer digitalen, tablet-optimierten Webanwendung zur lückenlosen Dokumentation des Cannabis-Produktionsprozesses (insbesondere GACP → GMP) im Reinraum. Die Anwendung ersetzt papierbasierte Formulare und unterstützt die Einhaltung regulatorischer Anforderungen (GxP, Vier-Augen-Prinzip, Audit-Trail) durch einen strukturierten, geführten Fragekatalog.

## 2. Systemüberblick

- **Frontend-Only:** React SPA, keine Backend- oder SAP-Anbindung, alle Datenverarbeitung und -speicherung erfolgt clientseitig.
- **SurveyJS-Integration:** Der gesamte Produktionsprozess wird als hierarchischer, dynamischer Fragebogen abgebildet.
- **Tablet-Optimierung:** UI/UX ist für Touch-Bedienung und große Bedienelemente ausgelegt.
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
- Automatisches Speichern des Bearbeitungsstands im Local Storage.
- Möglichkeit, einen begonnenen Auftrag fortzusetzen oder neu zu starten.

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
```typescript
interface SurveyAnswerItem {
  value: any;
  audit?: {
    ma1Kuerzel?: string;
    ma1Timestamp?: string;
    ma2Kuerzel?: string;
    ma2Timestamp?: string;
    ma2Kommentar?: string;
  };
}
```

### 4.3 Validierungsgruppen (Vier-Augen-Prinzip)
```typescript
interface ValidationGroup {
  name: string;
  questions: string[];
  title: string;
  requiresMA2: boolean;
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
- **Keine Backend-Übertragung:** Alle Exporte werden ausschließlich clientseitig generiert und heruntergeladen.

## 7. Nicht im Umfang (Out of Scope)

- Keine SAP- oder Backend-Integration.
- Keine Benutzerverwaltung oder Authentifizierung.
- Keine elektronische Signatur nach 21 CFR Part 11 (nur Kürzel als Textfeld).
- Keine Mehrsprachigkeit (nur Deutsch).
- Keine Admin-UI zur Konfiguration des Fragekatalogs (Survey-Definition ist statisch als JSON).

## 8. Akzeptanzkriterien (Auszug)

- Der gesamte Produktionsprozess ist digital, lückenlos und nachvollziehbar dokumentierbar.
- Alle Pflichtfelder und Validierungen funktionieren wie spezifiziert.
- Die Anwendung ist auf Tablets intuitiv und performant bedienbar.
- Exportierte Dokumente (JSON, PDF) enthalten alle relevanten Daten und Audit-Trail.
- Das Vier-Augen-Prinzip ist an allen kritischen Stellen technisch und UI-seitig umgesetzt.
- Keine Daten werden an einen Server übertragen.

---

*Dieses PRD beschreibt die Anforderungen und Ziele für die technische Umsetzung der digitalen Produktionsprozess-Dokumentation. Es dient als Grundlage für die Implementierung und spätere Abnahme.* 