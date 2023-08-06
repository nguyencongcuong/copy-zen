import { useStore } from "../../store.ts";
import { useEffect } from "react";
import { Clip } from "./clipboards.interface.ts";
import { CHANNEL } from "../../../electron/channel.ts";

export function Clipboards() {
  const { clips, max, add, clear, setMax } = useStore();

  useEffect(() => {
    const addClipCallback = (_event: any, clip: Clip) => add(clip);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window["electron"].listen(CHANNEL.CLIPBOARD_UPDATED, addClipCallback)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window["electron"].listen(CHANNEL.CLIPBOARD_CLEARED, clear);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window["electron"].listen(
      CHANNEL.MAX_UPDATE,
      (_event: any, max: number) => setMax(max)
    );
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window["electron"].processClipboard(clips);
  }, [clips]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window["electron"].syncMaxClips(max);
  }, [max]);

  return null;
}
