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
import { H12, LON11 } from '@/modules/common/tooltip/publications'
import type { TooltipRegistry } from '@/modules/common/tooltip/tooltipRegistry'

export const probabilisticArgumentationGlossary: TooltipRegistry = {
  PAF: {
    label: 'PAF',
    title: 'Probabilistic Argumentation Framework (PAF)',
    content: [
      'A probabilistic argumentation framework is a tuple $(A, R, P)$ such that $(A, R)$ is an ',
      { ref: 'AF' },
      ' and $P : A \\cup R \\mapsto (0,1]$ is a probability distribution.',
    ],
    reference: LON11,
  },

  constellations: {
    label: 'constellation approach',
    title: 'Constellation Approach',
    content: [
      'The constellation approach to probabilistic argumentation models uncertainty about the presence of arguments and attacks via a probability distribution over all possible subgraphs of the argumentation framework.',
    ],
    reference: H12,
  },

  argumentProbability: {
    label: 'argument probability',
    title: 'Argument Probability',
    content: [
      'Each argument $a$ in a ',
      { ref: 'PAF' },
      ' is assigned a probability $P(a) \\in [0,1]$ representing the degree of belief in the existence or validity of $a$.',
    ],
  },

  attackProbability: {
    label: 'attack probability',
    title: 'Attack Probability',
    content: [
      'Each attack $(a, b)$ in a ',
      { ref: 'PAF' },
      ' is assigned a probability $P(a,b) \\in [0,1]$ representing the degree of belief in the attack being present.',
    ],
  },

  exactInference: {
    label: 'exact inference',
    title: 'Exact Inference',
    content: [
      'The acceptance probabilities are computed by considering all subgraphs of the ',
      { ref: 'PAF' },
      ' and their corresponding probabilities.',
    ],
  },

  approximateInference: {
    label: 'approximate inference',
    title: 'Approximate Inference',
    content: [
      'The acceptance probabilities are approximated via a Monte Carlo algorithm that samples 10,000 subgraphs of the ',
      { ref: 'PAF' },
      '.',
    ],
  },
}
