// LiLM - Electron main.js
const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
// useContentSize:true のため、以下はすべて「ページ内容の寸法」(ウィンドウ枠を含まない)。
// .window(860x660) + body padding 16px x 2 = 892x692
const WINDOW_NORMAL  = { width:892, height:692 };
const WINDOW_COMPACT = { width:400, height:120 };

/* ===== セーブデータのファイル永続化 =====
 * これまでlocalStorageのみに保存していたが、Electron版ではブラウザプロファイル削除や
 * 再インストールでセーブが消失するリスクがあるため、userDataフォルダ内のJSONファイルに
 * 永続化する。localStorageの複数キー(ib_v9, ib_v9_opening_done 等)を1つのオブジェクトに
 * まとめて保存する。書き込みは一時ファイル→リネームの2段階にし、書き込み中のクラッシュで
 * セーブファイルが壊れることを防ぐ(アトミック書き込み)。 */
const SAVE_FILE = path.join(app.getPath('userData'), 'savedata.json');
let _storeCache = null;

function loadStore(){
  if(_storeCache) return _storeCache;
  try{
    const raw = fs.readFileSync(SAVE_FILE, 'utf8');
    _storeCache = JSON.parse(raw);
  }catch(e){
    _storeCache = {};
  }
  return _storeCache;
}

function persistStore(){
  try{
    const tmpFile = SAVE_FILE + '.tmp';
    fs.writeFileSync(tmpFile, JSON.stringify(_storeCache), 'utf8');
    fs.renameSync(tmpFile, SAVE_FILE);
  }catch(e){
    console.error('セーブファイルの書き込みに失敗した:', e);
  }
}

ipcMain.on('storage-get-sync', (event, key) => {
  const store = loadStore();
  event.returnValue = Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
});
ipcMain.on('storage-set', (event, key, value) => {
  const store = loadStore();
  store[key] = value;
  persistStore();
});
ipcMain.on('storage-remove', (event, key) => {
  const store = loadStore();
  delete store[key];
  persistStore();
});

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
