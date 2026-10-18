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
interface PublicationBase {
  /** "Last, I." per author, in order. */
  authors: string[]
  year: number
  title: string
  doi?: string
  /** Fallback link when there is no DOI. */
  url?: string
}

export interface Article extends PublicationBase {
  kind: 'article'
  journal: string
  volume?: string
  number?: string
  /** Article number, for journals without page ranges. */
  articleNo?: string
  pages?: string
}

export interface InProceedings extends PublicationBase {
  kind: 'inproceedings'
  /** Official proceedings title. */
  booktitle: string
  /** Conference acronym with year, e.g. "IJCAI 2025". Omitted from output if the booktitle has it. */
  acronym?: string
  /** Volume of a multi-volume proceedings. */
  volume?: string
  /** Abbreviated series, e.g. "LNCS", "FAIA", "CEUR-WS". */
  series?: string
  seriesVolume?: string
  pages?: string
  publisher?: string
}

export interface Chapter extends PublicationBase {
  kind: 'chapter'
  booktitle: string
  editors?: string[]
  volume?: string
  chapter?: string
  pages?: string
  publisher: string
}

export interface Thesis extends PublicationBase {
  kind: 'thesis'
  degree: 'PhD' | 'Master'
  school: string
}

export type Publication = Article | InProceedings | Chapter | Thesis
