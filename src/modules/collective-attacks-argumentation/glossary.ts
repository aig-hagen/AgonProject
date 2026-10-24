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
import { BBR25, BKU24, NP06 } from '@/modules/common/tooltip/publications'
import type { TooltipRegistry } from '@/modules/common/tooltip/tooltipRegistry'

export const collectiveAttacksArgumentationGlossary: TooltipRegistry = {
  SetAF: {
    label: 'SetAF',
    title: 'Argumentation Framework with Collective Attacks (SetAF)',
    content: [
      'An argumentation framework with collective attacks $S$ is a tuple $(A, R)$, where $A$ is a finite set of arguments and $R \\subseteq (2^A \\setminus \\{\\emptyset\\}) \\times A$ is the attack relation.',
    ],
    reference: NP06,
  },

  collectiveAttack: {
    label: 'collective attack',
    title: 'Collective Attack',
    content: [
      'A collective attack $(T, h) \\in R$ in a ',
      { ref: 'SetAF' },
      ' means that the set of arguments $T$ jointly attacks argument $h$. Hence, the attack is only successful if all members of $T$ are accepted.',
    ],
    reference: NP06,
  },

  // Strong and weak semantics as in Blümel et al. (2024) and Berthold et al. (2025).
  setafRange: {
    label: '$E^\\oplus_R$',
    title: 'Range (SetAF)',
    content: [
      'For a set of arguments $E$, $E^+_R = \\{h \\in A \\mid \\exists (T, h) \\in R : T \\subseteq E\\}$ and $E^\\oplus_R = E \\cup E^+_R$.',
    ],
    reference: BKU24,
  },

  setafReduct: {
    label: 'reduct',
    title: '$E$-Reduct (SetAF)',
    content: [
      'Given a ',
      { ref: 'SetAF' },
      " $S = (A, R)$ and $E \\subseteq A$, the $E$-reduct of $S$ is the SetAF $S^E = (A', R')$, with $A' = A \\setminus$ ",
      { ref: 'setafRange', label: '$E^\\oplus_R$' },
      " and $R' = \\{(T \\setminus E, h) \\mid (T, h) \\in R,\\ T \\cap E^+_R = \\emptyset,\\ T \\not\\subseteq E,\\ h \\in A'\\}$.",
    ],
    reference: BKU24,
  },

  setafSAD: {
    label: 'strongly admissible',
    title: 'Strong Admissibility (SetAF)',
    content: [
      "A set of arguments $E \\subseteq A$ is strongly defended ($E \\in \\mathsf{sd}(S)$) iff $E$ is conflict-free and for every $a \\in E$ there exists a strongly defended subset $E' \\subseteq E \\setminus \\{a\\}$, which defends $a$. $E$ is strongly admissible ($E \\in \\mathsf{sad}(S)$) iff $E \\in \\mathsf{sd}(S)$ and $E$ is closed.",
    ],
    reference: BBR25,
  },

  setafWAD: {
    label: 'weakly admissible',
    title: 'Weak Admissibility (SetAF)',
    content: [
      'A set of arguments $E \\subseteq A$ is weakly admissible in $S$ ($E \\in \\mathsf{wad}(S)$) iff (1) $E \\in \\mathsf{cf}(S)$, and (2) for each $(T, h) \\in R$ with $h \\in E$ and $T \\cap$ ',
      { ref: 'setafRange', label: '$E^+_R$' },
      " $= \\emptyset$ there is no $E' \\in \\mathsf{wad}($",
      { ref: 'setafReduct', label: '$S^E$' },
      ") such that $T \\cap A' \\subseteq E'$.",
    ],
    reference: BKU24,
  },

  setafWeakDefence: {
    label: 'weak defence',
    title: 'Weak Defence (SetAF)',
    content: [
      "A set of arguments $E$ weakly defends $X \\subseteq A$ if for each $(T, h) \\in R$ with $h \\in X$, one of the following two conditions holds: $E$ attacks $T$, or simultaneously (1) there is no $E' \\in \\mathsf{wad}($",
      { ref: 'setafReduct', label: '$S^E$' },
      ") with $T \\subseteq E \\cup E'$, and (2) there is some $X'$ such that $X \\subseteq X' \\in$ ",
      { ref: 'setafWAD', label: '$\\mathsf{wad}(S)$' },
      '.',
    ],
    reference: BKU24,
  },

  setafWCO: {
    label: 'weakly complete',
    title: 'Weakly Complete Semantics (SetAF)',
    content: [
      'A set $E \\in$ ',
      { ref: 'setafWAD', label: '$\\mathsf{wad}(S)$' },
      ' is weakly complete ($E \\in \\mathsf{wco}(S)$) iff for each $X \\supseteq E$ such that $E$ ',
      { ref: 'setafWeakDefence', label: 'weakly defends' },
      ' $X$, we have $E = X$.',
    ],
    reference: BKU24,
  },

  setafWPR: {
    label: 'weakly preferred',
    title: 'Weakly Preferred Semantics (SetAF)',
    content: [
      'A set $E$ is weakly preferred ($E \\in \\mathsf{wpr}(S)$) iff $E$ is maximal w.r.t. $\\subseteq$ in ',
      { ref: 'setafWAD', label: '$\\mathsf{wad}(S)$' },
      '.',
    ],
    reference: BKU24,
  },

  setafWGR: {
    label: 'weakly grounded',
    title: 'Weakly Grounded Semantics (SetAF)',
    content: [
      'A set $E$ is weakly grounded ($E \\in \\mathsf{wgr}(S)$) iff $E$ is minimal w.r.t. $\\subseteq$ in ',
      { ref: 'setafWCO', label: '$\\mathsf{wco}(S)$' },
      '.',
    ],
    reference: BKU24,
  },
}
