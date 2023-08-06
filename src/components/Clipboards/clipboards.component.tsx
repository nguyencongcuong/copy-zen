import { useBearStore } from "../../store.ts";
import { shallow } from "zustand/shallow";
import { useEffect } from "react";
import { Clip } from "./clipboards.interface.ts";
import { CHANNEL } from "../../../electron/channel.ts";

export function Clipboards() {
  const [clips, addClip, resetClips, maxClips, setMaxClips] = useBearStore(
    (state) => [
      state.clips,
      state.addClip,
      state.resetClips,
      state.maxClips,
      state.setMaxClips
    ],
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

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window["electron"].syncMaxClips(maxClips);
  }, [maxClips]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window["electron"].listen(
      CHANNEL.MAX_CLIPS_UPDATE,
      (_event: any, max: number) => setMaxClips(max)
    );
  }, []);

  return null;
}
