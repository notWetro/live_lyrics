const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  toggleDisplay: () => ipcRenderer.invoke('toggle-display'),
  importSongs: () => ipcRenderer.invoke('import-songs'),
  showVerse: (verseText) => ipcRenderer.invoke('show-verse', verseText),
  openEditor: (songContent) => ipcRenderer.invoke('open-editor', songContent),
  getEditorContent: () => ipcRenderer.invoke('get-editor-content'),
  saveSong: (content) => ipcRenderer.invoke('save-song', content),
  closeEditor: () => ipcRenderer.invoke('close-editor'),
  onSongSaved: (callback) => ipcRenderer.on('song-saved', (event, filePath) => callback(filePath))
});
