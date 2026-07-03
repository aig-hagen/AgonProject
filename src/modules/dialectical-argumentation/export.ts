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
import {
  exportLatexArgumentationCommon,
  latexExportCommonConfig,
} from '@/modules/common/argumentation/export'
import type { ExportConfig, ExportStyleOptions } from '@/modules/common/export'
import type { FormulaNode } from '@/modules/dialectical-argumentation/condition/formula'
import type { AdfArgumentData, DialecticalArgumentation } from '@/modules/dialectical-argumentation/model'

// Precedence levels matching formula.ts
const PREC_OR = 1
const PREC_AND = 2
const PREC_NOT = 3

function nodePrec(node: FormulaNode): number {
  switch (node.type) {
    case 'tautology':
    case 'contradiction':
    case 'atom': return 4
    case 'negation': return PREC_NOT
    case 'conjunction': return PREC_AND
    case 'disjunction': return PREC_OR
  }
}

function formulaToLatexInner(node: FormulaNode, parentPrec: number, argNames: Map<number, string>): string {
  const raw = formulaToLatexRaw(node, argNames)
  return nodePrec(node) < parentPrec ? `(${raw})` : raw
}

function formulaToLatexRaw(node: FormulaNode, argNames: Map<number, string>): string {
  switch (node.type) {
    case 'tautology': return '\\top'
    case 'contradiction': return '\\bot'
    case 'atom': return argNames.get(node.argumentId) ?? '?'
    case 'negation':
      return `\\neg ${formulaToLatexInner(node.child, PREC_NOT, argNames)}`
    case 'conjunction':
      return node.children
        .map((c) => formulaToLatexInner(c, PREC_AND, argNames))
        .join(' \\wedge ')
    case 'disjunction':
      return node.children
        .map((c) => formulaToLatexInner(c, PREC_OR + 1, argNames))
        .join(' \\vee ')
  }
}

const exportLatexDialecticalArgumentation: ExportConfig<DialecticalArgumentation<AdfArgumentData>> =
  {
    ...latexExportCommonConfig(),
    export(document, styleOptions?: ExportStyleOptions) {
      const argsList = [...document.arguments()]

      const latexNameMap = new Map<number, string>()
      for (const [id, data] of argsList) {
        latexNameMap.set(id, data.name.replace(/[^a-zA-Z0-9 ]/g, ''))
      }

      const dataMap = new Map(argsList)

      return exportLatexArgumentationCommon(
        argsList.values(),
        document.links(),
        (function* () {})(),
        styleOptions,
        {
          argumentAnnotation: (id) => {
            const formula = formulaToLatexRaw(dataMap.get(id)!.condition, latexNameMap)
            return `$${formula}$`
          },
        },
      )
    },
  }

export const availableExports = [exportLatexDialecticalArgumentation]
