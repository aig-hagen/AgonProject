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
import { type Extension } from '@codemirror/state'

export interface ExportStyleOptions {
  argumentStyle?: string
  nameStyle?: string
  attackStyle?: string
  supportStyle?: string
  snapToGrid?: boolean
  nodeDistance?: number
  gridCellScale?: number
  shortenNames?: boolean
}

export interface ExportReference {
  label: string
  url: string
}

export interface ExportConfig<DocumentT> {
  name: string
  /** Short one-line subtitle shown under the name in the compact export picker. */
  description?: string
  export(document: DocumentT, styleOptions?: ExportStyleOptions): ExportResult
  codemirrorOptions?: {
    extensions: Extension[]
  }
  references?: ExportReference[]
  /** File extension (without dot) to use when saving this export's output. */
  extension?: string
}

export interface ExportResult {
  text: string
  // A factory rather than an eager promise: rendering the TikZ SVG spins up a heavy WebAssembly
  // TeX engine, so it must only run when a preview actually asks for it (never on mobile).
  svg?: () => Promise<string>
}

export interface ExportFileData {
  content: string
  ending: string
}
