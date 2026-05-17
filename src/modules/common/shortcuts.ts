/*
 * Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.
 *
 * Copyright (C) 2026  Artificial Intelligence Group at the Faculty of Mathematics and Computer Science of the FernUniversität in Hagen <https://www.fernuni-hagen.de/aig/en/>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
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
