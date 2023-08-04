import {contextBridge, ipcRenderer} from 'electron'

contextBridge.exposeInMainWorld('electron', {
  listen: (channel: string, callback: any) => ipcRenderer.on(channel, callback)

});