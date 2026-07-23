// Minimal ambient declarations for experimental Keyboard Lock API to
// avoid TypeScript errors where we feature-detect and cast to any.
interface Navigator {
  keyboard?: {
    lock?(keys?: string[] | string): Promise<void>
    unlock?(): void
  }
}

declare global {
  interface Window {
    __arcadeEmuEmulatorActive?: boolean
  }
}
