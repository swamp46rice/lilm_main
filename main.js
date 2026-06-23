// LiLM - Electron main.js
const { app, BrowserWindow, shell, session } = require('electron');
const path = require('path');

let mainWindow;

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
    }
  });

  // Electron向けCSP（インラインイベントハンドラを許可）
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; media-src 'self'; connect-src 'none';"
        ]
      }
    });
  });

  mainWindow.loadFile('index.html');

  // 外部リンクはデフォルトブラウザで開く
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' }; // Electron内では開かない
  });

  // 開発時のみDevToolsを開く
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
