import {
  app,
  BrowserWindow,
  clipboard,
  ipcMain,
  Menu,
  nativeImage,
  Tray,
} from "electron";
import path from "node:path";
import ClipboardService from "../src/components/Clipboards/clipboards.service.ts";
import { Clip } from "../src/components/Clipboards/clipboards.interface.ts";
import { CHANNEL } from "./channel.ts";

process.env.DIST = path.join(__dirname, "../dist");
process.env.PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

let win: BrowserWindow | null;
let tray: Tray;

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.PUBLIC, "icon.icns"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
    },
    width: 600,
    height: 900,
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, "index.html"));
  }
}

app.on("window-all-closed", () => {
  win = null;
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  })
  .then(() => {
    let previousClipboardText = clipboard.readText().trim();
    setInterval(() => {
      if (!win?.isFocused()) {
        const currentClipboardText = clipboard.readText().trim();
        if (
          currentClipboardText &&
          currentClipboardText !== previousClipboardText
        ) {
          const clip = ClipboardService.create(currentClipboardText);
          if (win) win.webContents.send(CHANNEL.CLIPBOARD_UPDATED, clip);
          clipboard.writeText(clip.content);
          previousClipboardText = currentClipboardText;
        }
      }
    }, 1000);
  })
  .then(() => {
    let menu: Menu;

    // Create tray icon in the top right corner of the screen
    const iconPath = path.join(process.env.PUBLIC, "tray_icon_16x16.png");
    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon);
    tray.setToolTip("Clippy");

    // Initialize Tray with stored clipboard from bear store. Run on app start.
    ipcMain.on(CHANNEL.TRAY_INITIALIZATION, (_event, clips: Clip[]) => {
      const menuItems = clips.map((clip) => {
        return {
          id: clip.id,
          label:
            clip.content.length >= 50
              ? clip.content.slice(0, 50).trim() + "..."
              : clip.content,
          click: () => {
            clipboard.writeText(clip.content.trim());
          },
        };
      });

      menu = Menu.buildFromTemplate(menuItems);
      tray.setContextMenu(menu);
    });
  });
