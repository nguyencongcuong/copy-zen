/// <reference types="electron-vite/node" />

import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      listen: (channel, callback) => void,
      processClipboard: (clips: Clip[]) => void,
      syncMaxClips: (max: number) => void
    }
  }
}
