# Lyrics Display

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

## Lizenz

ISC
