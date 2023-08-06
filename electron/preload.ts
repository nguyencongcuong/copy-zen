import { clipboard, contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { Clip } from "../src/components/Clipboards/clipboards.interface.ts";
import { CHANNEL } from "./channel.ts";

contextBridge.exposeInMainWorld("electron", {
  listen: (
    channel: string,
    callback: (event: IpcRendererEvent, ...args: any[]) => void,
  ) => ipcRenderer.on(channel, callback),

  copyToClipboard: (text: string) => {
    clipboard.writeText(text.trim());
  },

  initializeTray: (clips: Clip[]) => {
    ipcRenderer.send(CHANNEL.TRAY_INITIALIZATION, clips);
  },

  syncMaxClips: (max: number) => {
    ipcRenderer.send(CHANNEL.MAX_CLIPS, max);
  }
});
