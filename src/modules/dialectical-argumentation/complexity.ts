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

// Sources and caveats: literature/notes/complexity.md. SW26 was read as a manuscript, so it cites
// numbered results only. ST is Brewka et al.'s stable semantics, i.e. SW15's ultimate variant.
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
      ver: complete('classNP', SW15, 'Prop. 4.1, p. 54'),
      cred: complete('classNP', SW15, 'Prop. 4.4, p. 55'),
      skept: trivial(SW15, 'Table 2, p. 68'),
      exist: trivial(SW15, 'p. 37', trivialModel),
      ne: complete('classNP', SW15, 'Prop. 4.2, p. 54'),
    },
    adfNA: {
      ver: complete('classDP', SW15, 'Prop. 4.6, p. 55'),
      cred: complete('classNP', SW15, 'Cor. 4.5, p. 55'),
      skept: complete('classPi2P', SW15, 'Prop. 4.7, p. 56'),
      exist: trivial(SW15, 'Thm. 3.6, p. 45', {
        derived: 'A naive interpretation exists since the trivial one is conflict-free.',
      }),
      ne: complete('classNP', SW15, 'Cor. 4.3, p. 55'),
    },
    adfADM: {
      ver: complete('classCoNP', BESWW13, 'Prop. 10, p. 807'),
      cred: complete('classSigma2P', SW15, 'Prop. 4.19, p. 62'),
      skept: trivial(SW15, 'Table 2, p. 68'),
      exist: trivial(BESWW13, 'p. 805'),
      ne: complete('classSigma2P', SW15, 'Thm. 4.15, p. 61'),
    },
    adfCO: {
      ver: complete('classDP', SW15, 'Prop. 4.11, p. 58'),
      cred: complete('classSigma2P', SW15, 'Prop. 4.19, p. 62'),
      skept: complete('classCoNP', SW15, 'Cor. 4.21, p. 62'),
      exist: trivial(BESWW13, 'p. 805'),
      ne: complete('classSigma2P', SW15, 'Cor. 4.16, p. 61'),
    },
    adfGR: {
      ver: complete('classDP', SW15, 'Thm. 4.14, p. 60'),
      cred: complete('classCoNP', SW15, 'Prop. 4.20, p. 62'),
      skept: complete('classCoNP', SW15, 'Prop. 4.20, p. 62'),
      exist: trivial(BESWW13, 'p. 806'),
      ne: complete('classCoNP', SW15, 'Prop. 4.17, p. 61'),
    },
    adfPR: {
      ver: complete('classPi2P', SW15, 'Prop. 4.18, p. 61'),
      cred: complete('classSigma2P', SW15, 'Prop. 4.19, p. 62'),
      skept: complete('classPi3P', SW15, 'Thm. 4.22, p. 63'),
      exist: trivial(SW15, 'Thm. 3.3, p. 44'),
      ne: complete('classSigma2P', SW15, 'Cor. 4.16, p. 61'),
    },
    adfST: {
      ver: complete('classCoNP', SW15, 'Prop. 4.25, p. 64'),
      cred: complete('classSigma2P', SW15, 'Prop. 4.29, p. 66'),
      skept: complete('classPi2P', SW15, 'Prop. 4.30, p. 66'),
      exist: complete('classSigma2P', SW15, 'Thm. 4.28, p. 65'),
      ne: complete('classSigma2P', SW15, 'Thm. 4.28, p. 65; Table 2, p. 68'),
    },
    adfMOD2: {
      ver: member('classP', BESWW13, 'Prop. 5 (proof), p. 806'),
      cred: complete('classNP', SW15, 'Cor. 4.26, p. 65'),
      skept: complete('classCoNP', SW15, 'Cor. 4.26, p. 65'),
      exist: complete('classNP', BESWW13, 'Prop. 5, p. 806'),
      ne: complete('classNP', BESWW13, 'Prop. 5, p. 806'),
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
      ne: complete('classCoNP', KDVV22, 'p. 205; SW15 Prop. 4.17, p. 61', {
        derived:
          'The grounded interpretation is the greatest strongly admissible one, so this is grounded non-trivial existence.',
      }),
    },
    adfSST: {
      ver: member('classPi2P', KW24, 'Thm. 2, p. 115', { comment: 'hardness open' }),
      cred: complete('classSigma3P', KW24, 'Thms. 3–4, pp. 115, 119'),
      skept: complete('classPi3P', KW24, 'Thm. 5, p. 119'),
      // exist: not trivial, some ADFs have none (KVV21 Prop. 4, p. 428); class open.
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
    termKey: 'adfBipolar',
    rows: {
      adfCF: {
        ver: member('classP', SW15, 'Cor. 5.2, p. 69'),
        cred: member('classP', SW15, 'Cor. 5.2, p. 69'),
        skept: trivial(SW15, 'Table 3, p. 71'),
        exist: trivial(SW15, 'p. 37'),
        ne: member('classP', SW15, 'Prop. 5.4, p. 69'),
      },
      adfNA: {
        ver: member('classP', SW15, 'Cor. 5.2, p. 69'),
        cred: member('classP', SW15, 'Cor. 5.2, p. 69'),
        skept: complete('classCoNP', SW15, 'Prop. 5.5, p. 70'),
        exist: trivial(SW15, 'Thm. 3.6, p. 45'),
        ne: member('classP', SW15, 'Prop. 5.4, p. 69'),
      },
      adfADM: {
        ver: member('classP', SW15, 'Cor. 5.2, p. 69'),
        cred: complete('classNP', SW15, 'Cor. 5.2; Prop. 5.3, p. 69'),
        skept: trivial(SW15, 'Table 3, p. 71'),
        exist: trivial(BESWW13, 'p. 805'),
        ne: complete('classNP', SW15, 'Cor. 5.2; Prop. 5.3, p. 69'),
      },
      adfCO: {
        ver: member('classP', SW15, 'Cor. 5.2, p. 69'),
        cred: complete('classNP', SW15, 'Cor. 5.2; Prop. 5.3, p. 69'),
        skept: complete('classP', DD18, dd18Bipolar),
        exist: trivial(BESWW13, 'p. 805'),
        ne: complete('classNP', SW15, 'Cor. 5.2; Prop. 5.3, p. 69'),
      },
      adfGR: {
        ver: complete('classP', DD18, dd18Bipolar),
        cred: complete('classP', DD18, dd18Bipolar),
        skept: complete('classP', DD18, dd18Bipolar),
        exist: trivial(BESWW13, 'p. 806'),
        ne: member('classP', SW15, 'Cor. 5.2, p. 69'),
      },
      adfPR: {
        ver: complete('classCoNP', SW15, 'Cor. 5.2; Prop. 5.3, p. 69'),
        cred: complete('classNP', SW15, 'Cor. 5.2; Prop. 5.3, p. 69'),
        skept: complete('classPi2P', SW15, 'Cor. 5.2; Prop. 5.3, p. 69'),
        exist: trivial(SW15, 'Thm. 3.3, p. 44'),
        ne: complete('classNP', SW15, 'Cor. 5.2; Prop. 5.3, p. 69'),
      },
      adfST: {
        ver: member('classP', SW15, 'Prop. 5.6, p. 72'),
        cred: complete('classNP', SW15, 'Cor. 5.7, p. 72'),
        skept: complete('classCoNP', SW15, 'Cor. 5.7, p. 72'),
        exist: complete('classNP', SW15, 'Prop. 5.6, p. 72'),
        ne: complete('classNP', SW15, 'Prop. 5.6, p. 72'),
      },
      adfMOD2: {
        ver: member('classP', SW15, 'Prop. 5.6, p. 72'),
        cred: complete('classNP', SW15, 'Cor. 5.7, p. 72'),
        skept: complete('classCoNP', SW15, 'Cor. 5.7, p. 72'),
        exist: complete('classNP', SW15, 'Prop. 5.6, p. 72'),
        ne: complete('classNP', SW15, 'Prop. 5.6, p. 72'),
      },
    },
  },
}
