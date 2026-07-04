import { useEffect, useRef } from 'react'

export interface GamepadNavHandlers {
  onMove: (dx: number, dy: number) => void
  onConfirm: () => void
  onBack: () => void
}

const DEADZONE = 0.5
const REPEAT_DELAY_MS = 350
const REPEAT_RATE_MS = 150

// Polls the Gamepad API (d-pad + left stick) and arrow/Enter/Escape keys for
// menu-style grid navigation — edge-triggered per direction, with
// press-and-hold repeat, so a couch/big-picture library screen is fully
// navigable without a mouse.
export function useGamepadNav(handlers: GamepadNavHandlers, active: boolean) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (!active) return

    const heldSince: Partial<Record<'up' | 'down' | 'left' | 'right', number>> = {}
    const lastRepeat: Partial<Record<'up' | 'down' | 'left' | 'right', number>> = {}
    let prevConfirm = false
    let prevBack = false
    let rafId: number

    const fireDirection = (direction: 'up' | 'down' | 'left' | 'right', pressed: boolean, now: number) => {
      if (!pressed) {
        delete heldSince[direction]
        delete lastRepeat[direction]
        return
      }
      const dx = direction === 'left' ? -1 : direction === 'right' ? 1 : 0
      const dy = direction === 'up' ? -1 : direction === 'down' ? 1 : 0
      if (heldSince[direction] === undefined) {
        heldSince[direction] = now
        lastRepeat[direction] = now
        handlersRef.current.onMove(dx, dy)
        return
      }
      const held = now - heldSince[direction]!
      const sinceRepeat = now - lastRepeat[direction]!
      if (held > REPEAT_DELAY_MS && sinceRepeat > REPEAT_RATE_MS) {
        lastRepeat[direction] = now
        handlersRef.current.onMove(dx, dy)
      }
    }

    const poll = () => {
      const now = performance.now()
      const pads = navigator.getGamepads ? navigator.getGamepads() : []
      const pad = Array.from(pads).find((p) => p !== null)

      if (pad) {
        const axisX = pad.axes[0] ?? 0
        const axisY = pad.axes[1] ?? 0
        fireDirection('left', pad.buttons[14]?.pressed || axisX < -DEADZONE, now)
        fireDirection('right', pad.buttons[15]?.pressed || axisX > DEADZONE, now)
        fireDirection('up', pad.buttons[12]?.pressed || axisY < -DEADZONE, now)
        fireDirection('down', pad.buttons[13]?.pressed || axisY > DEADZONE, now)

        const confirm = pad.buttons[0]?.pressed ?? false
        if (confirm && !prevConfirm) handlersRef.current.onConfirm()
        prevConfirm = confirm

        const back = pad.buttons[1]?.pressed ?? false
        if (back && !prevBack) handlersRef.current.onBack()
        prevBack = back
      }

      rafId = requestAnimationFrame(poll)
    }
    rafId = requestAnimationFrame(poll)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') handlersRef.current.onMove(0, -1)
      else if (event.key === 'ArrowDown') handlersRef.current.onMove(0, 1)
      else if (event.key === 'ArrowLeft') handlersRef.current.onMove(-1, 0)
      else if (event.key === 'ArrowRight') handlersRef.current.onMove(1, 0)
      else if (event.key === 'Enter') handlersRef.current.onConfirm()
      else if (event.key === 'Escape') handlersRef.current.onBack()
      else return
      event.preventDefault()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [active])
}
