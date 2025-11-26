const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;
let displayWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();
}

function toggleDisplayWindow() {
  if (displayWindow) {
    displayWindow.close();
    displayWindow = null;
    return false;
  } else {
    const { screen } = require('electron');
    const displays = screen.getAllDisplays();
    
    // Verwende zweiten Bildschirm falls vorhanden, sonst ersten
    const externalDisplay = displays.length > 1 ? displays[1] : displays[0];
    
    displayWindow = new BrowserWindow({
      x: externalDisplay.bounds.x,
      y: externalDisplay.bounds.y,
      width: externalDisplay.bounds.width,
      height: externalDisplay.bounds.height,
      fullscreen: true,
      frame: false,
      backgroundColor: '#000000',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    displayWindow.loadFile('display.html');

    displayWindow.on('closed', () => {
      displayWindow = null;
    });
    
    return true;
  }
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handler für Toggle
const { ipcMain, dialog } = require('electron');
const fs = require('fs').promises;

ipcMain.handle('toggle-display', () => {
  return toggleDisplayWindow();
});

ipcMain.handle('import-songs', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown'] }
    ]
  });

  if (result.canceled) {
    return [];
  }

  const songs = [];
  
  for (const filePath of result.filePaths) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileName = filePath.split('/').pop().replace(/\.(md|markdown)$/i, '');
      
      // Teile Content in Verse auf (getrennt durch ---)
      const verses = content
        .split(/\n---\n/)
        .map(verse => verse.trim())
        .filter(verse => verse.length > 0);
      
      songs.push({
        title: fileName,
        verses: verses,
        filePath: filePath
      });
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
    }
  }
  
  return songs;
});

ipcMain.handle('show-verse', (event, verseText) => {
  if (displayWindow) {
    displayWindow.webContents.send('update-verse', verseText);
  }
});
