// LiLM - preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setCompactMode: (compact) => ipcRenderer.send('set-compact-mode', compact),
  storageGetSync: (key) => ipcRenderer.sendSync('storage-get-sync', key),
  storageSet: (key, value) => ipcRenderer.send('storage-set', key, value),
  storageRemove: (key) => ipcRenderer.send('storage-remove', key),
});
