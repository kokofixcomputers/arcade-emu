import { useEffect, useRef, useState } from 'react'
import { listRoms, romToFile, type RomRecord } from '../db'
import { systemBadge, systemLabel } from '../emulatorCores'
import { useGamepadNav } from '../useGamepadNav'

interface CouchModeProps {
  onPlay: (file: File, core: string, romId: string) => void
  onExit: () => void
}

const COLUMNS = 5

export default function CouchMode({ onPlay, onExit }: CouchModeProps) {
  const [roms, setRoms] = useState<RomRecord[]>([])
  const [loaded, setLoaded] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    listRoms().then((records) => {
      setRoms(records)
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    cardRefs.current[focusedIndex]?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [focusedIndex])

  const launchFocused = () => {
    const rom = roms[focusedIndex]
    if (!rom) return
    onPlay(romToFile(rom), rom.core, rom.id)
  }

  useGamepadNav(
    {
      onMove: (dx, dy) => {
        setFocusedIndex((current) => {
          if (roms.length === 0) return current
          let next = current + dx + dy * COLUMNS
          next = Math.max(0, Math.min(roms.length - 1, next))
          return next
        })
      },
      onConfirm: launchFocused,
      onBack: onExit,
    },
    true,
  )

  return (
    <div className="couch-mode">
      <div className="couch-mode__header">
        <h2>Continue Playing</h2>
        <p className="couch-mode__hint">D-pad / stick to move · A to play · B to exit</p>
      </div>

      {loaded && roms.length === 0 && (
        <div className="couch-mode__empty">
          <p>No games yet. Add a ROM from the regular library first.</p>
        </div>
      )}

      {roms.length > 0 && (
        <div className="couch-mode__grid" style={{ gridTemplateColumns: `repeat(${COLUMNS}, 1fr)` }}>
          {roms.map((record, index) => {
            const badge = systemBadge(record.core)
            const focused = index === focusedIndex
            return (
              <div
                key={record.id}
                ref={(el) => {
                  cardRefs.current[index] = el
                }}
                className={`couch-card ${focused ? 'couch-card--focused' : ''}`}
                onClick={() => {
                  setFocusedIndex(index)
                  onPlay(romToFile(record), record.core, record.id)
                }}
              >
                <div
                  className="couch-card__art"
                  style={{ background: `linear-gradient(135deg, ${badge.color}, #0f0f14)` }}
                >
                  <span className="couch-card__badge">{badge.short}</span>
                </div>
                <p className="couch-card__name" title={record.name}>
                  {record.name}
                </p>
                <p className="couch-card__meta">{systemLabel(record.core)}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
