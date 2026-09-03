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
 * Single source of truth for the application color palette (non-graph).
 *
 * Every app UI color is defined here once, for both light and dark mode, and
 * emitted to CSS custom properties that DaisyUI and app styles consume. Graph
 * colors are intentionally kept out of this file and are handled separately.
 *
 * The two brand anchors are fixed in light mode; their dark variants are
 * derived from the same fixed value via a documented `color-mix` recipe rather
 * than a separate magic hex, so the brand stays single-sourced.
 */

// Fixed brand anchors (AIG blue / AIG ochre).
const AIG_BLUE = '#004c97'
const AIG_OCHRE = '#d29551'

// Dark-mode brand is the fixed anchor lifted toward white so it stays legible
// on a dark surface. The blue recipe matches the existing `.menu-icon` color.
const AIG_BLUE_DARK = `color-mix(in oklab, ${AIG_BLUE}, white 55%)`
const AIG_OCHRE_DARK = `color-mix(in oklab, ${AIG_OCHRE}, white 30%)`

/** Palette token names. These map 1:1 onto DaisyUI `--color-*` variables, except
 * `selection`, which drives `::selection`. */
export type AppColorToken =
  | 'base-100'
  | 'base-200'
  | 'base-300'
  | 'base-content'
  | 'primary'
  | 'primary-content'
  | 'secondary'
  | 'secondary-content'
  | 'info'
  | 'info-content'
  | 'success'
  | 'success-content'
  | 'warning'
  | 'warning-content'
  | 'error'
  | 'error-content'
  | 'selection'
  // Keyboard focus ring, overlay scrim, and elevation shadow base color.
  | 'focus'
  | 'scrim'
  | 'shadow'

export type AppPalette = Record<AppColorToken, string>

// Light mode. Neutrals carry a faint cool (blue-gray) tint that echoes the blue
// brand. `info` deliberately aliases `primary` — informational UI is brand blue,
// not a second blue.
export const LIGHT_PALETTE: AppPalette = {
  'base-100': '#ffffff',
  'base-200': '#eef2f6',
  'base-300': '#dce4ec',
  'base-content': '#162536',
  primary: AIG_BLUE,
  'primary-content': '#ffffff',
  secondary: AIG_OCHRE,
  'secondary-content': '#2a1b08',
  info: AIG_BLUE,
  'info-content': '#ffffff',
  success: '#247a52',
  'success-content': '#ffffff',
  warning: '#b57e00',
  'warning-content': '#ffffff',
  error: '#b3263e',
  'error-content': '#ffffff',
  selection: '#c6e4fa',
  // One consistent keyboard focus color app-wide (brand blue).
  focus: AIG_BLUE,
  // Overlay scrim and elevation shadow are near-black in both modes (opacity is
  // applied at the use site); scrim carries a faint cool tint.
  scrim: '#0a141e',
  shadow: '#0b1622',
}

// Dark mode. Provisional cool-dark surfaces; exact neutral hex are tuned in the
// visual pass. Status hues are lifted for legibility on dark, with dark ink as
// their on-color.
export const DARK_PALETTE: AppPalette = {
  'base-100': '#1c2833',
  'base-200': '#17222c',
  'base-300': '#2a3a48',
  'base-content': '#e7eef4',
  primary: AIG_BLUE_DARK,
  'primary-content': '#08243a',
  secondary: AIG_OCHRE_DARK,
  'secondary-content': '#2a1b08',
  info: AIG_BLUE_DARK,
  'info-content': '#08243a',
  success: '#5fbe8c',
  'success-content': '#08281a',
  warning: '#e0a93e',
  'warning-content': '#2a1e02',
  error: '#e8798a',
  'error-content': '#2e0a12',
  selection: '#234b63',
  focus: AIG_BLUE_DARK,
  scrim: '#04080d',
  shadow: '#000000',
}

export const APP_PALETTE = { light: LIGHT_PALETTE, dark: DARK_PALETTE } as const

// Tokens that map onto DaisyUI variables (everything except `selection`).
const DAISYUI_TOKENS = (Object.keys(LIGHT_PALETTE) as AppColorToken[]).filter(
  (token) => token !== 'selection',
)

function paletteRules(palette: AppPalette): string {
  const daisy = DAISYUI_TOKENS.map((token) => `  --color-${token}: ${palette[token]};`)
  return [...daisy, `  --color-selection: ${palette.selection};`].join('\n')
}

/** Build the CSS that binds the palette to `[data-theme]` for both modes. */
export function buildPaletteCss(): string {
  return [
    `[data-theme='light'] {\n${paletteRules(LIGHT_PALETTE)}\n}`,
    `[data-theme='dark'] {\n${paletteRules(DARK_PALETTE)}\n}`,
    `::selection {\n  background-color: var(--color-selection);\n}`,
  ].join('\n\n')
}
