import {
  app,
  shell,
  BrowserWindow,
  clipboard,
  Menu,
  nativeImage,
  nativeTheme,
  Tray,
  MenuItem,
  ipcMain
} from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import darkTrayIconPath from '../../build/tray-dark.png?asset'

interface Clip {
  id: string
  content: string
  created_at: string
}

let mainWindow: BrowserWindow
let tray: Tray
let menu: Menu

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux'
      ? { icon: join(__dirname, '../renderer/assets/tray-dark.png') }
      : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    // mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url).then((r) => console.log(r))
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']).then((r) => console.log(r))
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html')).then((r) => console.log(r))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app
  .whenReady()
  .then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    createWindow()

    app.on('activate', () => {
      // On macOS, it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
  .then(() => {
    let previousClipboardText = clipboard.readText().trim()
    setInterval(() => {
      if (!mainWindow?.isFocused()) {
        const types = clipboard.availableFormats('clipboard')
        console.log('types', types)
        const text = clipboard.readText().trim()
        if (text && text !== previousClipboardText) {
          const clip = { content: text.trim(), created_at: new Date().toISOString() }
          mainWindow?.webContents.send('clipboard-updated', clip)
          previousClipboardText = text
        }
      }
    }, 1000)
  })
  .then(() => {
    // Step 1: Create tray icon
    const darkTrayIcon = nativeImage.createFromPath(darkTrayIconPath).resize({ width: 16 })
    tray = new Tray(darkTrayIcon)

    // Step 2: Define menu items
    const syncPreferences = (maxClips: number): MenuItem =>
      new MenuItem({
        label: 'Preferences',
        submenu: Menu.buildFromTemplate([
          new MenuItem({
            label: 'Number of Clips',
            submenu: Menu.buildFromTemplate(
              [10, 20, 30, 40, 50, 60, 70, 80, 90].map(
                (item) =>
                  new MenuItem({
                    label: String(item),
                    type: 'radio',
                    checked: item === maxClips,
                    click: () => mainWindow?.webContents.send('max-update', item)
                  })
              )
            )
          }),
          new MenuItem({
            label: 'About',
            submenu: Menu.buildFromTemplate([
              new MenuItem({ label: 'Application: Copy Zen', enabled: false }),
              new MenuItem({ label: 'Version: v2.0.0', enabled: false })
            ])
          })
        ])
      })

    const MENU = {
      HINT_1: new MenuItem({
        label: 'Select the clip you would like to copy',
        enabled: false
      }),
      HINT_2: new MenuItem({
        label: 'Your clippings will appear here...',
        enabled: false
      }),
      SEPARATOR: new MenuItem({
        type: 'separator'
      }),
      QUIT: new MenuItem({
        label: 'Quit',
        accelerator: 'CommandOrControl+Q',
        click: (): void => app.quit()
      }),
      CLEAR: new MenuItem({
        label: 'Clear',
        accelerator: 'CommandOrControl+R',
        click: (): void => mainWindow?.webContents.send('clipboard-clear')
      })
    }

    let preferences: MenuItem

    preferences = syncPreferences(20)

    // Step 3: Listen to theme color and update tray icon
    nativeTheme.on('updated', () => {
      if (nativeTheme.shouldUseDarkColors) {
        console.log('Dark Theme: Should use light tray icon')
      } else {
        console.log('Light Theme: Should use dark tray icon')
      }
    })

    // Step 4: Initialize Tray with stored clipboard from bear store. Run on app start.
    ipcMain.on('clipboard-process', (_event, clips: Clip[]) => {
      ipcMain.on('max', (_event, max) => {
        preferences = syncPreferences(max)
      })

      const clipItems = clips.map((clip, index) => {
        return new MenuItem({
          id: clip.id,
          label:
            clip.content.length >= 50 ? clip.content.slice(0, 50).trim() + '...' : clip.content,
          accelerator: `CommandOrControl+${ index + 1 }`,
          click: (): void => clipboard.writeText(clip.content.trim())
        })
      })

      menu = Menu.buildFromTemplate([
        clipItems.length ? MENU.HINT_1 : MENU.HINT_2,
        MENU.SEPARATOR,
        ...clipItems,
        MENU.SEPARATOR,
        preferences,
        MENU.SEPARATOR,
        MENU.CLEAR,
        MENU.SEPARATOR,
        MENU.QUIT
      ])

      tray.setContextMenu(menu)
    })
  })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
