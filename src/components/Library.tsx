import { useCallback, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import DropZone from './DropZone'
import RomsFolderControl from './RomsFolderControl'
import { deleteRom, listRoms, romToFile, type RomRecord } from '../db'
import { systemBadge, systemLabel } from '../emulatorCores'

interface LibraryProps {
  onPlay: (file: File, core: string, romId: string, bios?: File[] | null) => void
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Library({ onPlay }: LibraryProps) {
  const [roms, setRoms] = useState<RomRecord[]>([])
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(() => {
    listRoms().then((records) => {
      setRoms(records)
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleAdd = (file: File, core: string, bios?: File[] | null) => {
    onPlay(file, core, '', bios ?? null)
  }

  const handleResume = (record: RomRecord) => {
    onPlay(romToFile(record), record.core, record.id)
  }

  const handleDelete = async (event: React.MouseEvent, id: string) => {
    event.stopPropagation()
    await deleteRom(id)
    setRoms((current) => current.filter((rom) => rom.id !== id))
  }

  return (
    <div className="library">
      <section className="library__hero">
        <RomsFolderControl onImported={refresh} />
        <DropZone onLoadRom={handleAdd} />
      </section>

      {loaded && roms.length > 0 && (
        <section className="library__grid-section">
          <h2>Continue Playing</h2>
          <div className="library__grid">
            {roms.map((record) => {
              const badge = systemBadge(record.core)
              return (
                <div
                  key={record.id}
                  className="rom-card"
                  onClick={() => handleResume(record)}
                >
                  <div
                    className="rom-card__art"
                    style={{ background: `linear-gradient(135deg, ${badge.color}, #0a0a0c)` }}
                  >
                    <span className="rom-card__badge">{badge.short}</span>
                  </div>
                  <div className="rom-card__info">
                    <p className="rom-card__name" title={record.name}>
                      {record.name}
                    </p>
                    <p className="rom-card__meta">{systemLabel(record.core)}</p>
                    <p className="rom-card__meta">Last played {formatDate(record.lastPlayedAt)}</p>
                  </div>
                  <button
                    className="rom-card__delete"
                    onClick={(event) => handleDelete(event, record.id)}
                    aria-label={`Remove ${record.name}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
