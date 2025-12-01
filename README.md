# Live Lyrics

Eine Electron-App zur Anzeige von Songtexten auf einem zweiten Bildschirm, ähnlich wie SongBeamer oder ProPresenter.

## Features

- 📁 Import von Markdown-Dateien mit Songtexten
- 🖥️ Automatische Erkennung und Nutzung des zweiten Bildschirms
- 🎵 Verse-Navigation mit Klick
- ✨ Modernes, übersichtliches UI
- 🎨 Schönes Gradient-Design

## Installation

```bash
npm install
```

## Entwicklung

```bash
npm start
```

## Markdown-Format für Songs

```markdown
Titel des Songs
Erste Zeile des ersten Verses
Zweite Zeile des ersten Verses

---

Erste Zeile des zweiten Verses
Zweite Zeile des zweiten Verses

---

...
```

Die einzelnen Verse werden durch `---` getrennt.

## Build

### Für Mac:
```bash
npm run build:mac
```

Erstellt eine `.dmg` Datei im `dist/` Ordner.

### Für Windows:
```bash
npm run build:win
```

Erstellt einen Installer und portable Version im `dist/` Ordner.

### Für beide Plattformen:
```bash
npm run build:all
```

## Benutzung

1. Starte die App
2. Klicke auf "Songs importieren" und wähle deine Markdown-Dateien
3. Klicke auf "Display einschalten" um den zweiten Bildschirm zu aktivieren
4. Wähle einen Song aus der Liste
5. Klicke auf die einzelnen Verse um sie anzuzeigen

## Programmstruktur

   📦 Haupt-Dateien

   main.js - Backend / Hauptprozess

     - Electron Hauptprozess - Verwaltet App-Fenster und System
     - Erstellt zwei Fenster: Control Panel (mainWindow) + Display (displayWindow)
     - Toggle-Funktion: Schaltet Display-Fenster ein/aus, nutzt zweiten Bildschirm falls vorhanden
     - Import-Handler: Öffnet Dateidialog, liest Markdown-Dateien, parst Songs (Verse getrennt durch ---)
     - IPC-Handler: Empfängt Befehle von Renderer-Prozess (toggle-display, import-songs, show-verse)

   preload.js - Sicherheitsbrücke

     - Context Bridge: Sichere Kommunikation zwischen Frontend und Backend
     - Exponiert nur 3 Funktionen ans Frontend: toggleDisplay(), importSongs(), showVerse()
     - Verhindert direkten Node.js-Zugriff aus Sicherheitsgründen

   renderer.js - Frontend-Logik (Control Panel)

     - UI-Steuerung für index.html
     - Verwaltet Song-Liste und Verse im Speicher (songs[])
     - Event-Listener für Buttons (Import, Toggle, Song-/Vers-Klicks)
     - Rendering: Generiert dynamisch HTML für Song-Liste und Verse
     - Sendet gewählten Vers ans Display-Fenster

   🎨 HTML-Dateien

   index.html + styles.css - Control Panel UI

     - Sidebar mit Song-Liste
     - Hauptbereich mit Versen des gewählten Songs
     - Buttons zum Importieren und Display-Toggle

   display.html - Präsentations-Display

     - Schwarzer Vollbild-Hintergrund
     - Große zentrierte Textanzeige für Songtexte
     - Empfängt Updates via ipcRenderer.on('update-verse')

   🔄 Datenfluss

     Benutzer klickt "Import" 
       → renderer.js ruft electronAPI.importSongs()
       → preload.js leitet zu main.js
       → main.js öffnet Dateidialog, parst .md-Dateien
       → Daten zurück zu renderer.js
       → renderer.js zeigt Songs in UI
     
     Benutzer klickt Vers
       → renderer.js ruft showVerse(text)
       → main.js sendet zu display.html
       → display.html zeigt Text auf zweitem Bildschirm

## Lizenz

ISC
