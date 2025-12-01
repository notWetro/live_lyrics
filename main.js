const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;
let displayWindow;
let editorWindow;
let editorSongContent = null;

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
  
  // Create menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Song',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            openSongEditor();
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function openSongEditor(songContent = null) {
  if (editorWindow) {
    editorWindow.focus();
    return;
  }
  
  editorSongContent = songContent;
  
  editorWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });
  
  editorWindow.loadFile('editor.html');
  
  editorWindow.on('closed', () => {
    editorWindow = null;
    editorSongContent = null;
  });
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
      const lines = content.split('\n');
      
      if (lines.length === 0) continue;
      
      // Erste Zeile ist der Titel
      const title = lines[0].trim();
      
      // Finde den ersten "---" Separator
      const separatorIndex = lines.findIndex(line => line.trim() === '---');
      
      if (separatorIndex === -1) {
        console.error(`No separator found in ${filePath}`);
        continue;
      }
      
      // Zeilen 2 bis zum ersten "---" sind die Reihenfolge
      const slideOrder = lines.slice(1, separatorIndex)
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // Parse alle Folien nach dem ersten "---"
      const slidesContent = lines.slice(separatorIndex + 1).join('\n');
      const slideBlocks = slidesContent
        .split(/\n---\n/)
        .map(block => block.trim())
        .filter(block => block.length > 0);
      
      // Erstelle ein Map mit Foliennamen -> Folieninhalt
      const slidesMap = {};
      slideBlocks.forEach(block => {
        const blockLines = block.split('\n');
        if (blockLines.length > 0) {
          const slideName = blockLines[0].trim();
          const slideText = blockLines.slice(1).join('\n').trim();
          slidesMap[slideName] = slideText;
        }
      });
      
      // Erstelle die Verse-Liste in der richtigen Reihenfolge
      const verses = [];
      slideOrder.forEach(slideName => {
        if (slidesMap[slideName]) {
          verses.push({
            name: slideName,
            text: slidesMap[slideName]
          });
        } else {
          console.warn(`Slide "${slideName}" referenced but not found in ${filePath}`);
        }
      });
      
      if (verses.length > 0) {
        songs.push({
          title: title,
          verses: verses,
          filePath: filePath
        });
      }
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

ipcMain.handle('open-editor', (event, songContent) => {
  openSongEditor(songContent);
});

ipcMain.handle('get-editor-content', () => {
  return editorSongContent;
});

ipcMain.handle('save-song', async (event, content) => {
  const result = await dialog.showSaveDialog(editorWindow, {
    filters: [
      { name: 'Markdown Files', extensions: ['md'] }
    ],
    defaultPath: 'song.md'
  });
  
  if (!result.canceled) {
    await fs.writeFile(result.filePath, content, 'utf-8');
    
    // Notify main window to reload the song
    if (mainWindow) {
      mainWindow.webContents.send('song-saved', result.filePath);
    }
    
    if (editorWindow) {
      editorWindow.close();
    }
  }
});

ipcMain.handle('close-editor', () => {
  if (editorWindow) {
    editorWindow.close();
  }
});
