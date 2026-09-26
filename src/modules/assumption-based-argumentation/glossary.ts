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
import { CFST18 } from '@/modules/common/tooltip/publications'
import type { TooltipRegistry } from '@/modules/common/tooltip/tooltipRegistry'

// Notation follows Berthold, Rapberger & Ulbricht (KR 2024).
export const assumptionBasedArgumentationGlossary: TooltipRegistry = {
  ABAF: {
    label: 'ABAF',
    title: 'Assumption-based Argumentation Framework (ABAF)',
    content: [
      'An ABA framework is a tuple $D = (\\mathcal{L}, \\mathcal{R}, \\mathcal{A}, \\overline{\\phantom{a}})$, where $(\\mathcal{L}, \\mathcal{R})$ is a ',
      { ref: 'abaDeductiveSystem', label: 'deductive system' },
      ', $\\mathcal{A} \\subseteq \\mathcal{L}$ a set of ',
      { ref: 'abaAssumption', label: 'assumptions' },
      ', and $\\overline{\\phantom{a}}: \\mathcal{A} \\to \\mathcal{L}$ a ',
      { ref: 'abaContrary', label: 'contrary function' },
      '.',
    ],
    reference: CFST18,
  },

  abaDeductiveSystem: {
    label: 'deductive system',
    title: 'Deductive System',
    content: [
      'A deductive system is a tuple $(\\mathcal{L}, \\mathcal{R})$, where $\\mathcal{L}$ is a set of atoms and $\\mathcal{R}$ is a set of ',
      { ref: 'abaRule', label: 'inference rules' },
      ' over $\\mathcal{L}$.',
    ],
    reference: CFST18,
  },

  abaRule: {
    label: 'rule',
    title: 'Inference Rule',
    content: [
      'A rule $r \\in \\mathcal{R}$ has the form $a_0 \\leftarrow a_1, \\ldots, a_n$ with $a_i \\in \\mathcal{L}$ for all $0 \\leq i \\leq n$; $\\mathit{head}(r) := a_0$ is the head and $\\mathit{body}(r) := \\{a_1, \\ldots, a_n\\}$ is the (possibly empty) body of $r$. A rule with an empty body, written $a_0 \\leftarrow \\top$, is a fact.',
    ],
    reference: CFST18,
  },

  abaAssumption: {
    label: 'assumption',
    title: 'Assumption',
    content: [
      'An assumption is an atom $a \\in \\mathcal{A} \\subseteq \\mathcal{L}$ that may be taken to hold by default. Each assumption $a$ has a ',
      { ref: 'abaContrary', label: 'contrary' },
      ' $\\overline{a}$; it is retracted when $\\overline{a}$ is ',
      { ref: 'abaDerivation', label: 'derived' },
      '.',
    ],
    reference: CFST18,
  },

  abaContrary: {
    label: 'contrary',
    title: 'Contrary',
    content: [
      'The contrary function $\\overline{\\phantom{a}}: \\mathcal{A} \\to \\mathcal{L}$ maps each ',
      { ref: 'abaAssumption' },
      ' $a$ to its contrary $\\overline{a} \\in \\mathcal{L}$. Deriving $\\overline{a}$ ',
      { ref: 'abaAttack', label: 'attacks' },
      ' $a$.',
    ],
    reference: CFST18,
  },

  abaDerivation: {
    label: 'tree-derivable',
    title: 'Tree-Derivability',
    content: [
      'An atom $p \\in \\mathcal{L}$ is tree-derivable from assumptions $S \\subseteq \\mathcal{A}$ and rules $R \\subseteq \\mathcal{R}$, denoted $S \\vdash_R p$, if there is a finite rooted labeled tree $t$ such that (i) the root of $t$ is labeled with $p$, (ii) the set of labels for the leaves of $t$ is $S$ or $S \\cup \\{\\top\\}$, and (iii) each non-leaf node $v$ is labeled with $\\mathit{head}(r)$ for some ',
      { ref: 'abaRule' },
      ' $r \\in R$, and the labels of its children are $\\mathit{body}(r)$, or $\\top$ if $\\mathit{body}(r) = \\emptyset$. We write $S \\vdash p$ iff $S \\vdash_R p$ for some $R \\subseteq \\mathcal{R}$.',
    ],
    reference: CFST18,
  },

  abaTh: {
    label: '$Th_D(S)$',
    title: 'Derivable Conclusions',
    content: [
      'The set of all conclusions ',
      { ref: 'abaDerivation', label: 'derivable' },
      ' from an assumption set $S$ in an ',
      { ref: 'ABAF' },
      " $D$ is $Th_D(S) := \\{p \\in \\mathcal{L} \\mid \\exists S' \\subseteq S: S' \\vdash p\\}$.",
    ],
    reference: CFST18,
  },

  abaAttack: {
    label: 'attack',
    title: 'Attack (ABA)',
    content: [
      "A set $S \\subseteq \\mathcal{A}$ attacks a set $T \\subseteq \\mathcal{A}$ if there are $S' \\subseteq S$ and $a \\in T$ such that $S' \\vdash \\overline{a}$; if $S$ attacks $\\{a\\}$ we say $S$ attacks $a$. $S$ is conflict-free if it does not attack itself.",
    ],
    reference: CFST18,
  },

  abaClosure: {
    label: 'closure',
    title: 'Closure',
    content: [
      'The closure of $S \\subseteq \\mathcal{A}$ is $cl(S) := $ ',
      { ref: 'abaTh', label: '$Th_D(S)$' },
      ' $\\cap\\, \\mathcal{A}$, i.e. the assumptions derivable from $S$. $S$ is closed if $S = cl(S)$.',
    ],
    reference: CFST18,
  },

  abaFlat: {
    label: 'flat',
    title: 'Flat ABAF',
    content: [
      'An ',
      { ref: 'ABAF' },
      ' is flat if assumptions cannot be derived, only assumed, i.e. every $S \\subseteq \\mathcal{A}$ is ',
      { ref: 'abaClosure', label: 'closed' },
      '. Otherwise it is non-flat.',
    ],
    reference: CFST18,
  },
}
