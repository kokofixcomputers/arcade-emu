import { useRef } from 'react'

interface EmulatorFrameProps {
  file: File
  core: string
  couchMode?: boolean
}

export default function EmulatorFrame({ file, core, couchMode }: EmulatorFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleLoad = () => {
    const contentWindow = iframeRef.current?.contentWindow
    if (!contentWindow) return
    contentWindow.postMessage(
      { type: 'ejs-boot', core, file, fileName: file.name, couchMode: !!couchMode },
      window.location.origin,
    )
  }

  return (
    <iframe
      ref={iframeRef}
      title="emulator"
      src="/emulator.html"
      onLoad={handleLoad}
      allow="gamepad; fullscreen"
      className="emulator-frame"
    />
  )
}
