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

  processClipboard: (clips: Clip[]) => {
    ipcRenderer.send(CHANNEL.CLIPBOARD_PROCESS, clips);
  },

  syncMaxClips: (max: number) => {
    ipcRenderer.send(CHANNEL.MAX, max);
  }
});
