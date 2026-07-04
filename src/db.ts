export interface RomRecord {
  id: string
  name: string
  core: string
  size: number
  addedAt: number
  lastPlayedAt: number
  blob: Blob
  /** Absolute filesystem path, only set for ROMs auto-imported from a
   *  desktop (Tauri) ROMs folder — used to skip re-importing on rescan. */
  sourcePath?: string
}

const DB_NAME = 'arcade-emu'
const STORE_NAME = 'roms'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode)
    const request = fn(tx.objectStore(STORE_NAME))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
  })
}

export async function addRom(file: File, core: string, sourcePath?: string): Promise<RomRecord> {
  const record: RomRecord = {
    id: crypto.randomUUID(),
    name: file.name,
    core,
    size: file.size,
    addedAt: Date.now(),
    lastPlayedAt: Date.now(),
    blob: file,
    sourcePath,
  }
  await withStore('readwrite', (store) => store.put(record))
  return record
}

export async function listSourcePaths(): Promise<Set<string>> {
  const records = await withStore<RomRecord[]>('readonly', (store) => store.getAll())
  return new Set(records.map((r) => r.sourcePath).filter((p): p is string => !!p))
}

export async function listRoms(): Promise<RomRecord[]> {
  const records = await withStore<RomRecord[]>('readonly', (store) => store.getAll())
  return records.sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)
}

export async function touchRom(id: string): Promise<void> {
  const record = await withStore<RomRecord | undefined>('readonly', (store) => store.get(id))
  if (!record) return
  record.lastPlayedAt = Date.now()
  await withStore('readwrite', (store) => store.put(record))
}

export async function deleteRom(id: string): Promise<void> {
  await withStore('readwrite', (store) => store.delete(id))
}

export function romToFile(record: RomRecord): File {
  return new File([record.blob], record.name, { type: record.blob.type })
}
