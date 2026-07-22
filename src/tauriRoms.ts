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
  // readFile can return different types depending on platform/tauri version
  // (Uint8Array / ArrayBuffer / base64 string). Normalize to a Blob first
  // and then construct a File so the rest of the app (and EmulatorJS) sees a
  // standard browser File object.
  const data = await readFile(rom.path)

  let blob: Blob
  if (typeof data === 'string') {
    // Treat string as base64 if it looks like base64, otherwise treat as raw
    // text bytes. Try to detect base64 by presence of non-printable chars
    // is unreliable, so if data looks like base64 (pad chars or mostly
    // printable with +/=/), decode with atob and convert to Uint8Array.
    try {
      // Strip a possible data:...;base64, prefix if present
      const base64 = data.includes(',') ? data.split(',')[1] : data
      const binStr = atob(base64)
      const arr = new Uint8Array(binStr.length)
      for (let i = 0; i < binStr.length; i++) arr[i] = binStr.charCodeAt(i)
      blob = new Blob([arr], { type: 'application/octet-stream' })
    } catch (e) {
      // Fallback: encode as UTF-8 string
      blob = new Blob([data], { type: 'application/octet-stream' })
    }
  } else if (data instanceof Uint8Array) {
    blob = new Blob([data.buffer], { type: 'application/octet-stream' })
  } else if (data instanceof ArrayBuffer) {
    blob = new Blob([data], { type: 'application/octet-stream' })
  } else {
    // Any other type (e.g. object) — let Blob try to handle it
    blob = new Blob([data as any], { type: 'application/octet-stream' })
  }

  return new File([blob], rom.name, { type: blob.type, lastModified: Date.now() })
}
