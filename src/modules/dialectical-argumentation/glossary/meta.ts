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
  BESWW13,
  BESWW18,
  BT25,
  BW10,
  KVV21,
  KVV22,
  SW15,
} from '@/modules/common/publications/publications'

export const glossaryMeta: GlossaryMeta = {
  ADF: { reference: BW10 },
  parents: { reference: BW10 },
  acceptanceCondition: { reference: BW10 },
  threeValuedInterpretation: { reference: BESWW13 },
  adfADM: { reference: BESWW13 },
  adfCO: { reference: BESWW13 },
  adfGR: { reference: BESWW13 },
  adfPR: { reference: BESWW13 },
  adfST: { reference: BESWW13 },
  reducedAdf: { reference: BESWW13 },
  operator: { reference: BESWW18 },
  completions: { reference: BESWW18 },
  consensus: { reference: BESWW18 },
  adfCF: { reference: SW15 },
  adfNA: { reference: SW15 },
  informationOrdering: { reference: BESWW13 },
  adfMOD2: { reference: BW10 },
  adfMOD3: { reference: BESWW13 },
  adfSAD: { reference: KVV22 },
  adfS2V: { reference: KVV21 },
  adfSST: { reference: KVV21 },
  subReduct: { reference: KVV21 },
  adfIS: { reference: BT25 },
}
