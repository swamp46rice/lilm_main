// LiLM - Electron main.js
const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
// useContentSize:true のため、以下はすべて「ページ内容の寸法」(ウィンドウ枠を含まない)。
// .window(860x660) + body padding 16px x 2 = 892x692
const WINDOW_NORMAL  = { width:892, height:692 };
const WINDOW_COMPACT = { width:400, height:120 };

function createWindow() {
  mainWindow = new BrowserWindow({
    width: WINDOW_NORMAL.width,
    height: WINDOW_NORMAL.height,
    useContentSize: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    title: 'LiLM',
    icon: path.join(__dirname, 'assets/icon.png'),
    backgroundColor: '#060810',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      backgroundThrottling: false, // 最小化中もtick(1秒間隔)を維持する
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
  mainWindow.setContentSize(width, height, true);
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
