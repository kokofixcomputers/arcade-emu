import { useEffect, useState } from 'react'
import { FolderOpen, RefreshCw } from 'lucide-react'
import { addRom, listSourcePaths } from '../db'
import { isTauri, pickRomsFolder, readRomFile, scanRomsFolder } from '../tauriRoms'

const STORAGE_KEY = 'arcade-emu:roms-folder'

interface RomsFolderControlProps {
  onImported: () => void
}

export default function RomsFolderControl({ onImported }: RomsFolderControlProps) {
  const [folder, setFolder] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  const importFromFolder = async (dir: string) => {
    setScanning(true)
    try {
      const [scanned, existing] = await Promise.all([scanRomsFolder(dir), listSourcePaths()])
      const newRoms = scanned.filter((rom) => !existing.has(rom.path))
      for (const rom of newRoms) {
        const file = await readRomFile(rom)
        await addRom(file, rom.core, rom.path)
      }
      if (newRoms.length > 0) onImported()
    } finally {
      setScanning(false)
    }
  }

  useEffect(() => {
    if (!isTauri()) return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setFolder(saved)
      importFromFolder(saved)
    }
    // Only run once on mount to auto-import from a previously chosen folder.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isTauri()) return null

  const handleChooseFolder = async () => {
    const dir = await pickRomsFolder()
    if (!dir) return
    localStorage.setItem(STORAGE_KEY, dir)
    setFolder(dir)
    await importFromFolder(dir)
  }

  return (
    <div className="roms-folder">
      <button className="roms-folder__button" onClick={handleChooseFolder} disabled={scanning}>
        <FolderOpen size={16} /> {folder ? 'Change ROMs Folder' : 'Set ROMs Folder'}
      </button>
      {folder && (
        <button
          className="roms-folder__button roms-folder__button--secondary"
          onClick={() => importFromFolder(folder)}
          disabled={scanning}
        >
          <RefreshCw size={16} className={scanning ? 'roms-folder__spin' : ''} />
          {scanning ? 'Scanning…' : 'Rescan'}
        </button>
      )}
      {folder && (
        <p className="roms-folder__path" title={folder}>
          {folder}
        </p>
      )}
    </div>
  )
}
