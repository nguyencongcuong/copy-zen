import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import _ from "lodash";

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
  addClip: (clip: Clip) => void;
  resetClips: () => void;
  setMaxClips: (number: number) => void;
}

export const useBearStore = create(
  persist<State & Actions>(
    (set) => ({
      clips: [],
      maxClips: 20,
      addClip: (clip: Clip) =>
        set((state) => {
          const newClips = _.slice(_.uniqBy([clip, ...state.clips], (clip) => clip.content), 0, state.maxClips);
          return ({ clips: newClips });
        }),
      resetClips: () => set(() => ({ clips: [] })),
      setMaxClips: (number: number) => set(() => ({ maxClips: number }))
    }),
    {
      name: "clipboard",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
