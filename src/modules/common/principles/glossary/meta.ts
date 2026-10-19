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
import type { GlossaryMeta } from '@/modules/common/glossary/types'
import {
  BBCGTV14,
  BBU20,
  BBU20a,
  BCG11,
  BG07,
  BGG05,
  BlT24,
  BLW16,
  BT26,
  BU22,
  CCD12,
  CDM05,
  DDLW15,
  DRT20,
  DUW22,
  FU21,
  GW13,
  T22,
  TV18,
} from '@/modules/common/publications/publications'

export const glossaryMeta: GlossaryMeta = {
  principle: { reference: BG07 },
  languageIndependence: { reference: BG07 },
  conflictFreeness: { reference: BG07 },
  defence: { reference: TV18 },
  admissibility: { reference: BG07 },
  strongAdmissibility: { reference: BG07 },
  naivety: { reference: TV18 },
  indirectCF: { reference: CDM05 },
  reinstatement: { reference: BG07 },
  weakReinstatement: { reference: BG07 },
  cfReinstatement: { reference: BG07 },
  iMaximality: { reference: BG07 },
  allowingAbstention: { reference: BCG11 },
  crashResistance: { reference: CCD12 },
  nonInterference: { reference: CCD12 },
  directionality: { reference: BG07 },
  weakDirectionality: { reference: TV18 },
  semiDirectionality: { reference: TV18 },
  rationality: { reference: BLW16 },
  selfAttackerNeglection: { reference: BBU20a },
  contextFreeness: { reference: BlT24 },
  succinctness: { reference: GW13 },
  existence: { reference: TV18 },
  nonTriviality: { reference: TV18 },
  uniqueStatus: { reference: BG07 },
  decisiveness: { reference: TV18 },
  tightness: { reference: DDLW15 },
  conflictSensitiveness: { reference: DDLW15 },
  comClosure: { reference: DDLW15 },
  downwardClosure: { reference: DDLW15 },
  sccRecursiveness: { reference: BGG05 },
  sccDecomposability: { reference: BBCGTV14 },
  weakSccDecomposability: { reference: DRT20 },
  fullDecomposability: { reference: BBCGTV14 },
  topDownDecomposability: { reference: BBCGTV14 },
  bottomUpDecomposability: { reference: BBCGTV14 },
  splitting: { reference: DUW22 },
  weakSplitting: { reference: FU21 },
  modularisation: { reference: BBU20a },
  adModularisation: { reference: FU21 },
  confluence: { reference: BT26 },
  meaninglessReduct: { reference: BBU20a },
  rangeCompatibility: { reference: FU21 },
  separation: { reference: BU22 },
  serialisability: { reference: T22 },
  reductAdmissibility: { reference: DRT20 },
  semiQualifiedAdm: { reference: DRT20 },
  adLiberalization: { reference: BU22 },
  fundamentalLemma: { reference: BBU20 },
  unattackInclusion: { reference: BBU20a },
  strictUnattackInclusion: { reference: BBU20a },
}
