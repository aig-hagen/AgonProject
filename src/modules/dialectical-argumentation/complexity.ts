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
import { complete, type ComplexityTable, member, trivial } from '@/modules/common/complexity/types'
import {
  BESWW13,
  BT25,
  DD18,
  KDVV22,
  KW24,
  SW15,
  SW26,
} from '@/modules/common/publications/publications'
import { KNOWN_SEMANTIC_GROUPS } from '@/modules/dialectical-argumentation/evaluation/tweetyProject'

// Sources: literature/notes/complexity-adf.md and complexity-additions.md, checked in
// verification-af-newer-adf.md. SW15 and SW26 were read as manuscripts, so they cite numbered
// results only. ST is Brewka et al.'s stable semantics, i.e. SW15's ultimate variant.
const dd18 = 'Table 10, p. 675'
const dd18Bipolar = 'Table 11, p. 678'
const trivialModel = { derived: 'The trivial interpretation (all statements u) qualifies.' }

export const adfComplexity: ComplexityTable = {
  overviewKey: 'complexityADF',
  groups: KNOWN_SEMANTIC_GROUPS.map((group) => ({
    label: group.displayName,
    keys: group.semantics.map((semantics) => semantics.tooltipId ?? semantics.key),
  })),
  rows: {
    adfCF: {
      ver: complete('classNP', SW15, 'Prop. 4.1'),
      cred: complete('classNP', SW15, 'Prop. 4.4'),
      skept: trivial(SW15, 'Table 2'),
      exist: trivial(SW15, 'Thm. 3.6', trivialModel),
      ne: complete('classNP', SW15, 'Prop. 4.2'),
    },
    adfNA: {
      ver: complete('classDP', SW15, 'Prop. 4.6'),
      cred: complete('classNP', SW15, 'Cor. 4.5'),
      skept: complete('classPi2P', SW15, 'Prop. 4.7'),
      exist: trivial(SW15, 'Thm. 3.6', {
        derived: 'A naive interpretation exists since the trivial one is conflict-free.',
      }),
      ne: complete('classNP', SW15, 'Cor. 4.3'),
    },
    adfADM: {
      ver: complete('classCoNP', SW15, 'Prop. 4.10'),
      cred: complete('classSigma2P', SW15, 'Prop. 4.19'),
      skept: trivial(SW15, 'Table 2'),
      exist: trivial(DD18, dd18),
      ne: complete('classSigma2P', SW15, 'Thm. 4.15'),
    },
    adfCO: {
      ver: complete('classDP', SW15, 'Prop. 4.11'),
      cred: complete('classSigma2P', SW15, 'Prop. 4.19'),
      skept: complete('classCoNP', SW15, 'Cor. 4.21'),
      exist: trivial(DD18, dd18),
      ne: complete('classSigma2P', SW15, 'Cor. 4.16'),
    },
    adfGR: {
      ver: complete('classDP', SW15, 'Thm. 4.14'),
      cred: complete('classCoNP', SW15, 'Prop. 4.20'),
      skept: complete('classCoNP', SW15, 'Prop. 4.20'),
      exist: trivial(DD18, dd18),
      ne: complete('classCoNP', SW15, 'Prop. 4.17'),
    },
    adfPR: {
      ver: complete('classPi2P', SW15, 'Prop. 4.18'),
      cred: complete('classSigma2P', SW15, 'Prop. 4.19'),
      skept: complete('classPi3P', SW15, 'Thm. 4.22'),
      exist: trivial(DD18, dd18),
      ne: complete('classSigma2P', SW15, 'Cor. 4.16'),
    },
    adfST: {
      ver: complete('classCoNP', SW15, 'Prop. 4.25'),
      cred: complete('classSigma2P', SW15, 'Prop. 4.29'),
      skept: complete('classPi2P', SW15, 'Prop. 4.30'),
      exist: complete('classSigma2P', SW15, 'Thm. 4.28'),
      ne: complete('classSigma2P', SW15, 'Thm. 4.28; Table 2'),
    },
    adfMOD2: {
      ver: member('classP', SW15, 'Table 2'),
      cred: complete('classNP', SW15, 'Cor. 4.26'),
      skept: complete('classCoNP', SW15, 'Cor. 4.26'),
      exist: complete('classNP', BESWW13, 'Prop. 5, p. 806'),
    },
    adfMOD3: {
      exist: trivial(BT25, 'p. 4366', trivialModel),
    },
    adfIS: {
      ver: complete('classDP', SW26, 'Thm. 1'),
      cred: complete('classSigma2P', BT25, 'Thm. 7, p. 4371'),
      skept: complete('classPi2P', BT25, 'Thm. 7, p. 4371'),
      exist: complete('classSigma2P', BT25, 'Thm. 7, p. 4371'),
      ne: complete('classSigma2P', BT25, 'Thm. 7, p. 4371'),
    },
    adfSAD: {
      ver: complete('classCoNP', KDVV22, 'Thm. 3, p. 206'),
      cred: complete('classCoNP', KDVV22, 'Thm. 1, p. 205'),
      skept: trivial(KDVV22, 'Thm. 2, p. 205'),
      exist: trivial(KDVV22, 'p. 205', trivialModel),
      ne: complete('classCoNP', KDVV22, 'p. 205; SW15 Prop. 4.17', {
        derived:
          'The grounded interpretation is the greatest strongly admissible one, so this is grounded non-trivial existence.',
      }),
    },
    adfSST: {
      ver: member('classPi2P', KW24, 'Thm. 2, p. 115', { comment: 'hardness open' }),
      cred: complete('classSigma3P', KW24, 'Thms. 3–4, pp. 115, 119'),
      skept: complete('classPi3P', KW24, 'Thm. 5, p. 119'),
    },
    adfS2V: {
      ver: complete('classPi2P', KW24, 'Thm. 1, p. 114'),
      cred: complete('classSigma3P', KW24, 'Thms. 3–4, pp. 115, 119'),
      skept: complete('classPi3P', KW24, 'Thm. 5, p. 119'),
      exist: trivial(KW24, 'Sect. 1, p. 110', {
        derived: 'Every ADF has a semi-two-valued interpretation.',
      }),
    },
  },
  variant: {
    label: 'bipolar',
    rows: {
      adfCF: {
        ver: member('classP', SW15, 'Cor. 5.2'),
        cred: member('classP', SW15, 'Cor. 5.2'),
        skept: trivial(SW15, 'Table 3'),
        ne: member('classP', SW15, 'Prop. 5.4'),
      },
      adfNA: {
        ver: member('classP', SW15, 'Cor. 5.2'),
        cred: member('classP', SW15, 'Cor. 5.2'),
        skept: complete('classCoNP', SW15, 'Prop. 5.5'),
        ne: member('classP', SW15, 'Prop. 5.4'),
      },
      adfADM: {
        ver: member('classP', SW15, 'Cor. 5.2'),
        cred: complete('classNP', SW15, 'Cor. 5.2; Prop. 5.3'),
        skept: trivial(SW15, 'Table 3'),
        exist: trivial(DD18, dd18Bipolar),
        ne: complete('classNP', SW15, 'Cor. 5.2; Prop. 5.3'),
      },
      adfCO: {
        ver: member('classP', SW15, 'Cor. 5.2'),
        cred: complete('classNP', SW15, 'Cor. 5.2; Prop. 5.3'),
        skept: member('classP', SW15, 'Cor. 5.2'),
        exist: trivial(DD18, dd18Bipolar),
        ne: complete('classNP', SW15, 'Cor. 5.2; Prop. 5.3'),
      },
      adfGR: {
        ver: member('classP', SW15, 'Cor. 5.2'),
        cred: member('classP', SW15, 'Cor. 5.2'),
        skept: member('classP', SW15, 'Cor. 5.2'),
        exist: trivial(DD18, dd18Bipolar),
        ne: member('classP', SW15, 'Cor. 5.2'),
      },
      adfPR: {
        ver: complete('classCoNP', SW15, 'Cor. 5.2; Prop. 5.3'),
        cred: complete('classNP', SW15, 'Cor. 5.2; Prop. 5.3'),
        skept: complete('classPi2P', SW15, 'Cor. 5.2; Prop. 5.3'),
        exist: trivial(DD18, dd18Bipolar),
        ne: complete('classNP', SW15, 'Cor. 5.2; Prop. 5.3'),
      },
      adfST: {
        ver: member('classP', SW15, 'Prop. 5.6'),
        cred: complete('classNP', SW15, 'Cor. 5.7'),
        skept: complete('classCoNP', SW15, 'Cor. 5.7'),
        exist: complete('classNP', SW15, 'Prop. 5.6'),
        ne: complete('classNP', SW15, 'Prop. 5.6'),
      },
      adfMOD2: {
        ver: member('classP', SW15, 'Prop. 5.6'),
        cred: complete('classNP', SW15, 'Cor. 5.7'),
        skept: complete('classCoNP', SW15, 'Cor. 5.7'),
        exist: complete('classNP', SW15, 'Prop. 5.6'),
        ne: complete('classNP', SW15, 'Prop. 5.6'),
      },
    },
  },
}
