import {useEffect} from "react";
import { shallow } from 'zustand/shallow'
import {useBearStore} from "./store/store.ts";

function App() {
  const [clips, addClip, resetClips] = useBearStore((state) => [state.clips, state.addClip, state.resetClips], shallow)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window['electron'].listen('clipboard-updated', (event: any, message: any) => {
      console.log(event)
      addClip(message);
    })
  }, []);

  return (
    <div>
      <div>
        {
          clips.map((clip) => {
            return (
              <div key={clip.id}>{clip.content}</div>
            )
          })
        }
      </div>
      <button onClick={resetClips}>Reset Clips</button>
    </div>
  )
}

export default App
