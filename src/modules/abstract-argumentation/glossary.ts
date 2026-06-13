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
 * along with this program, if not, see <https://www.gnu.org/licenses/>.
 */
import {
  BGG05,
  BT22,
  C06,
  C07,
  C14,
  D95,
  DG16,
  DMT07,
  T23,
  V96,
  XC18,
} from '@/modules/common/tooltip/publications'
import type { TooltipRegistry } from '@/modules/common/tooltip/tooltipRegistry'

export const abstractArgumentationGlossary: TooltipRegistry = {
  // General

  defends: {
    label: 'defends',
    title: 'Defence',
    content: ['A set of arguments $S$ defends an argument $a$ iff for every argument $b$ attacking $a$, there is some argument $c \\in S$ attacking $b$.'],
  },

  attackedSet: {
    label: '$S^+$',
    title: 'Attacked Arguments',
    content: ['The set of arguments attacked by $S$, i.e. $S^+ = \\{ a \\in A \\mid \\exists b \\in S: (b,a) \\in R \\}$'],
  },

  attackersSet: {
    label: '$S^-$',
    title: 'Attacking Arguments',
    content: ['The set of arguments attacking $S$, i.e. $S^- = \\{ a \\in A \\mid \\exists b \\in S: (a,b) \\in R \\}$'],
  },

  reduct: {
    label: 'reduct',
    title: '$S$-Reduct',
    content: ['The reduct of $F$ with respect to $S$ is the argumentation framework $F^S = (A \\setminus (S \\cup S^+), R \\cap (A\' \\times A\'))$.'],
  },

  // Extension semantics
  CF: {
    label: 'conflict-free',
    title: 'Conflict-Freeness',
    content: ['A set of arguments $E$ is conflict-free iff for all arguments $a,b \\in E$ we have that $(a,b) \\notin R$.'],
    reference: D95,
  },
  ADM: {
    label: 'admissible',
    title: 'Admissibility',
    content: ['A set of arguments $E$ is admissible iff $E$ is ', { ref: 'CF' }, ' and ', { ref: 'defends' }, ' every argument $a \\in E$.'],
    reference: D95,
  },
  CO: {
      label: 'complete',
    title: 'Complete Semantics',
    content: ['A set of arguments $E$ is a complete extension iff $E$ is ', { ref: 'ADM' }, ' and for every argument $a \\in A$ ', { ref: 'defends', label: 'defended' }, ' by $E$, we have that $a \\in E$.'],
    reference: D95,
  },
  GR: {
    label: 'grounded',
    title: 'Grounded Semantics',
    content: ['A set of arguments $E$ is a grounded extension iff $E$ is ', { ref: 'CO' }, ' and $\\subseteq$-minimal.'],
    reference: D95,
  },
  PR: {
    label: 'preferred',
    title: 'Preferred Semantics',
    content: ['A set of arguments $E$ is a preferred extension iff $E$ is ', { ref: 'CO' }, ' and $\\subseteq$-maximal.'],
    reference: D95,
  },
  ST: {
    label: 'stable',
    title: 'Stable Semantics',
    content: ['A set of arguments $E$ is a stable extension iff $E$ is ', { ref: 'CF' }, ' and we have that $E \\cup$ ', { ref: 'attackedSet', label: '$E^+$' }, ' $= A$.'],
    reference: D95,
  },
  SAD: {
    label: 'strongly admissible',
    title: 'Strong Admissibility',
    content: ['A set of arguments $E$ is strongly admissible iff $E=\\emptyset$ or each $a \\in E$ is ', { ref: 'defends', label: 'defended' }, ' by some strongly admissible $E\' \\subseteq E \\setminus \\{a\\}$.'],
    reference: C14,
  },
  SST: {
    label: 'semi-stable',
    title: 'Semi-Stable Semantics',
    content: ['A set of arguments $E$ is a semi-stable extension iff $E$ is ', { ref: 'CO' }, ' and $E \\cup $', { ref: 'attackedSet', label: '$E^+$' }, ' is $\\subseteq$-maximal.'],
    reference: C06,
  },
  ID: {
    label: 'ideal',
    title: 'Ideal Semantics',
    content: ['The ideal extension is the $\\subseteq$-maximal ', { ref: 'ADM' }, ' set in the intersection of all ', { ref: 'PR' }, ' extensions.'],
    reference: DMT07,
  },
  EA: {
    label: 'eager',
    title: 'Eager Semantics',
    content: ['The eager extension is the $\\subseteq$-maximal ', { ref: 'ADM' }, ' set in the intersection of all ', { ref: 'SST' }, ' extensions.'],
    reference: C07,
  },
  IS: {
    label: 'initial',
    title: 'Initial Sets',
    content: ['A set of arguments $E$ is initial iff $E$ is non-empty, ', { ref: 'ADM' }, ' and $\\subseteq$-minimal.'],
    reference: XC18,
  },
  UC: {
    label: 'unchallenged',
    title: 'Unchallenged Semantics',
    content: ['Unchallenged extensions are defined via serialisation by exhaustively selecting only unattacked and unchallenged initial sets.'],
    reference: BT22,
  },
  NA: {
    label: 'naive',
    title: 'Naive Semantics',
    content: ['A set of arguments $E$ is naive iff $E$ is a $\\subseteq$-maximal ', { ref: 'CF' }, ' set.'],
  },
  STG: {
    label: 'stage',
    title: 'Stage Semantics',
    content: ['A set of arguments $E$ is a stage extension iff $E$ is ', { ref: 'CF' }, ' and $E \\cup $', { ref: 'attackedSet', label: '$E^+$' }, ' is $\\subseteq$-maximal.'],
    reference: V96,
  },
  STG2: {
    label: 'stage2',
    title: 'Stage2 Semantics',
    content: ['The stage2 extensions are defined via the SCC-recursive schema with the ', { ref: 'STG' }, ' semantics as the base function.'],
    reference: DG16,
  },
  CF2: {
    label: 'CF2',
    title: 'CF2 Semantics',
    content: ['The CF2-extensions are defined via the SCC-recursive schema with the ', { ref: 'NA' }, ' semantics as the base function.'],
    reference: BGG05,
  },
  UD: {
    label: 'undisputed',
    title: 'Undisputed Sets',
    content: ['A set of arguments $E$ is undisputed iff $E$ is ', { ref: 'CF' }, ' in $F$ and the ', { ref: 'reduct' }, ' $F^E$ contains no non-empty ', { ref: 'ADM' }, ' set.'],
    reference: T23,
  },
  SUD: {
    label: 'strongly undisputed',
    title: 'Strongly Undisputed Sets',
    content: ['A set of arguments $E$ is strongly undisputed iff $E$ is ', { ref: 'CF' }, ' in $F$ and the ', { ref: 'reduct' }, ' $F^E$ contains no non-empty ', { ref: 'UD' }, ' set.'],
    reference: T23,
  },
}
