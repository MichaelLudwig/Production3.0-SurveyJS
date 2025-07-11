# Phase 2 - Vollständige Anforderungserfüllung

**Status:** 🔄 **PLANUNG** - Analyse der noch fehlenden Anforderungen  
**Erstellt:** 2025-01-09  
**Ziel:** 100% Erfüllung aller funktionalen Anforderungen aus dem PRD

## 📋 Analysierte Anforderungen vs. Aktueller Status

Nach detaillierter Prüfung der Anforderungen gegen unsere aktuelle Implementierung wurden folgende **Lücken** identifiziert:

## 🔍 **IST-ZUSTAND ANALYSE**

### ✅ **BEREITS VOLLSTÄNDIG ERFÜLLT:**
- Produktionsauftrags-Auswahl (CRUD-Funktionalität)
- Instanziierung des Fragenkatalogs 
- Seitenweise Führung durch Fragenkatalog
- Fragentypen: Ja/Nein, Datum/Zeit, Freitext, Listen
- Bedingte Sichtbarkeit (GACP vs GMP)
- Speichern und Laden des Formulars
- Tablet-optimierte Benutzerfreundlichkeit
- Deutsche Lokalisierung

### ❌ **FEHLENDE/UNVOLLSTÄNDIGE ANFORDERUNGEN:**

## 🎯 **PHASE 2 IMPLEMENTIERUNGSPLAN**

---

## **1. FRAGENTYPEN & EINGABEFORMATE** [offen]

### 1.1 Matrix/Soll-Ist-Vergleiche [offen]
- **Problem:** Soll/Ist-Vergleiche nur als separate Felder, nicht als zusammenhängende Matrix
- **PRD-Anforderung:** *"Für Produktbezeichnung, Artikelnummer, Chargenbezeichnung, Anzahl Gebinde etc. sind Soll-Vorgaben aus dem Auftrag gegeben und der Mitarbeiter trägt die Ist-Angaben der bereitgestellten Materialien ein. Anschließend muss er (und teilweise eine zweite Person) bestätigen, ob Soll und Ist übereinstimmen."*
- **Technische Umsetzung:** Gruppierte Darstellung von Soll-Werten (read-only aus Produktionsauftrag), Ist-Eingaben (editierbar) und Übereinstimmungsbestätigung (Checkbox)
- **Schritte:**
  - [ ] 1.1.1 SurveyJS Matrix-Question-Type oder Panel-Gruppen evaluieren
  - [ ] 1.1.2 Soll/Ist/Bestätigung-Matrix für Materialbereitstellung implementieren
  - [ ] 1.1.3 Responsive Matrix-Darstellung für Tablets optimieren
  - [ ] 1.1.4 Matrix-Validierung: Alle Ist-Felder und Bestätigungen erforderlich

### 1.2 Mehrpersonen-Bestätigung (Vier-Augen-Prinzip) [offen]
- **Problem:** Nicht explizit als separate MA1/MA2-Felder implementiert
- **PRD-Anforderung:** *"Einige kritische Checks erfordern Eingaben/Bestätigungen durch zwei verschiedene Personen (Vier-Augen-Prinzip). In der Praxis wird dies im Formular so abgebildet, dass z.B. zwei Ja/Nein-Felder oder zwei Unterschriftsfelder vorhanden sind – jeweils für Person 1 und Person 2."*
- **MLU-Konzept:** Eine komplette Fragengruppe wird von einem Mitarbeiter ausgefüllt und darunter bestätigt der zweite Mitarbeiter durch sein Kürzel die Richtigkeit der beantworteten Fragengruppe darüber. Im Ergebnis-JSON wird gespeichert, dass MA2 jede einzelne Frage geprüft hat (mit seinem Kürzel und Timestamp).
- **Schritte:**
  - [ ] 1.2.1 Identifikation aller Vier-Augen-Stellen im Fragenkatalog (z.B. Materialbereitstellung, Probenzug)
  - [ ] 1.2.2 Fragengruppen-Konzept implementieren: MA1 füllt aus, MA2 bestätigt ganze Gruppe
  - [ ] 1.2.3 MA2-Bestätigungsfeld: Kürzel-Eingabe + Kommentarfeld (falls nötig)
  - [ ] 1.2.4 JSON-Update-Logik: Bei MA2-Bestätigung alle vorherigen Fragen der Gruppe mit MA2-Kürzel und Timestamp erweitern
  - [ ] 1.2.5 Visuelle Trennung: MA1-Bereich und MA2-Bestätigungsbereich klar getrennt
  - [ ] 1.2.6 Validierung: MA2-Bestätigung erforderlich für kritische Fragengruppen

---

## **2. VALIDIERUNG UND VOLLSTÄNDIGKEIT** [offen]

