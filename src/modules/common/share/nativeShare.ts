/*
 * AgonProject - The platform to explore different approaches to formal argumentation.
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
/**
 * Whether this device should hand share links to the native Web Share sheet
 * (WhatsApp, email, …) instead of copying to the clipboard. Gated to touch
 * devices so desktop keeps its clipboard-copy behavior; callers fall back to
 * clipboard copy whenever this is false or a share attempt fails.
 */
export function supportsNativeShare(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: coarse)').matches
  )
}

/** Narrower check that also confirms the given payload can be shared. */
export function canNativeShare(data: ShareData): boolean {
  if (!supportsNativeShare()) return false
  return typeof navigator.canShare !== 'function' || navigator.canShare(data)
}
