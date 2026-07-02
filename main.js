// LiLM - Electron main.js
const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
const WINDOW_NORMAL  = { width:1080, height:720 };
const WINDOW_COMPACT = { width:400,  height:120 };

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    title: 'LiLM',
    icon: path.join(__dirname, 'assets/icon.png'),
    backgroundColor: '#060810',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => { mainWindow = null; });
}

// 縮小/通常モードのウィンドウサイズ切り替え
ipcMain.on('set-compact-mode', (event, compact) => {
  if(!mainWindow) return;
  const { width, height } = compact ? WINDOW_COMPACT : WINDOW_NORMAL;
  mainWindow.setMinimumSize(compact ? 100 : 900, compact ? 80 : 600);
  mainWindow.setSize(width, height, true);
  mainWindow.setResizable(!compact);
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