### 2.1 Bedingte Validierung [offen]
- **Problem:** Keine Verknüpfung zwischen "Nein"-Antworten und erforderlichen Bemerkungsfeldern
- **PRD-Anforderung:** *"Wo sinnvoll, können Plausibilitätsprüfungen eingebaut werden. Z.B. wenn eine Frage 'Übereinstimmung Soll/Ist?' mit Nein beantwortet wird, könnte es erforderlich sein, im Bemerkungsfeld eine Erklärung einzutragen."*
- **MLU-Präzisierung:** Alle Felder sind Pflichtfelder außer Kommentarfeldern. Kommentarfelder werden nur Pflichtfeld wenn in den zugehörigen Fragen etwas mit "Nein" beantwortet wurde.
- **Schritte:**
  - [ ] 2.1.1 Alle "Nein"-Antworten identifizieren, die Erläuterungen erfordern
  - [ ] 2.1.2 SurveyJS "requiredIf" Bedingungen für Kommentarfelder setzen
  - [ ] 2.1.3 Benutzerführung: Kommentarfeld wird sichtbar/erforderlich bei "Nein"-Antwort
  - [ ] 2.1.4 Validierung testen für alle Nein-Kommentar-Verknüpfungen

---

## **3. ADMINISTRATIONSFUNKTIONEN** [teilweise]

### 3.1 Admin-Benutzeroberfläche [offen]
- **Problem:** Keine separate Admin-Maske vorhanden
- **PRD-Anforderung:** *"Neben der reinen Datenerfassung durch die Mitarbeiter im Reinraum benötigt die App eine Administrationsmaske für ausgewählte Benutzer (z.B. Produktionsleitung oder IT/Admin)"*
- **MLU-Vereinfachung:** Keine Rollenunterscheidung im MVP. Einfache Admin-Seite für Produktionsaufträge-Einsicht und -Bearbeitung.
- **Schritte:**
  - [ ] 3.1.1 Admin-Route `/admin` erstellen
  - [ ] 3.1.2 Admin-Komponente mit Navigation zu bestehenden Produktionsaufträgen
  - [ ] 3.1.3 Link zwischen Haupt-App und Admin-Bereich

### 3.2 Überblick Erfassungsstatus [offen]
- **Problem:** Keine Statusübersicht implementiert
- **PRD-Anforderung:** *"Die Admin-Maske kann eine Übersicht bieten, welche Produktionsaufträge bereits ein ausgefülltes Protokoll haben, welche in Bearbeitung sind und welche noch offen sind."*
- **MLU-Vereinfachung:** In Admin- und Mitarbeiter-Übersicht ein Label, dass zu einem Produktionsauftrag bereits ein Fragekatalog angefangen wurde. Möglichkeit zum aktuellen Stand der Fragekatalog-Instanz hinzuspringen und weiter zu machen.
- **Schritte:**
  - [ ] 3.2.1 Status-Tracking erweitern: "neu", "in Bearbeitung", "abgeschlossen"
  - [ ] 3.2.2 Status-Label in Produktionsauftrags-Karten anzeigen
  - [ ] 3.2.3 "Fortsetzen"-Button für "in Bearbeitung" Aufträge
  - [ ] 3.2.4 Status automatisch setzen: beim Survey-Start, bei Zwischenspeicherung, bei Completion

---

## **4. BENUTZERFREUNDLICHKEIT & UX** [teilweise]

### 4.1 Fortschrittsanzeige [offen]
- **Problem:** Kein visueller Fortschrittsbalken implementiert
- **PRD-Anforderung:** *"Optional kann ein Fortschrittsbalken oder eine Seitenanzeige integriert sein, um den Fortschritt im Protokoll anzuzeigen."*
- **Schritte:**
  - [ ] 4.1.1 SurveyJS Fortschrittsbalken aktivieren
  - [ ] 4.1.2 Seitenzähler implementieren ("Seite X von Y")
  - [ ] 4.1.3 Prozessschritt-Übersicht mit aktueller Position

### 4.2 Inline-Hilfen [offen]
- **Problem:** Keine Hilfetexte oder Erklärungen
- **PRD-Anforderung:** *"Trotz des komplexen Inhalts sollte die Darstellung übersichtlich sein (z.B. klare Abgrenzung der Prozessschritte, evtl. optische Trennung oder Überschriften pro Abschnitt)."*
- **MLU-Präzisierung:** Keine Tooltips. Alle relevanten Informationen müssen immer angezeigt werden, keine unnötigen weiteren Klicks für das Reinraum-Personal.
- **Schritte:**
  - [ ] 4.2.1 Hilfe-Texte direkt in Fragentexte integrieren
  - [ ] 4.2.2 Kontextuelle Informationen als sichtbare Beschreibungen
  - [ ] 4.2.3 Inline-Hilfen für kritische Felder (immer sichtbar)

---

## **5. AUDIT & COMPLIANCE** [teilweise]

