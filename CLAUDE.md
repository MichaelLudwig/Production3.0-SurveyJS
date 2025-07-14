# CLAUDE.md

Diese Datei dient als Leitfaden für Claude Code (claude.ai/code) bei der Arbeit mit dem Code in diesem Repository.

## Projektüberblick

Dies ist ein digitales Dokumentationssystem für den Cannabis-Produktionsprozess, entwickelt als React SPA mit SurveyJS-Integration. Das System digitalisiert den papierbasierten Produktionsprozess (GACP- zu GMP-Übergang) für Reinraumpersonal mittels einer tablet-optimierten Webanwendung.

## Architektur

### Frontend-Stack
- **React SPA** – Hauptframework der Anwendung
- **SurveyJS** – Kern-Framework für den Fragekatalog
- **Tablet-optimierte UI** – Responsives Design für Touch-Bedienung
- **Nur Client-seitig** – Keine Backend-Anbindung, gesamte Verarbeitung im Browser

### Komponentenstruktur
- `App.tsx` – Hauptkomponente, Routing
- `ProductionOrderManager.tsx` – Produktionsaufträge anlegen/auswählen
- `SurveyComponent.tsx` – Hauptfragebogen mit SurveyJS
- `CompletionScreen.tsx` – Abschluss und Export
- `MA2Validation.tsx` – Validierung (Vier-Augen-Prinzip, Leitungssignatur)
- Weitere Komponenten für Navigation, Layout, etc.

### Datenfluss
1. Auswahl/Anlage eines Produktionsauftrags (JSON-basiert)
2. Initialisierung des Fragebogens mit Auftragsdaten
3. Schrittweises Ausfüllen, Zwischenspeicherung im Local Storage
4. Export als JSON/PDF (nur clientseitig)

## Kernfunktionen

### Abdeckung des Produktionsprozesses
- **Hierarchischer Fragebogen** – Prozessschritte > Teilschritte > Fragen
- **Bedingte Logik** – Fragen erscheinen je nach Materialtyp (GACP/GMP) und Vorantworten
- **Vier-Augen-Prinzip** – Doppelte Bestätigung an kritischen Kontrollpunkten
- **Verschiedene Fragetypen** – Checkboxen, Text, Zahl, Datum/Uhrzeit, Signatur
- **Wiederholbare Abschnitte** – Dynamische Panels für Bulkbeutel

### Materialtyp-Logik
- **GACP-Material** – Zusätzliche Qualitätskontrollfragen (IPK, Sortierung, etc.)
- **GMP-Material** – Schlankerer Prozess, überspringt GACP-spezifische Abschnitte
- Gesteuert über `visibleIf`-Bedingungen im SurveyJS-JSON

### Datenpersistenz
- **Local Storage** – Fortschritt wird im Browser gespeichert
- **Kein Backend** – Alle Daten verbleiben clientseitig
- **Exportformate** – JSON (strukturiert) und PDF (menschenlesbar)

## Dateistruktur (aktuell)

```
/src
  /components
    App.tsx
    ProductionOrderManager.tsx
    SurveyComponent.tsx
    CompletionScreen.tsx
    MA2Validation.tsx
    ...
  /data
    surveyDefinition.json
    sampleOrders.json
    validationGroups.json
    ...
  /styles
    tablet-optimized.css
    ...
  /utils
    exportUtils.ts
  /types
    index.ts
main.tsx
index.html
package.json
```

## Entwicklungsbefehle

```bash
# Projektinitialisierung
npm install

# Entwicklung
npm run dev                # Entwicklungsserver starten
npm run build              # Für Produktion bauen
npm test                   # Tests ausführen
npm run lint               # Linting
```

## SurveyJS-Integration

### Struktur der Survey-Definition
- **Seiten (pages)** – Jede Seite repräsentiert meist einen Teilschritt
- **Panels** – Gruppieren verwandte Fragen oder wiederholbare Abschnitte
- **Elemente** – Einzelne Fragen mit verschiedenen Eingabetypen
- **Bedingte Logik** – `visibleIf`-Bedingungen je nach Materialtyp und Vorantworten

### Wichtige SurveyJS-Features
- Dynamische Panels für Bulkbeutel
- Bedingte Sichtbarkeit für GACP/GMP-Materialtypen
- Eigene Validierungen für Pflichtfelder
- Verschiedene Fragetypen (Boolean, Text, Zahl, Datum)

## Entwicklungsrichtlinien

