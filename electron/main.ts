import {app, BrowserWindow, clipboard } from 'electron'
import path from 'node:path'
import installExtension, {REACT_DEVELOPER_TOOLS} from 'electron-devtools-installer';
import {clipsService} from "../src/services/clips.service.ts";

process.env.DIST = path.join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
    },
    width: 1000,
    height: 900,
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }

  let previousClipboardText = clipboard.readText();

  setInterval(() => {
    const currentClipboardText = clipboard.readText();
    if (currentClipboardText !== previousClipboardText) {
      const clip = clipsService.create(currentClipboardText);
      if(win) win.webContents.send('clipboard-updated', clip);
      previousClipboardText = currentClipboardText;
    }
  }, 1000);
}

app.on('window-all-closed', () => {
  win = null;
})

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
}).then(() => {
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
})