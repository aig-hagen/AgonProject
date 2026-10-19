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
import { CK96, DD18, EG97, P94, PY84, S76 } from '@/modules/common/publications/publications'

export const glossaryMeta: GlossaryMeta = {
  problemVer: { reference: DD18 },
  problemCred: { reference: DD18 },
  problemSkept: { reference: DD18 },
  problemExist: { reference: DD18 },
  problemNE: { reference: DD18 },
  classL: { reference: P94 },
  classP: { reference: P94 },
  classNP: { reference: P94 },
  classCoNP: { reference: P94 },
  classDP: { reference: PY84 },
  classTheta2P: { reference: EG97 },
  classSigma2P: { reference: S76 },
  classPi2P: { reference: S76 },
  classSigma3P: { reference: S76 },
  classPi3P: { reference: S76 },
  classD2P: { reference: CK96 },
  classPSPACE: { reference: P94 },
}
