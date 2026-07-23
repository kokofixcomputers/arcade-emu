import { useRef, useEffect } from 'react'

interface EmulatorFrameProps {
  file: File
  core: string
  romId: string
  couchMode?: boolean
  bios?: File[] | null
}

export default function EmulatorFrame({ file, core, romId, couchMode, bios }: EmulatorFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Placeholder for any post-load wiring we may need in future.
  }, [])

  const handleLoad = () => {
    const contentWindow = iframeRef.current?.contentWindow
    if (!contentWindow) return
    contentWindow.postMessage(
      { type: 'ejs-boot', core, file, fileName: file.name, gameId: romId, couchMode: !!couchMode, bios: bios ?? null },
      window.location.origin,
    )
  }

  return (
    <iframe
      ref={iframeRef}
      title="emulator"
      src={`${import.meta.env.BASE_URL}emulator.html`}
      onLoad={handleLoad}
      allow="gamepad; fullscreen"
      className="emulator-frame"
      /* When the iframe unloads (emulator exits), clear the active flag so
         keyboard capture stops. */
      onUnload={() => { try { (window as any).__arcadeEmuEmulatorActive = false } catch (e) {} }}
    />
  )
}
