import { useEffect } from 'react'
import { useStore } from '../../store'
import * as React from 'react'
import { CHANNEL } from '../../constants/channel'
import { Clip } from './clipboards.interface'

export function Clipboards(): React.JSX.Element {
  const { clips, max, clear, add, setMax } = useStore()

  useEffect(() => {
    const addClipCallback = (_event, clip: Clip) => add(clip)
    window.api.listen(CHANNEL.CLIPBOARD_UPDATED, addClipCallback)
    window.api.listen(CHANNEL.CLIPBOARD_CLEARED, clear)
    window.api.listen(CHANNEL.MAX_UPDATE, (_event, max: number) => setMax(max))
  }, [])

  useEffect(() => {
    window.api.processClipboard(clips)
  }, [clips])

  useEffect(() => {
    window.api.syncMaxClips(max)
  }, [max])

  return <div>Welcome To Copy Zen 2 ClipBoard</div>
}
