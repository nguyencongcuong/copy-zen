import {create} from 'zustand'
import {persist, createJSONStorage} from 'zustand/middleware'
import {immer} from "zustand/middleware/immer";

interface Clip {
  id: string;
  content: string;
  created_at: string;
}

interface State {
  clips: Clip[]
}

interface Actions {
  addClip: (clip: Clip) => void;
  resetClips: () => void;
}

export const useBearStore = create(immer(persist<State & Actions>(
  (set) => ({
    clips: [],
    addClip: (clip: Clip) => set((state) => {
      state.clips = [clip, ...state.clips];
      return state;
    }),
    resetClips: () => set((state) => {
      state.clips = [];
      return state;
    })
  }),
  {
    name: 'clipboard',
    storage: createJSONStorage(() => localStorage),
  }
)))