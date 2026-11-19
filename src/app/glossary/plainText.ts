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
const MATH_SYMBOLS: Record<string, string> = {
  alpha: 'α',
  beta: 'β',
  sigma: 'σ',
  Sigma: 'Σ',
  Pi: 'Π',
  Theta: 'Θ',
  Delta: 'Δ',
  neg: '¬',
  emptyset: '∅',
  tau: 'τ',
  epsilon: 'ε',
  Gamma: 'Γ',
  in: '∈',
  notin: '∉',
  subseteq: '⊆',
  succeq: '⪰',
  cup: '∪',
  cap: '∩',
  bigcup: '⋃',
  setminus: '∖',
  times: '×',
  mid: '|',
  forall: '∀',
  exists: '∃',
  leq: '≤',
  geq: '≥',
  neq: '≠',
  to: '→',
  mapsto: '↦',
  leftarrow: '←',
  vdash: '⊢',
  top: '⊤',
  langle: '⟨',
  rangle: '⟩',
  ldots: '…',
  sum: '∑',
  prod: '∏',
  sqcap: '⊓',
  curlywedge: '⋏',
  curlyvee: '⋎',
  downarrow: '↓',
  theta: 'θ',
  oplus: '⊕',
  colon: ':',
  circ: '∘',
  bigcap: '⋂',
  lvert: '|',
  rvert: '|',
  le: '≤',
  subsetneq: '⊊',
  supseteq: '⊇',
  preceq: '⪯',
  ell: 'ℓ',
  bot: '⊥',
  ast: '*',
  leftrightarrow: '↔',
  cdot: '·',
  infty: '∞',
  parallel: '∥',
  min: 'min',
  log: 'log',
}
const SUBSCRIPTS: Record<string, string> = Object.fromEntries(
  [...'0123456789+-aehijklmnoprstuvx'].map((c, i) => [c, '₀₁₂₃₄₅₆₇₈₉₊₋ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ'[i]!]),
)
const SUPERSCRIPTS: Record<string, string> = Object.fromEntries(
  [...'0123456789+-abcdefghijklmnoprstuvwxyzABDEGHIJKLMNOPRTUW'].map((c, i) => [
    c,
    [...'⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖʳˢᵗᵘᵛʷˣʸᶻᴬᴮᴰᴱᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾᴿᵀᵁᵂ'][i]!,
  ]),
)

// Unicode sub/superscript for single characters and numbers; words stay plain, since most
// letters lack a Unicode form and a mix (βₚᵣ next to βad) looks inconsistent. A single letter
// without one keeps its operator, so σ_F doesn't read as "σF".
function script(text: string, op: string, table: Record<string, string>): string {
  const chars = [...text]
  const convertible = chars.length === 1 || /^[0-9+-]+$/.test(text)
  if (convertible && chars.every((c) => c in table)) return chars.map((c) => table[c]).join('')
  return chars.length === 1 && /\p{L}/u.test(text) ? `${op}${text}` : text
}

/** Renders `$…$` LaTeX as Unicode text, for plain-text contexts like the page title. */
export function plainText(text: string): string {
  return text.replace(/\$([^$]*)\$/g, (_, math: string) =>
    math
      .replace(/\\([{}])/g, (_, brace: string) => (brace === '{' ? '\uE000' : '\uE001'))
      .replace(/\\[ ,;:!]/g, ' ')
      .replace(/\\([a-zA-Z]+)/g, (_, name: string) => MATH_SYMBOLS[name] ?? '')
      .replace(/([_^])(?:\{((?:[^{}]|\{[^{}]*\})*)\}|([^{}\s]))/g, (_, op, group, single) =>
        script((group ?? single).replace(/[{}]/g, ''), op, op === '_' ? SUBSCRIPTS : SUPERSCRIPTS),
      )
      .replace(/[{}]/g, '')
      .replace(/\uE000/g, '{')
      .replace(/\uE001/g, '}'),
  )
}
