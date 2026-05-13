const isMac = navigator.platform.indexOf('Mac') >= 0

export interface Shortcut {
  name: string
  key: string
  modifiers: {
    meta: boolean
    ctrl: boolean
    shift: boolean
  }
}

export const UNDO_SHORTCUT: Shortcut = {
  name: 'Undo',
  key: 'z',
  modifiers: {
    meta: isMac,
    ctrl: !isMac,
    shift: false,
  },
}

export const REDO_SHORTCUT: Shortcut = {
  name: 'Redo',
  key: 'z',
  modifiers: {
    meta: isMac,
    ctrl: !isMac,
    shift: true,
  },
}

export const shortcuts = [UNDO_SHORTCUT, REDO_SHORTCUT]

export function isShortcut(shortcut: Shortcut, event: KeyboardEvent) {
  return (
    shortcut.key === event.key &&
    shortcut.modifiers.meta === event.metaKey &&
    shortcut.modifiers.ctrl === event.ctrlKey &&
    shortcut.modifiers.shift === event.shiftKey
  )
}
