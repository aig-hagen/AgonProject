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
import { KNOWN_SEMANTIC_GROUPS } from '@/modules/abstract-argumentation/evaluation/tweetyProject'
import { complete, type ComplexityTable, member, trivial } from '@/modules/common/complexity/types'
import {
  BT22,
  DD18,
  DG16,
  DUW22,
  DVW11,
  DW20,
  FHM24,
  KPW17,
  T22,
  T23,
} from '@/modules/common/publications/publications'

// Sources and caveats: literature/notes/complexity.md. Pages refer to the published version;
// T22 and DG16 were read as preprints, so they cite numbered results only.
const dd18 = 'Table 1, p. 649'
const parsimonious = { note: 'under parsimonious reductions' }
const subtractive = { note: 'under subtractive reductions' }
const polySpace = { comment: 'with polynomial space' }
const randomised = {
  note: 'hardness under randomised reductions',
  comment: 'DVW11, footnote 1',
}
const unique = (name: string) => {
  const reason = `The ${name} extension is unique.`
  return { note: reason, derived: reason }
}
const pspace = (locator = 'Thm. 3.16, p. 1419') => complete('classPSPACE', DUW22, locator)

export const afComplexity: ComplexityTable = {
  overviewKey: 'complexityAF',
  groups: KNOWN_SEMANTIC_GROUPS.map((group) => ({
    label: group.displayName,
    keys: group.semantics.map((semantics) => semantics.key),
  })),
  rows: {
    CF: {
      ver: member('classL', DD18, dd18),
      cred: member('classL', DD18, dd18),
      skept: trivial(DD18, dd18),
      exist: trivial(DD18, dd18),
      ne: member('classL', DD18, dd18),
      enum: member('classDelayP', KPW17, 'Table 2, p. 1147', polySpace),
    },
    NA: {
      ver: member('classL', DD18, dd18),
      cred: member('classL', DD18, dd18),
      skept: member('classL', DD18, dd18),
      exist: trivial(DD18, dd18),
      ne: member('classL', DD18, dd18),
      enum: member('classDelayP', KPW17, 'Table 2, p. 1147', polySpace),
    },
    ADM: {
      ver: member('classL', DD18, dd18),
      cred: complete('classNP', DD18, dd18),
      skept: trivial(DD18, dd18),
      exist: trivial(DD18, dd18),
      ne: complete('classNP', DD18, dd18),
      count: complete('classSharpP', FHM24, 'Cor. 8, p. 815', parsimonious),
      enum: { notIn: 'classOutputP', source: KPW17, locator: 'Table 2, p. 1147' },
    },
    CO: {
      ver: member('classL', DD18, dd18),
      cred: complete('classNP', DD18, dd18),
      skept: complete('classP', DD18, dd18),
      exist: trivial(DD18, dd18),
      ne: complete('classNP', DD18, dd18),
      count: complete('classSharpP', FHM24, 'Cor. 8, p. 815', parsimonious),
      enum: { notIn: 'classOutputP', source: KPW17, locator: 'Thm. 3, p. 1149' },
    },
    GR: {
      ver: complete('classP', DD18, dd18),
      cred: complete('classP', DD18, dd18),
      skept: complete('classP', DD18, dd18),
      exist: trivial(DD18, dd18),
      ne: member('classL', DD18, dd18),
      count: trivial(DD18, 'p. 656', unique('grounded')),
    },
    PR: {
      ver: complete('classCoNP', DD18, dd18),
      cred: complete('classNP', DD18, dd18),
      skept: complete('classPi2P', DD18, dd18),
      exist: trivial(DD18, dd18),
      ne: complete('classNP', DD18, dd18),
      count: member('classSharpCoNP', FHM24, 'Table 1, p. 807; Lemma 5, p. 814', {
        note: 'exact class open',
      }),
      enum: { notIn: 'classOutputP', source: KPW17, locator: 'Table 2, p. 1147' },
    },
    ST: {
      ver: member('classL', DD18, dd18),
      cred: complete('classNP', DD18, dd18),
      skept: complete('classCoNP', DD18, dd18),
      exist: complete('classNP', DD18, dd18),
      ne: complete('classNP', DD18, dd18),
      count: complete('classSharpP', FHM24, 'Cor. 8, p. 815', parsimonious),
      enum: { notIn: 'classOutputP', source: KPW17, locator: 'Thm. 3, p. 1149' },
    },
    STG: {
      ver: complete('classCoNP', DD18, dd18),
      cred: complete('classSigma2P', DD18, dd18),
      skept: complete('classPi2P', DD18, dd18),
      exist: trivial(DD18, dd18),
      ne: member('classL', DD18, dd18),
      count: complete('classSharpCoNP', FHM24, 'Cor. 8, p. 815', subtractive),
      enum: { notIn: 'classOutputP', source: KPW17, locator: 'Thm. 4, p. 1150' },
    },
    SST: {
      ver: complete('classCoNP', DD18, dd18),
      cred: complete('classSigma2P', DD18, dd18),
      skept: complete('classPi2P', DD18, dd18),
      exist: trivial(DD18, dd18),
      ne: complete('classNP', DD18, dd18),
      count: complete('classSharpCoNP', FHM24, 'Cor. 8, p. 815', subtractive),
      enum: { notIn: 'classOutputP', source: KPW17, locator: 'Thm. 4, p. 1150' },
    },
    ID: {
      ver: complete('classTheta2P', DD18, dd18, randomised),
      cred: complete('classTheta2P', DD18, dd18, randomised),
      skept: complete('classTheta2P', DD18, dd18, randomised),
      exist: trivial(DD18, dd18),
      ne: complete('classTheta2P', DD18, dd18, randomised),
      count: trivial(DD18, 'p. 656', unique('ideal')),
    },
    EA: {
      ver: complete('classD2P', DVW11, 'Table 2, p. 856'),
      exist: trivial(DVW11, 'Prop. 1, p. 853', { derived: 'The eager extension is unique.' }),
      ne: complete('classPi2P', DVW11, 'Table 2, p. 856'),
      count: trivial(DVW11, 'Prop. 1, p. 853', unique('eager')),
    },
    SAD: {
      ver: complete('classP', DW20, 'Lemma 2, p. 182'),
      cred: complete('classP', DW20, 'Sect. 3.1, p. 182; Table 1, p. 184'),
      skept: trivial(DW20, 'Sect. 3.1, p. 182'),
      exist: trivial(DW20, 'Sect. 2, p. 182', { derived: '∅ is always strongly admissible.' }),
      ne: member('classL', DW20, 'Sect. 3.1, p. 182'),
    },
    CF2: {
      ver: member('classP', DD18, dd18),
      cred: complete('classNP', DD18, dd18),
      skept: complete('classCoNP', DD18, dd18),
      exist: trivial(DD18, dd18),
      ne: member('classL', DD18, dd18),
      enum: member('classDelayP', KPW17, 'Thm. 1, p. 1148', polySpace),
    },
    STG2: {
      ver: complete('classCoNP', DG16, 'Thm. 5.2'),
      cred: complete('classSigma2P', DG16, 'Thm. 5.2'),
      skept: complete('classPi2P', DG16, 'Thm. 5.2'),
      ne: member('classP', DG16, 'Thm. 5.2'),
      enum: { notIn: 'classOutputP', source: KPW17, locator: 'Table 2, p. 1147' },
    },
    IS: {
      ver: member('classP', T22, 'Prop. 5'),
      cred: complete('classNP', T22, 'Prop. 8'),
      skept: complete('classCoNP', T22, 'Prop. 9'),
      exist: complete('classNP', T22, 'Prop. 6'),
      ne: complete('classNP', T22, 'Sect. 5'),
    },
    unattackedInitial: {
      ver: member('classP', T22, 'Prop. 10'),
      cred: member('classP', T22, 'Prop. 10'),
      skept: member('classP', T22, 'Prop. 10'),
      exist: member('classP', T22, 'Prop. 10'),
    },
    challengedInitial: {
      ver: complete('classNP', T22, 'Prop. 16'),
      cred: complete('classNP', T22, 'Prop. 18'),
      skept: complete('classCoNP', T22, 'Prop. 19'),
      exist: complete('classNP', T22, 'Prop. 17'),
    },
    unchallengedInitial: {
      cred: complete('classTheta2P', T22, 'Prop. 14'),
      skept: complete('classTheta2P', T22, 'Prop. 15'),
      exist: complete('classTheta2P', T22, 'Prop. 12'),
      ne: complete('classTheta2P', T22, 'Sect. 5'),
    },
    UC: {
      ver: { in: 'classSigma2P', hard: 'classTheta2P', source: BT22, locator: 'Thm. 9, p. 90' },
      cred: complete('classSigma2P', BT22, 'Thm. 9, p. 90'),
      skept: complete('classPi2P', BT22, 'Thm. 9, p. 90'),
      exist: trivial(BT22, 'Prop. 1, p. 88'),
      ne: complete('classTheta2P', BT22, 'Thm. 9, p. 90'),
    },
    UD: {
      ver: complete('classCoNP', T23, 'Thm. 3, p. 6556'),
      cred: complete('classSigma2P', T23, 'Thm. 3, p. 6556'),
      skept: complete('classPi2P', T23, 'Thm. 3, p. 6556'),
      exist: trivial(T23, 'Thm. 3, p. 6556'),
      ne: complete('classSigma2P', T23, 'Thm. 3, p. 6556'),
    },
    SUD: {
      ver: complete('classPi2P', T23, 'Thm. 4, p. 6556'),
      cred: complete('classSigma3P', T23, 'Thm. 4, p. 6556'),
      skept: complete('classPi3P', T23, 'Thm. 4, p. 6556'),
      exist: complete('classSigma3P', T23, 'Thm. 4, p. 6556'),
      ne: complete('classSigma3P', T23, 'Thm. 4, p. 6556'),
    },
    WAD: {
      ver: pspace(),
      cred: pspace(),
      skept: trivial(DUW22, 'Sect. 3.1, p. 1413'),
      exist: trivial(DUW22, 'Sect. 3.1, p. 1413', { derived: '∅ is always weakly admissible.' }),
      ne: pspace(),
    },
    WCO: { ver: pspace(), cred: pspace(), skept: pspace(), ne: pspace() },
    WGR: { ver: pspace(), cred: pspace(), skept: pspace(), ne: pspace() },
    WPR: {
      ver: pspace(),
      cred: pspace(),
      skept: pspace(),
      exist: trivial(DUW22, 'Sect. 3.1, p. 1413', {
        derived: '∅ is always weakly admissible, so a ⊆-maximal weakly admissible set exists.',
      }),
      ne: pspace(),
    },
  },
}
