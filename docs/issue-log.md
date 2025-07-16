# Issue-Log

In dieser Datei werden erkannte Fehler, Inkonsistenzen oder UX-Probleme dokumentiert, die im Projektverlauf aufgefallen sind und zu einem späteren Zeitpunkt behoben werden sollen.

---

## Schablonen-Validierung erscheint bei GMP im Materialabschluss

**Beobachtung:**
- Bei Auswahl von GMP-Material erscheint auf der Seite „Materialbereitstellung – Abschluss“ fälschlicherweise eine Schablonen-Validierung (Vier-Augen-Prinzip für Zubehör Schablonen).
- Dies ist nur korrekt für GACP, nicht für GMP.

**Aktuelle Fehleranalyse:**
- Die Validierungsgruppe „zubehör_schablonen“ wird angezeigt, obwohl auf der Abschluss-Seite (bei GMP) keine Schablonen-Fragen enthalten oder sichtbar sind.
- Die Logik im Frontend ordnet Validierungsgruppen aktuell anhand der auf der Seite vorhandenen Fragen-IDs zu, prüft aber nicht, ob diese Fragen durch `visibleIf` tatsächlich sichtbar sind.
- Bei GMP sind die Schablonen-Fragen zwar im Survey-JSON, aber durch `visibleIf` unsichtbar. Die Validierungsgruppe wird trotzdem angezeigt.
- Das Backend liefert die Survey-Definition und Validierungsgruppen unverändert aus und ist nicht Ursache des Problems.
- **Vermutung:** Das Problem könnte mit der Seiten-ID zusammenhängen, da bei GACP auf Seite 8 die Schablonen-Seite angezeigt wird, während bei GMP auf Seite 8 bereits die Materialabschluss-Seite erscheint. Möglicherweise wird die Validierungsgruppe fälschlicherweise an die Seitenposition gekoppelt.

**Mögliche Lösungen:**
1. **Sichtbarkeitsprüfung ergänzen (empfohlen):**
   - Die Zuordnung der Validierungsgruppen im Frontend so anpassen, dass eine Gruppe nur angezeigt wird, wenn mindestens eine ihrer Fragen auf der Seite UND im aktuellen Survey-Modell sichtbar ist (`survey.isQuestionVisible('fragenname')`).
2. **Seiten im Survey-JSON trennen:**
   - Für GACP und GMP jeweils eigene Seiten anlegen, sodass die Schablonen-Fragen (und damit die Validierungsgruppe) nur bei GACP überhaupt auf der Seite sind.
3. **Validierungsgruppen dynamisch filtern:**
   - Die Validierungsgruppen beim Laden im Frontend anhand des Materialtyps filtern (z.B. „zubehör_schablonen“ nur bei GACP anzeigen).

---
