// LiLM - preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setCompactMode: (compact) => ipcRenderer.send('set-compact-mode', compact),
});
