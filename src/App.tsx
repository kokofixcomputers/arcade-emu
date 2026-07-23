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
  bios?: File[] | null
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

  const handlePlay = async (file: File, core: string, existingRomId: string, bios?: File[] | null) => {
    // Attempt to acquire the Keyboard Lock API during this user activation.
    // This lets us capture physical keys (e.g. KeyW) and combinations like
    // Ctrl+W on supporting browsers. It is experimental and may reject.
    try {
      const requested = [
        'Tab','Escape','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
        'PageUp','PageDown','ArrowLeft','ArrowRight','ArrowUp','ArrowDown',
        'Backspace','Delete','Home','End','Insert','Space','Enter','NumpadEnter',
        'KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE','KeyP','KeyT','KeyN','KeyR','KeyF',
      ]
      if (navigator.keyboard && typeof (navigator as any).keyboard.lock === 'function') {
        // @ts-ignore
        ;(navigator as any).keyboard.lock(requested).catch(() => {})
      }
    } catch (e) {
      // ignore
    }

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
      bios: bios ?? null,
    })

    // mark emulator active for global keyboard capture hook
    try {
      ;(window as any).__arcadeEmuEmulatorActive = true
    } catch (e) {
      // ignore
    }
  }

  const KEYBOARD_REQUESTED = [
    'Tab','Escape','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
    'PageUp','PageDown','ArrowLeft','ArrowRight','ArrowUp','ArrowDown',
    'Backspace','Delete','Home','End','Insert',' ', 'Enter',
    'KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE','KeyP','KeyT','KeyN','KeyR','KeyF',
  ]

  async function attemptKeyboardLock() {
    try {
      if ((navigator as any).keyboard && typeof (navigator as any).keyboard.lock === 'function') {
        // @ts-ignore
        await (navigator as any).keyboard.lock(KEYBOARD_REQUESTED)
      }
    } catch (e) {
      // ignore failures
    }
  }

  const enterCouchMode = () => {
    // Request fullscreen; attempt to lock keyboard after fullscreen is entered
    const p = document.documentElement.requestFullscreen?.()
    if (p && typeof p.then === 'function') {
      p.then(() => attemptKeyboardLock()).catch(() => {})
    }
    setView('couch')
  }

  const exitCouchMode = () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    setView('library')
  }

  // Re-attempt lock when the page enters fullscreen by any means
  useEffect(() => {
    const onFs = () => {
      if (document.fullscreenElement) attemptKeyboardLock()
    }
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type === 'ejs-exit') {
        try {
          ;(window as any).__arcadeEmuEmulatorActive = false
        } catch (e) {}
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
              bios={activeRom.bios ?? null}
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
