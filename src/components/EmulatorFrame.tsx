import { useRef } from 'react'

interface EmulatorFrameProps {
  file: File
  core: string
  romId: string
  couchMode?: boolean
  bios?: File[] | null
}

export default function EmulatorFrame({ file, core, romId, couchMode, bios }: EmulatorFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

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
    />
  )
}
