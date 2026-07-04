import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { SYSTEMS, guessSystem } from '../emulatorCores'

interface DropZoneProps {
  onLoadRom: (file: File, core: string) => void
}

export default function DropZone({ onLoadRom }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
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
    const file = event.dataTransfer.files[0]
    if (file) acceptFile(file)
  }

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) acceptFile(file)
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
          <button onClick={() => onLoadRom(pendingFile, core)}>Play</button>
        </div>
      )}
    </div>
  )
}
