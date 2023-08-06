import { useBearStore } from "../../store.ts";
import { shallow } from "zustand/shallow";
import { useEffect } from "react";
import { Clip } from "./clipboards.interface.ts";
import { CHANNEL } from "../../../electron/channel.ts";

export function Clipboards() {
  const [clips, addClip, resetClips] = useBearStore(
    (state) => [state.clips, state.addClip, state.resetClips],
    shallow,
  );

  useEffect(() => {

    const addClipCallback = (_event: any, clip: Clip) => addClip(clip);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window["electron"].listen(CHANNEL.CLIPBOARD_UPDATED, addClipCallback)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window["electron"].listen(CHANNEL.CLIPBOARD_CLEARED, resetClips);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window["electron"].initializeTray(clips);
  }, [clips]);

  return null;
}
