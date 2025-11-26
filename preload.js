const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  toggleDisplay: () => ipcRenderer.invoke('toggle-display'),
  importSongs: () => ipcRenderer.invoke('import-songs'),
  showVerse: (verseText) => ipcRenderer.invoke('show-verse', verseText)
});
