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
import { H12, LON11 } from '@/modules/common/publications/publications'
import type { TooltipRegistry } from '@/modules/common/tooltip/tooltipRegistry'

export const probabilisticArgumentationGlossary: TooltipRegistry = {
  PAF: {
    label: 'PAF',
    title: 'Probabilistic Argumentation Framework (PAF)',
    content: [
      'A probabilistic argumentation framework is a tuple $(A, R, P)$ such that $(A, R)$ is an ',
      { ref: 'AF' },
      ' and $P : A \\cup R \\to (0,1]$ assigns each ',
      { ref: 'argumentProbability', label: 'argument' },
      ' and ',
      { ref: 'attackProbability', label: 'attack' },
      ' the probability that it is present. We consider semantics under  the ',
      { ref: 'constellations' },
      '.',
    ],
    reference: LON11,
  },

  constellations: {
    label: 'constellation approach',
    title: 'Constellation Approach',
    content: [
      'The constellation approach models uncertainty about which arguments and attacks are present. The probabilities of a ',
      { ref: 'PAF' },
      ' induce a ',
      { ref: 'subframeworkProbability', label: 'probability distribution' },
      ' over all its ',
      { ref: 'subframework', label: 'subframeworks' },
      ', and an argument is evaluated by how likely it is to be accepted in them.',
    ],
    reference: H12,
  },

  subframework: {
    label: 'subframework',
    title: 'Subframework',
    content: [
      'A subframework of a ',
      { ref: 'PAF' },
      " $(A, R, P)$ is an AF $F' = (A', R')$ with $A' \\subseteq A$ and $R' \\subseteq R \\cap (A' \\times A')$, i.e., an attack can only be present if both of its arguments are.",
    ],
    reference: LON11,
  },

  subframeworkProbability: {
    label: 'subframework probability',
    title: 'Subframework Probability',
    content: [
      'Assuming independence, the probability of a ',
      { ref: 'subframework' },
      " $F' = (A', R')$ is $P(F') = \\prod_{a \\in A'} P(a) \\prod_{a \\in A \\setminus A'} (1 - P(a)) \\prod_{r \\in R'} P(r) \\prod_{r \\in R_{A'} \\setminus R'} (1 - P(r))$, where $R_{A'} = R \\cap (A' \\times A')$.",
    ],
    reference: LON11,
  },

  credulousAcceptanceProbability: {
    label: 'credulous acceptance probability',
    title: 'Credulous Acceptance Probability',
    content: [
      'The probability that $a$ is ',
      { ref: 'credulousAcceptance', label: 'credulously accepted' },
      ' under $\\sigma$ is the sum of the ',
      { ref: 'subframeworkProbability', label: 'probabilities' },
      " of all subframeworks $F'$ in which $a$ is credulously accepted: $P_\\sigma(a) = \\sum_{F' : a \\in \\bigcup \\sigma(F')} P(F')$.",
    ],
    reference: H12,
  },

  skepticalAcceptanceProbability: {
    label: 'skeptical acceptance probability',
    title: 'Skeptical Acceptance Probability',
    content: [
      'The probability that $a$ is ',
      { ref: 'skepticalAcceptance', label: 'skeptically accepted' },
      ' under $\\sigma$ is the sum of the ',
      { ref: 'subframeworkProbability', label: 'probabilities' },
      " of all subframeworks $F'$ in which $a$ is skeptically accepted: $P_\\sigma(a) = \\sum_{F' : a \\in \\bigcap \\sigma(F')} P(F')$.",
    ],
    reference: H12,
  },

  argumentProbability: {
    label: 'argument probability',
    title: 'Argument Probability',
    content: [
      'Each argument $a$ in a ',
      { ref: 'PAF' },
      ' is assigned a probability $P(a) \\in (0,1]$ representing the degree of belief in the existence or validity of $a$.',
    ],
  },

  attackProbability: {
    label: 'attack probability',
    title: 'Attack Probability',
    content: [
      'Each attack $(a, b)$ in a ',
      { ref: 'PAF' },
      ' is assigned a probability $P(a,b) \\in (0,1]$ representing the degree of belief in the attack being present.',
    ],
  },

  exactInference: {
    label: 'exact inference',
    title: 'Exact Inference',
    content: [
      'The acceptance probabilities are computed by enumerating all ',
      { ref: 'subframework', label: 'subframeworks' },
      ' of the ',
      { ref: 'PAF' },
      '. Exact, but exponential in the number of arguments and attacks.',
    ],
  },

  approximateInference: {
    label: 'approximate inference',
    title: 'Approximate Inference',
    content: [
      'The acceptance probabilities are approximated via a Monte Carlo algorithm that samples 1,000 ',
      { ref: 'subframework', label: 'subframeworks' },
      ' of the ',
      { ref: 'PAF' },
      ' and counts how often the argument is accepted.',
    ],
  },
}
