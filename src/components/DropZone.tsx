import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { SYSTEMS, guessSystem } from '../emulatorCores'

interface DropZoneProps {
  onLoadRom: (file: File, core: string, bios?: File[] | null) => void
}

export default function DropZone({ onLoadRom }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingBios, setPendingBios] = useState<File[] | null>(null)
  const biosInputRef = useRef<HTMLInputElement>(null)
  const [core, setCore] = useState<string>(SYSTEMS[0].value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptFile = (file: File) => {
    const guess = guessSystem(file.name)
    setCore(guess ?? SYSTEMS[0].value)
    setPendingFile(file)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const files = Array.from(event.dataTransfer.files)
    // pick first as ROM, others as BIOS candidates
    const rom = files[0]
    const biosFiles = files.slice(1)
    if (rom) acceptFile(rom)
    if (biosFiles.length) setPendingBios(biosFiles)
  }

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    const rom = files[0]
    const biosFiles = files.slice(1)
    if (rom) acceptFile(rom)
    if (biosFiles.length) setPendingBios(biosFiles)
  }

  const handleBiosInput = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length) setPendingBios(files)
  }

  return (
    <div className="drop-zone-wrapper">
      <div
        className={`drop-zone ${isDragging ? 'drop-zone--dragging' : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <p>Drag & drop a ROM file here, or click to browse</p>
        {pendingFile && <p className="drop-zone__file">{pendingFile.name}</p>}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          hidden
          multiple
        />
        <input
          ref={biosInputRef}
          type="file"
          onChange={handleBiosInput}
          hidden
          multiple
        />
      </div>

      {pendingFile && (
        <div className="rom-controls">
          <label htmlFor="core-select">System</label>
          <select
            id="core-select"
            value={core}
            onChange={(event) => setCore(event.target.value)}
          >
            {SYSTEMS.map((system) => (
              <option key={system.value} value={system.value}>
                {system.label}
              </option>
            ))}
          </select>
          {pendingBios && (
            <div className="bios-list">
              <label>Selected BIOS:</label>
              <ul>
                {pendingBios.map((b, i) => (
                  <li key={`${b.name}-${i}`}>
                    {b.name}{' '}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPendingBios((current) => (current ? current.filter((_, idx) => idx !== i) : null))
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rom-actions">
            <button onClick={() => onLoadRom(pendingFile as File, core, pendingBios ?? null)}>Play</button>
            <button onClick={() => biosInputRef.current?.click()}>Add BIOS</button>
          </div>
        </div>
      )}
    </div>
  )
}
