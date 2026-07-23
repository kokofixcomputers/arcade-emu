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
  const DISCLAIMER_KEY = 'arcade-emu:disclaimer-accepted'
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(DISCLAIMER_KEY)
    } catch (e) {
      return true
    }
  })
  const [countdown, setCountdown] = useState<number>(3)

  // start countdown when the disclaimer is visible
  useEffect(() => {
    if (!showDisclaimer) return
    if (countdown <= 0) return
    const id = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [showDisclaimer, countdown])

  const acceptDisclaimer = () => {
    try {
      localStorage.setItem(DISCLAIMER_KEY, '1')
    } catch (e) {
      // ignore
    }
    setShowDisclaimer(false)
  }

  const continueAllowed = countdown <= 0

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
      {/* Header */}
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

      {/* Main content (library / couch / player) */}
      <main className={`app__main ${activeRom ? 'app__main--player' : ''}`} aria-hidden={showDisclaimer}>
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

      {/* Disclaimer modal shown on first visit only */}
      {showDisclaimer && (
        <div className="disclaimer-overlay" role="dialog" aria-modal="true">
          <div className="disclaimer-card">
            <h2 className="disclaimer-title">Important: Usage & Copyright</h2>
            <div className="disclaimer-body">
              <p>
                This application does not provide, distribute, or bundle any game ROM files. ROMs must be supplied
                locally by you (drag-and-drop or from a folder). Only load ROMs you legally own and are permitted
                to use in your jurisdiction.
              </p>
              <p>
                This project is intended for educational and demonstration purposes only. It is not intended to
                facilitate piracy or unauthorized distribution of copyrighted software.
              </p>
            </div>

            <div className="disclaimer-actions">
              <div className="disclaimer-countdown">{countdown > 0 ? `Please wait ${countdown}…` : 'Ready'}</div>
              <button
                className="disclaimer-button"
                onClick={acceptDisclaimer}
                disabled={!continueAllowed}
                aria-disabled={!continueAllowed}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