### Materialtyp-Handling
- `{materialType} == 'GACP'` für GACP-spezifische Fragen
- GMP-Material überspringt Sortierung, IPK, zusätzliche Qualitätsprüfungen
- Umsetzung über `visibleIf` in SurveyJS-Elementen

### Tablet-Optimierung
- Mindestens 44px große Touch-Ziele
- Große Schrift (mind. 16px)
- Ausreichend Abstand für Touch-Bedienung
- Scrollen bei Tastatureingabe berücksichtigen

### Datenvalidierung
- Kritische Fragen als `isRequired: true` markieren
- Zahlenfelder mit sinnvollen Bereichen
- Datums-/Zeitformat validieren
- Doppelte Bestätigungsfelder für kritische Kontrollpunkte

### Export-Anforderungen
- PDF enthält alle beantworteten Fragen, klar formatiert
- JSON-Export für strukturierte Weiterverarbeitung
- Nur clientseitige Generierung (keine Serveraufrufe)
- Dateinamen-Format: `Protokoll_{orderNumber}_{date}.{extension}`

## Teststrategie

### Kritische Testbereiche
- Survey-Logik mit verschiedenen Materialtypen (GACP vs GMP)
- Bedingte Anzeige/Verbergen von Fragen
- Bulkbeutel-Prozesse mit mehreren Durchläufen
- Exportfunktion (PDF/JSON)
- Tablet-Responsivität und Touch-Bedienung
- Persistenz im Local Storage

### Testdaten
- Beispiel-Produktionsaufträge mit GACP- und GMP-Material
- Verschiedene Bulkbeutel-Anzahlen für dynamische Abschnitte
- Edge Cases für bedingte Logik

## Compliance-Anforderungen

- Audit-Trail (Kürzel, Zeitstempel) und Validierungsgruppen-Validierung (MA2, Leitungssignatur) werden **pro Fragengruppe** (nicht pro Frage) erfasst. Details siehe [prd.md](./docs/prd.md) und [sap-integration.md](./docs/sap-integration.md).

## Validierungsgruppen & Audit-Trail

- Validierungsgruppen bündeln alle Prozessabschnitte, die eine besondere Bestätigung benötigen – z. B. durch einen zweiten Mitarbeiter (MA2, Vier-Augen-Prinzip) oder durch die Herstellungsleitung (Signatur).
- Jede Validierungsgruppe ist im Fragekatalog als solche gekennzeichnet (siehe [validationGroups.json](./src/data/validationGroups.json)), mit Attributen wie `requiresMA2: true` oder `validationType: "signature"`.
- Die React-Komponente [`MA2Validation`](./src/components/MA2Validation.tsx) behandelt **alle Validierungsgruppen** einheitlich: Sie fordert – je nach Gruppe – die Eingabe des Kürzels und ggf. eines Kommentars von MA2 oder der Leitung.
- Für jede Validierungsgruppe werden Kürzel, Zeitstempel und ggf. Kommentar der validierenden Person erfasst und im Export (JSON/PDF) dokumentiert (Audit-Trail).
- Die Validierungsgruppen-Logik ist flexibel: Sie kann sowohl reine MA2-Prüfungen, reine Leitungssignaturen als auch Kombinationen abbilden.
- **Es gibt keine getrennten Mechanismen für MA2 und Leitungssignatur – alles wird über das Validierungsgruppen-Konzept abgebildet.**

## Bekannte Einschränkungen (MVP)

- Keine SAP-Integration (nur statische Daten)
- Keine Backend-/Datenbankpersistenz
- Vereinfachte Signaturen (Textfelder, keine digitalen Signaturen)
- Keine Benutzerverwaltung/Rollen
- Keine Echtzeit-Benachrichtigungen an Produktionsleitung
- Nur Deutsch

## Zukünftige Erweiterungen (außerhalb MVP)

- **SAP-Integration:** Geplante Anbindung über lokale Serverkomponente, die Produktionsaufträge, Materiallisten und Fragekataloge aus SAP synchronisiert und ausgefüllte Instanzen zurücküberträgt. Details siehe [sap-integration.md](./docs/sap-integration.md).
- Datenbankpersistenz und Benutzerverwaltung
- Digitale Signatur-Konformität (21 CFR Part 11)
- Echtzeit-Benachrichtigungen und Workflow-Integration
- Mehrsprachigkeit
- Erweiterte Datenvalidierung und Berechnungen