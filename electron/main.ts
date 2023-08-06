import { app, BrowserWindow, clipboard, ipcMain, Menu, MenuItem, nativeImage, Tray } from "electron";
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
    width: 0,
    height: 0,
    titleBarStyle: "hidden",
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
          win?.webContents.send(CHANNEL.CLIPBOARD_UPDATED, clip);
          clipboard.writeText(clip.content);
          previousClipboardText = currentClipboardText;
        }
      }
    }, 1000);
  })
  .then(() => {
    let menu: Menu;

    // Create tray icon in the top right corner of the screen
    const iconPath = path.join(process.env.PUBLIC, "tray.png");
    const icon = nativeImage.createFromPath(iconPath);

    tray = new Tray(icon.resize({
      width: 16,
      height: 16
    }));

    tray.setToolTip("Clippy");

    // Create default menu items
    const hint1 = new MenuItem({
      label: "Select the clip you would like to copy",
      enabled: false,
    });
    const hint2 = new MenuItem({
      label: "Your clippings will appear here...",
      enabled: false,
    });
    const quit = new MenuItem({
      label: "Quit",
      click: app.quit,
      accelerator: "CommandOrControl+Q",
    });
    const separator = new MenuItem({
      type: "separator",
    });
    const clear = new MenuItem({
      label: "Clear",
      accelerator: "CommandOrControl+R",
      click: () => win?.webContents.send(CHANNEL.CLIPBOARD_CLEARED),
    });

    let preferences: MenuItem;

    const syncPreferences = (maxClips: number) => new MenuItem({
      label: "Preferences",
      submenu: Menu.buildFromTemplate([
        new MenuItem({
          label: "Number of Clips",
          submenu: Menu.buildFromTemplate([10, 20, 30, 40, 50, 60, 70, 80, 90].map((item) =>
            new MenuItem({
              label: String(item),
              type: "radio",
              checked: item === maxClips,
              click: () => win?.webContents.send(CHANNEL.MAX_UPDATE, item),
            })
          ))
        }),
        new MenuItem({
          label: "About",
          submenu: Menu.buildFromTemplate([
            new MenuItem({ label: "Application: Copy Zen", enabled: false }),
            new MenuItem({ label: "Version: v1.1.0", enabled: false }),
          ]),
        })
      ])
    });

    preferences = syncPreferences(20);

    ipcMain.on(CHANNEL.MAX, (_event, max) => {
      preferences = syncPreferences(max);
    })

    // Initialize Tray with stored clipboard from bear store. Run on app start.
    ipcMain.on(CHANNEL.CLIPBOARD_PROCESS, (_event, clips: Clip[]) => {
      const clipItems = clips.map((clip, index) => {
        return new MenuItem({
          id: clip.id,
          label:
            clip.content.length >= 50
              ? clip.content.slice(0, 50).trim() + "..."
              : clip.content,
          accelerator: `CommandOrControl+${index + 1}`,
          click: () => clipboard.writeText(clip.content.trim()),
        });
      });

      menu = Menu.buildFromTemplate([
        clipItems.length ? hint1 : hint2,
        separator,
        ...clipItems,
        separator,
        preferences,
        separator,
        clear,
        separator,
        quit,
        separator,
      ]);
      tray.setContextMenu(menu);
    });
  });
