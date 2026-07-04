import { useEffect, useState } from 'react'
import { ArrowLeft, Gamepad2 } from 'lucide-react'
import Library from './components/Library'
import CouchMode from './components/CouchMode'
import EmulatorFrame from './components/EmulatorFrame'
import { addRom, touchRom } from './db'
import './App.css'

type View = 'library' | 'couch'

interface ActiveRom {
  file: File
  core: string
  romId: string
  key: string
  launchedFrom: View
}

function App() {
  const [view, setView] = useState<View>('library')
  const [activeRom, setActiveRom] = useState<ActiveRom | null>(null)

  const handlePlay = async (file: File, core: string, existingRomId: string) => {
    let romId = existingRomId
    if (existingRomId) {
      await touchRom(existingRomId)
    } else {
      romId = (await addRom(file, core)).id
    }
    setActiveRom({
      file,
      core,
      romId,
      key: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}`,
      launchedFrom: view,
    })
  }

  const enterCouchMode = () => {
    document.documentElement.requestFullscreen?.().catch(() => {})
    setView('couch')
  }

  const exitCouchMode = () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    setView('library')
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type === 'ejs-exit') {
        if (activeRom?.launchedFrom === 'couch') {
          setView('couch')
        } else if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {})
        }
        setActiveRom(null)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [activeRom])

  return (
    <div className="app">
      {!(activeRom?.launchedFrom === 'couch') && (
        <header className="app__header">
          <h1 className="app__logo">
            <span className="app__logo-accent">Arcade</span>Emu
            <span className="app__logo-cursor" aria-hidden="true" />
          </h1>
          {activeRom ? (
            <button className="app__reset" onClick={() => setActiveRom(null)}>
              <ArrowLeft size={16} /> Back to library
            </button>
          ) : (
            <button className="app__couch-button" onClick={enterCouchMode}>
              <Gamepad2 size={16} /> Couch Mode
            </button>
          )}
        </header>
      )}

      <main className={`app__main ${activeRom ? 'app__main--player' : ''}`}>
        {!activeRom && view === 'library' && <Library onPlay={handlePlay} />}
        {!activeRom && view === 'couch' && <CouchMode onPlay={handlePlay} onExit={exitCouchMode} />}
        {activeRom && (
          <div className="app__player">
            <EmulatorFrame
              key={activeRom.key}
              file={activeRom.file}
              core={activeRom.core}
              romId={activeRom.romId}
              couchMode={activeRom.launchedFrom === 'couch'}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
