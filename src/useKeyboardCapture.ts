import { useEffect } from 'react'

// Keys and combos to try to intercept. We also preventDefault() on keydown
// for these to stop the browser from handling them where possible.
const INTERCEPT_KEYS = new Set([
  'Tab','Escape','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
  'PageUp','PageDown','ArrowLeft','ArrowRight','ArrowUp','ArrowDown',
  'Backspace','Delete','Home','End','Insert',' ', 'Enter',
])

export function useKeyboardCapture(active: boolean) {
  useEffect(() => {
    if (!active) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common browser actions triggered by these keys/combinations.
      // For key combos like Ctrl+W we can't inspect the physical key reliably
      // without the Keyboard Lock API, but preventing default here stops many
      // navigational shortcuts from firing.
      if (INTERCEPT_KEYS.has(e.key)) {
        e.preventDefault()
        e.stopPropagation()
      }

      // Block some common modifier combos
      if (e.ctrlKey || e.metaKey) {
        // Common tab/window shortcuts
        const blocked = ['w', 't', 'n', 'p', 'r']
        if (blocked.includes(e.key.toLowerCase())) {
          e.preventDefault()
          e.stopPropagation()
        }
        // Also block Ctrl/Cmd+W variants
      }
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })

    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [active])
}
