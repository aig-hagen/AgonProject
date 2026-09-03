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
 * Inline HTML snippets for tutorial step bodies. `action` styles a gesture/keyboard hint;
 * `barAction` renders a selection action-bar button reference with its heroicon, so the text
 * matches what the user sees in the action bar.
 */

// Heroicon (24/outline) path data for the action-bar buttons referenced in tutorials.
const icons = {
  rename:
    'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10',
  switch: 'M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
  delete:
    'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
  probability:
    'M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75',
  condition:
    'M4.745 3A23.933 23.933 0 0 0 3 12c0 3.183.62 6.22 1.745 9M19.5 3c.967 2.78 1.5 5.817 1.5 9s-.533 6.22-1.5 9M8.25 8.885l1.444-.89a.75.75 0 0 1 1.105.402l2.402 7.206a.75.75 0 0 0 1.104.401l1.445-.889m-8.25.75.213.09a1.687 1.687 0 0 0 2.062-.617l4.45-6.676a1.688 1.688 0 0 1 2.062-.618l.213.09',
  // ChevronDownIcon — the collapse control on the mobile evaluation sheet.
  collapse: 'm19.5 8.25-7.5 7.5-7.5-7.5',
  // PlusCircleIcon — the "Add to attack" action-bar button for collective attacks (touch).
  add: 'M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
} as const

type IconName = keyof typeof icons | 'extension'

const svg = (d: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="size-3.5"><path d="${d}"/></svg>`

// SigmaIcon — the Extension Semantics button uses the sigma glyph (σ, the literature
// symbol for a semantics), outlined from STIX Two Text Italic to a path so it renders
// identically everywhere. Keep in sync with SigmaIcon.vue.
const sigmaGlyph = `<svg viewBox="0 0 24 24" class="size-3.5" fill="currentColor"><path d="M9.02 19Q7.5 19 6.58 18.44Q5.66 17.88 5.19 17Q4.71 16.13 4.55 15.16Q4.4 14.2 4.4 13.42Q4.4 11.73 4.87 10.22Q5.34 8.71 6.31 7.54Q7.27 6.38 8.71 5.7Q10.15 5.03 12.07 5.03Q12.47 5.03 13.15 5.04Q13.83 5.06 14.59 5.09Q15.35 5.11 15.98 5.11Q16.47 5.11 16.94 5.1Q17.42 5.09 17.88 5.07Q18.34 5.06 18.76 5.03Q19.17 5 19.55 5L19.6 5.4Q19.52 5.83 19.19 6.31Q18.86 6.78 18.2 7.13Q17.53 7.47 16.44 7.47Q16.07 7.47 15.69 7.46Q15.32 7.44 14.9 7.43Q14.49 7.41 13.97 7.41Q13.25 7.41 12.55 7.39Q11.84 7.36 11.58 7.36Q10.06 7.36 8.74 7.98Q7.41 8.59 6.61 9.83Q5.8 11.07 5.8 12.93Q5.8 14.98 6.78 15.79Q7.76 16.61 9.23 16.61Q10.4 16.61 11.58 16.1Q12.76 15.58 13.55 14.34Q14.34 13.11 14.34 10.92Q14.34 9.69 14.08 8.82Q13.83 7.96 13.42 7.16H14.63V7.56Q15.26 8.54 15.61 9.5Q15.95 10.46 15.95 11.73Q15.95 13.88 15 15.52Q14.06 17.16 12.49 18.08Q10.92 19 9.02 19Z"/></svg>`

/** A gesture or keyboard hint, e.g. Double-click, Right-click, Hold and drag. */
export const action = (text: string) =>
  `<kbd class="kbd kbd-sm bg-primary/10 text-primary border-primary/20">${text}</kbd>`

/** A reference to a selection action-bar button: its icon plus label. */
export const barAction = (icon: IconName, label: string) =>
  `<kbd class="kbd kbd-sm gap-1">${icon === 'extension' ? sigmaGlyph : svg(icons[icon])}${label}</kbd>`
