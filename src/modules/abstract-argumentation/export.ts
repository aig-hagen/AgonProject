/*
 * Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.
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
import type { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import {
  exportLatexArgumentationCommon,
  latexExportCommonConfig,
} from '@/modules/common/argumentation/export'
import type { ArgumentData, ArgumentId } from '@/modules/common/argumentation/model'
import type { ExportConfig } from '@/modules/common/export'
import { IdMapping } from '@/modules/common/ids'

// See https://argumentationcompetition.org/2025/rules.html
const exportICCMA: ExportConfig<AbstractArgumentation<ArgumentData>> = {
  name: 'ICCMA',
  export(document) {
    let numberOfArguments = 0
    const idMapping = new IdMapping<ArgumentId, number>()
    for (const [argumentId] of document.arguments()) {
      // Tweety expects argument IDs to start with 1 and go up to n,
      // where n is the number of arguments.
      idMapping.add(argumentId, ++numberOfArguments)
    }
    let text = `p af ${numberOfArguments}\r\n`
    for (const [sourceId, targetId] of document.attacks()) {
      const sourceNumberId = idMapping.getOrFail(sourceId)
      const targetNumberId = idMapping.getOrFail(targetId)
      text += `${sourceNumberId} ${targetNumberId}\r\n`
    }
    text = text.trimEnd()
    return {
      text: text,
    }
  },
}

const exportLatexAbsractArgumentation: ExportConfig<AbstractArgumentation<ArgumentData>> = {
  ...latexExportCommonConfig(),
  export(document) {
    const args = document.arguments()
    const attacks = document.attacks()
    const supports = (function* () {})()
    return exportLatexArgumentationCommon(args, attacks, supports)
  },
}

export const availableExports = [exportLatexAbsractArgumentation, exportICCMA]
