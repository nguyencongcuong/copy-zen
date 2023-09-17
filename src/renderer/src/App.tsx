import { Clipboards } from './components/Clipboards/clipboards.component'
import * as React from 'react'
import { useEffect } from 'react'

function App(): React.JSX.Element {
  useEffect(() => {
    console.log('[App] Start')
  }, [])

  return (
    <div className="container">
      <Clipboards />
    </div>
  )
}

export default App
