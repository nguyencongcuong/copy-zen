import { clipboard, contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

interface Clip {
  id: string
  content: string
  created_at: string
}

// Custom APIs for renderer
const api = {
  listen: (channel: string, callback: (event: IpcRendererEvent, ...args: any[]) => void): void => {
    ipcRenderer.on(channel, callback)
  },

  copyToClipboard: (text: string): void => {
    clipboard.writeText(text.trim())
  },

  processClipboard: (clips: Clip[]): void => {
    ipcRenderer.send('clipboard-process', clips)
  },

  syncMaxClips: (max: number): void => {
    ipcRenderer.send('max', max)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
