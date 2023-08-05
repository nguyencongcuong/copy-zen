import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import * as _ from "lodash";

interface Clip {
  id: string;
  content: string;
  created_at: string;
}

interface State {
  clips: Clip[];
  maxClips: number;
}

interface Actions {
  addClip: (clip: Clip, maxClips: number) => void;
  resetClips: () => void;
  setMaxClips: (number: number) => void;
}

export const useBearStore = create(
  immer(
    persist<State & Actions>(
      (set) => ({
        clips: [],
        maxClips: 20,
        addClip: (clip: Clip, maxClips: number) =>
          set((state) => {
            clip = {
              ...clip,
              content: clip.content.trim(),
            };

            state.clips = [clip, ...state.clips];
            state.clips = _.uniqBy(state.clips, (clip) => clip.content);
            if (state.clips.length > maxClips) {
              state.clips = state.clips.splice(0, maxClips);
            }
            return state;
          }),
        resetClips: () =>
          set((state) => {
            state.clips = [];
            return state;
          }),
        setMaxClips: (number: number) => {
          set((state) => {
            state.maxClips = number;
            return state;
          });
        },
      }),
      {
        name: "clipboard",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  ),
);
