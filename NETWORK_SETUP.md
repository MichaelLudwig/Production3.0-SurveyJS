# Netzwerk-Setup für WSL2 + Windows

## Problem
Der Vite-Entwicklungsserver läuft in WSL2, ist aber von Windows aus nicht erreichbar.

## Lösungen

### Option 1: Direkte IP-Adresse verwenden
**Versuche diese URLs in deinem Windows-Browser:**
- http://172.26.71.79:4173/ (Preview-Server - gebaute Version)
- http://172.26.71.79:5173/ (Dev-Server)

### Option 2: WSL-Port-Weiterleitung einrichten
Führe diese Befehle in einer **Windows PowerShell (als Administrator)** aus:

```powershell
# Port-Weiterleitung für Dev-Server
netsh interface portproxy add v4tov4 listenport=5173 listenaddress=0.0.0.0 connectport=5173 connectaddress=172.26.71.79

# Port-Weiterleitung für Preview-Server  
netsh interface portproxy add v4tov4 listenport=4173 listenaddress=0.0.0.0 connectport=4173 connectaddress=172.26.71.79

# Firewall-Regeln hinzufügen
netsh advfirewall firewall add rule name="WSL Vite Dev" dir=in action=allow protocol=TCP localport=5173
netsh advfirewall firewall add rule name="WSL Vite Preview" dir=in action=allow protocol=TCP localport=4173
```

### Option 3: Direkt aus dem dist-Ordner servieren
Die gebaute Anwendung liegt in: 
`/mnt/c/Users/micha/OneDrive - Cansativa GmbH/Dokumente - Technology_Department/02 Projekte/Production3.0-SurveyJS/dist/`

Du kannst diese Dateien direkt in einen Windows-Webserver (z.B. IIS, Apache) kopieren.

## Aktueller Status
- ✅ **App funktioniert:** Build erfolgreich (3.4s)
- ✅ **SurveyJS korrekt:** 317KB CSS geladen
- ✅ **Server läuft:** Preview auf Port 4173, Dev auf Port 5173
- ❌ **Netzwerk-Problem:** WSL2 → Windows Verbindung blockiert

## Empfehlung
**Versuche zuerst:** http://172.26.71.79:4173/
Das ist die gebaute, produktionsreife Version der Anwendung.