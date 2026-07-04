import { isTauri } from '@tauri-apps/api/core'
import { join } from '@tauri-apps/api/path'
import { open } from '@tauri-apps/plugin-dialog'
import { readDir, readFile } from '@tauri-apps/plugin-fs'
import { guessSystem } from './emulatorCores'

export { isTauri }

export interface ScannedRom {
  path: string
  name: string
  core: string
}

export async function pickRomsFolder(): Promise<string | null> {
  const selected = await open({ directory: true, multiple: false, title: 'Choose ROMs folder' })
  return typeof selected === 'string' ? selected : null
}

async function walk(dir: string): Promise<ScannedRom[]> {
  const entries = await readDir(dir)
  const results: ScannedRom[] = []
  for (const entry of entries) {
    const entryPath = await join(dir, entry.name)
    if (entry.isDirectory) {
      results.push(...(await walk(entryPath)))
    } else if (entry.isFile) {
      const core = guessSystem(entry.name)
      if (core) results.push({ path: entryPath, name: entry.name, core })
    }
  }
  return results
}

export async function scanRomsFolder(dir: string): Promise<ScannedRom[]> {
  return walk(dir)
}

export async function readRomFile(rom: ScannedRom): Promise<File> {
  const bytes = await readFile(rom.path)
  return new File([bytes], rom.name)
}
