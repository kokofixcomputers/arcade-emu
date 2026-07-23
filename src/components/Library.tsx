import { useCallback, useEffect, useRef, useState } from 'react'
import { X, Settings } from 'lucide-react'
import DropZone from './DropZone'
import RomsFolderControl from './RomsFolderControl'
import { deleteRom, listRoms, romToFile, updateRomCore, updateRomBios, romBiosToFiles, type RomRecord } from '../db'
import { systemBadge, systemLabel, SYSTEMS } from '../emulatorCores'

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

  const handleAdd = (file: File, core: string, bios?: File[] | null) => {
    onPlay(file, core, '', bios ?? null)
  }

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingCore, setEditingCore] = useState<string | null>(null)
  const [editingBios, setEditingBios] = useState<File[] | null>(null)
  const biosInputRef = useRef<HTMLInputElement | null>(null)

  const handleResume = (record: RomRecord) => {
    onPlay(romToFile(record), record.core, record.id, romBiosToFiles(record))
  }

  const handleDelete = async (event: React.MouseEvent, id: string) => {
    event.stopPropagation()
    await deleteRom(id)
    setRoms((current) => current.filter((rom) => rom.id !== id))
  }

  const startEdit = (event: React.MouseEvent, record: RomRecord) => {
    event.stopPropagation()
    setEditingId(record.id)
    setEditingCore(record.core)
    setEditingBios(romBiosToFiles(record))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingCore(null)
    setEditingBios(null)
  }

  const saveEdit = async () => {
    if (!editingId || !editingCore) return
    await updateRomCore(editingId, editingCore)
    await updateRomBios(editingId, editingBios)
    await refresh()
    cancelEdit()
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
            <button className="filter-clear" onClick={() => { setSearch(''); setFilterSystem('all') }}>Clear</button>
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

                  <div className="rom-card__actions" aria-hidden={editingId === record.id}>
                    <button className="rom-card__action" onClick={(e) => startEdit(e, record)} aria-label={`Edit ${record.name}`}>
                      <Settings size={14} />
                    </button>

                    <button
                      className="rom-card__delete"
                      onClick={(event) => handleDelete(event, record.id)}
                      aria-label={`Remove ${record.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>

                </div>
              )
            })}
          </div>

          {/* Edit modal (full-screen) */}
          {editingId && (
            <div className="rom-edit-modal" role="dialog" aria-modal="true" onClick={cancelEdit}>
              <div className="rom-edit-card" onClick={(e) => e.stopPropagation()}>
                <h3>Edit ROM</h3>
                <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                  <label style={{color: 'var(--paper-dim)'}}>System</label>
                  <select value={editingCore ?? ''} onChange={(e) => setEditingCore(e.target.value)}>
                    {SYSTEMS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{marginTop: '12px'}}>
                  <label style={{color: 'var(--paper-dim)'}}>BIOS files</label>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px'}}>
                    <input ref={biosInputRef} type="file" multiple hidden onChange={(e) => {
                      const files = Array.from(e.target.files ?? [])
                      setEditingBios((current) => {
                        const base = current ? [...current] : []
                        for (const f of files) base.push(f)
                        return base
                      })
                    }} />
                    <button onClick={() => biosInputRef.current?.click()}>Add BIOS</button>
                    <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
                      {(editingBios ?? []).map((b, i) => (
                        <span key={`${b.name}-${i}`} style={{background: 'rgba(255,255,255,0.04)', padding: '6px 8px', borderRadius: 6}}>
                          {b.name} <button onClick={() => setEditingBios((cur) => cur ? cur.filter((_, idx) => idx !== i) : null)}>x</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px'}}>
                  <button onClick={saveEdit}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