### 5.1 Grundlegendes Audit-Trail [offen]
- **Problem:** Basis-Timestamping vorhanden, aber kein vollständiges Audit-Log
- **PRD-Anforderung:** *"Vollständige Audit-Trail in exportierten Daten, Vier-Augen-Prinzip für kritische Schritte, Zeitstempel für alle Prozessschritte"*
- **MLU-Spezifikation:** Erfassung des MA-Kürzels + Timestamp bei Beantwortung einer Frage sowie zusätzlich die Erfassung der Prüfung des zweiten Mitarbeiters mit Kürzel und Timestamp. Der zweite Mitarbeiter erfasst erst nach der Beantwortung einer ganzen Fragengruppe seine Überprüfung. Alle dazugehörigen vorherigen Fragen werden dann mit seinem zusätzlichen Kürzel und Timestamp aktualisiert.
- **Schritte:**
  - [ ] 5.1.1 Erweiterte Antwort-Datenstruktur: `{value, ma1Kuerzel, ma1Timestamp, ma2Kuerzel?, ma2Timestamp?, ma2Kommentar?}`
  - [ ] 5.1.2 Automatische MA1-Erfassung bei jeder Antwort-Eingabe
  - [ ] 5.1.3 MA2-Gruppen-Bestätigung: Rückwirkende Aktualisierung aller Gruppen-Fragen
  - [ ] 5.1.4 Audit-Trail im JSON-Export vollständig abbilden

---

## **📊 PRIORISIERTE AUFGABEN FÜR MVP**

### **HOHE PRIORITÄT (MVP-kritisch):**
1. **Mehrpersonen-Bestätigung (1.2)** - GxP-kritisch, Kernfunktionalität
2. **Bedingte Validierung (2.1)** - Compliance-kritisch
3. **Matrix/Soll-Ist-Vergleiche (1.1)** - Kernfunktionalität
4. **Audit-Trail (5.1)** - Compliance-kritisch

### **MITTLERE PRIORITÄT (Funktional wichtig):**
5. **Admin-Interface (3.1)** - Operationale Notwendigkeit
6. **Statusübersicht (3.2)** - Management-Bedarf
7. **Fortschrittsanzeige (4.1)** - Benutzerfreundlichkeit

### **NIEDRIGE PRIORITÄT (Nice-to-have):**
8. **Inline-Hilfen (4.2)** - UX-Verbesserung

---

## **🎯 IMPLEMENTIERUNGS-REIHENFOLGE**

### **Sprint 1 (Woche 1-2): Compliance-kritische Features**
- [ ] 1.2 Mehrpersonen-Bestätigung implementieren
- [ ] 2.1 Bedingte Validierung implementieren
- [ ] 5.1 Basis-Audit-Trail implementieren

### **Sprint 2 (Woche 3-4): Kern-Funktionalität**
- [ ] 1.1 Matrix/Soll-Ist-Vergleiche implementieren
- [ ] 4.1 Fortschrittsanzeige implementieren

### **Sprint 3 (Woche 5-6): Admin-Funktionen**
- [ ] 3.1 Admin-Interface erstellen
- [ ] 3.2 Statusübersicht implementieren

### **Sprint 4 (Woche 7): Feinschliff**
- [ ] 4.2 Inline-Hilfen implementieren
- [ ] Vollständige Tests aller neuen Features

---

## **📈 ERFOLGSMESSUNG**

### **Abnahmekriterien:**
- ✅ **Vier-Augen-Prinzip vollständig implementiert**
- ✅ **Alle kritischen Validierungen funktional**
- ✅ **Matrix-Darstellungen für Soll/Ist-Vergleiche**
- ✅ **Admin-Interface für Produktionsleitung**
- ✅ **Vollständiges Audit-Trail in Exporten**

### **Definition of Done pro Feature:**
- [ ] Implementierung abgeschlossen
- [ ] Manual Testing mit realen Szenarien durchgeführt
- [ ] Tablet-Optimierung validiert
- [ ] JSON-Export mit korrekten Audit-Daten

---

## **🚀 NÄCHSTE SCHRITTE**

1. **Sprint 1 starten:** Vier-Augen-Prinzip als erstes kritisches Feature
2. **Technische Vorbereitung:** SurveyJS Matrix/Panel Features evaluieren
3. **Datenmodell erweitern:** Audit-Trail-Struktur definieren
4. **Test-Szenarien:** Kritische Workflows für Manual Testing definieren

---

**Status:** 📋 **BEREIT FÜR UMSETZUNG**  
**Geschätzter Aufwand:** 4-5 Wochen (bei Vollzeit-Entwicklung)  
**Fokus:** MVP-kritische Features mit GxP-Compliance

Diese Planung stellt sicher, dass **alle MVP-relevanten funktionalen Anforderungen aus dem PRD vollständig erfüllt** werden.