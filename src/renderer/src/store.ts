import { createJSONStorage, persist } from 'zustand/middleware'
import { createWithEqualityFn } from 'zustand/traditional'
import _ from 'lodash'
import { Clip } from './components/Clipboards/clipboards.interface'

interface State {
  clips: Clip[]
  max: number
}

interface Actions {
  add: (clip: Clip) => void
  clear: () => void
  setMax: (number: number) => void
}

export const useStore = createWithEqualityFn(
  persist<State & Actions>(
    (set) => ({
      clips: [],
      max: 20,
      add: (clip: Clip) =>
        set((state) => {
          const newClips = _.slice(
            _.uniqBy([clip, ...state.clips], (clip) => clip.content),
            0,
            state.max
          )
          return { clips: newClips }
        }),
      clear: () => set(() => ({ clips: [] })),
      setMax: (number: number) => set(() => ({ max: number }))
    }),
    {
      name: 'clipboard',
      storage: createJSONStorage(() => localStorage)
    }
  ),
  Object.is
)
