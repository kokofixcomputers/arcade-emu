import { useCallback, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import DropZone from './DropZone'
import RomsFolderControl from './RomsFolderControl'
import { deleteRom, listRoms, romToFile, type RomRecord } from '../db'
import { systemBadge, systemLabel } from '../emulatorCores'

interface LibraryProps {
  onPlay: (file: File, core: string, romId: string) => void
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
  const [search, setSearch] = useState('')
  const [filterSystem, setFilterSystem] = useState('all')

  const refresh = useCallback(() => {
    listRoms().then((records) => {
      setRoms(records)
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleAdd = (file: File, core: string) => {
    onPlay(file, core, '')
  }

  const handleResume = (record: RomRecord) => {
    onPlay(romToFile(record), record.core, record.id)
  }

  const handleDelete = async (event: React.MouseEvent, id: string) => {
    event.stopPropagation()
    await deleteRom(id)
    setRoms((current) => current.filter((rom) => rom.id !== id))
  }

  const filteredRoms = roms.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase())
    const matchesSystem = filterSystem === 'all' ? true : r.core === filterSystem
    return matchesSearch && matchesSystem
  })

  return (
    <div className="library">
      <section className="library__hero">
        <RomsFolderControl onImported={refresh} />
        <DropZone onLoadRom={handleAdd} />
      </section>

      {loaded && roms.length > 0 && (
        <section className="library__grid-section">
          <h2>Continue Playing</h2>

          <div className="library__filters" style={{display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center'}}>
            <input
              placeholder="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{padding: '6px 8px', borderRadius: 6, border: '1px solid #2c2c32', background: '#1a1a1e', color: '#f4efe6'}}
            />
            <select value={filterSystem} onChange={(e) => setFilterSystem(e.target.value)} style={{padding: '6px 8px', borderRadius: 6, border: '1px solid #2c2c32', background: '#1a1a1e', color: '#f4efe6'}}>
              <option value="all">All systems</option>
              {Array.from(new Set(roms.map(r => r.core))).map((core) => (
                <option key={core} value={core}>{systemLabel(core)}</option>
              ))}
            </select>
            <button onClick={() => { setSearch(''); setFilterSystem('all') }} style={{marginLeft: 'auto'}}>Clear</button>
          </div>

          <div className="library__grid">
            {filteredRoms.map((record) => {
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
