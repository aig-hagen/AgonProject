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
import { DD18, DVW11, SW15 } from '@/modules/common/publications/publications'

export const glossaryMeta: GlossaryMeta = {
  complexityAF: { reference: DD18 },
  complexityADF: { reference: SW15 },
  problemVer: { reference: DD18 },
  problemCred: { reference: DD18 },
  problemSkept: { reference: DD18 },
  problemExist: { reference: DD18 },
  problemNE: { reference: DD18 },
  classL: { reference: DD18 },
  classP: { reference: DD18 },
  classNP: { reference: DD18 },
  classCoNP: { reference: DD18 },
  classDP: { reference: DD18 },
  classTheta2P: { reference: DD18 },
  classSigma2P: { reference: DD18 },
  classPi2P: { reference: DD18 },
  classSigma3P: { reference: DD18 },
  classPi3P: { reference: DD18 },
  classD2P: { reference: DVW11 },
}
