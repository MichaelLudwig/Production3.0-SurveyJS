# Production3.0-SurveyJS

Digitales Cannabis-Produktions-Dokumentationssystem basierend auf React und SurveyJS.

## Überblick

Diese Anwendung digitalisiert den papierbasierten Cannabis-Produktionsprozess (GACP zu GMP Übergang) für Reinraumpersonal mit einer tablet-optimierten Webanwendung. Das System führt Mitarbeiter durch einen strukturierten Fragenkatalog für die vollständige Dokumentation aller Produktionsschritte.

## Features

- **Hierarchischer Fragenkatalog** - Prozessschritte > Teilschritte > Fragen
- **Bedingte Logik** - Fragen erscheinen basierend auf Material-Typ (GACP/GMP) und vorherigen Antworten
- **Vier-Augen-Prinzip** - Doppelte Bestätigungsfelder für kritische Kontrollpunkte
- **Multi-Format Eingaben** - Checkboxen, Text, Zahlen, Datum/Zeit, Signaturen
- **Wiederholbare Abschnitte** - Dynamische Panels für Bulk-Beutel-Verarbeitung
- **Lokale Speicherung** - Fortschritt wird im Browser gespeichert
- **Export-Funktionalität** - JSON (strukturiert) und PDF (lesbar) Export
- **Tablet-optimiert** - Touch-freundliche Benutzeroberfläche

## Technologie-Stack

- **Frontend**: React 18 mit TypeScript
- **Build-Tool**: Vite
- **Survey-Framework**: SurveyJS
- **Styling**: CSS3 mit tablet-optimierten Breakpoints
- **Datenmanagement**: Lokaler Browser-Speicher (localStorage)

## Installieren und Starten

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Für Produktion bauen
npm run build

# Vorschau der Produktionsversion
npm run preview
```

## Projekt-Struktur

```
src/
├── components/
│   ├── App.tsx                    # Hauptkomponente
│   ├── ProductionOrderManager.tsx # Produktionsauftrags-Verwaltung
│   ├── SurveyComponent.tsx        # Haupt-Fragebogen-Komponente
│   └── CompletionScreen.tsx       # Abschluss-Bildschirm
├── data/
│   ├── sampleOrders.json         # Beispiel-Produktionsaufträge
│   └── surveyDefinition.json     # Fragebogen-Struktur
├── types/
│   └── index.ts                  # TypeScript-Typdefinitionen
├── utils/
│   └── exportUtils.ts            # Export-Funktionen (JSON/PDF)
├── styles/
│   └── tablet-optimized.css      # Tablet-optimierte Stile
└── main.tsx                      # Anwendungs-Einstiegspunkt
```

## Verwendung

1. **Produktionsauftrag auswählen oder erstellen**
   - Wählen Sie einen vorhandenen Auftrag oder erstellen Sie einen neuen
   - Geben Sie alle erforderlichen Auftragsdaten ein

2. **Fragebogen ausfüllen**
   - Arbeiten Sie sich seitenweise durch den Fragebogen
   - Ihr Fortschritt wird automatisch gespeichert
   - Bedingte Fragen erscheinen basierend auf Material-Typ und Antworten

3. **Prozess abschließen**
   - Exportieren Sie die Dokumentation als JSON oder PDF
   - Benachrichtigen Sie die Produktionsleitung
   - Starten Sie einen neuen Auftrag bei Bedarf

## Compliance

- **GxP-Anforderungen**: Vollständige Audit-Trail in exportierten Daten
- **Vier-Augen-Prinzip**: Doppelte Verifikation für kritische Schritte
- **Signatur-Erfassung**: Kürzel-Felder für Verantwortlichkeits-Nachweis
- **Zeitstempel**: Aufzeichnung für alle Prozessschritte

## Bekannte Limitationen (MVP)

- Keine SAP-Integration (nur statische Daten)
- Keine Backend/Datenbank-Persistierung
- Vereinfachte Signaturen (Textfelder, keine digitalen Signaturen)
- Keine Benutzer-Authentifizierung/Rollenverwaltung
- Keine Echtzeit-Benachrichtigungen
- Nur deutsche Sprache

## Entwicklung

```bash
# Linting
npm run lint

# TypeScript-Prüfung
npm run build
```

## Lizenz

Dieses Projekt ist proprietär und für den internen Gebrauch bestimmt.