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
import type { SetAF, SetAfArgumentData } from '@/modules/collective-attacks-argumentation/model'
import {
  buildArgumentPlacementText,
  latexExportCommonConfig,
} from '@/modules/common/argumentation/export'
import type { ExportConfig, ExportStyleOptions } from '@/modules/common/export'
import { renderSvg } from '@/modules/common/export/renderSvg'

const exportLatexSetAF: ExportConfig<SetAF<SetAfArgumentData>> = {
  ...latexExportCommonConfig(),
  export(document, styleOptions?: ExportStyleOptions) {
    const argumentStyle = styleOptions?.argumentStyle ?? 'colored'
    const nameStyle = styleOptions?.nameStyle ?? 'math'
    const attackStyle = styleOptions?.attackStyle ?? 'standard'
    const afOptions = `[argumentstyle=${argumentStyle},namestyle=${nameStyle},attackstyle=${attackStyle}]`

    const argText = buildArgumentPlacementText(document.arguments(), styleOptions)

    let attackText = ''
    for (const attack of document.attacks()) {
      if (attack.attackers.length === 1) {
        attackText += `  \\attack{a${attack.attackers[0]}}{a${attack.target}}\r\n`
      } else {
        const attackerList = attack.attackers.map((id) => `a${id}`).join(',')
        attackText += `  \\setattack{${attackerList}}{a${attack.target}}\r\n`
      }
    }

    const body = `\\begin{af}\r\n${argText}${attackText}\\end{af}`
    return {
      text: body,
      svg: renderSvg(body.replace('\\begin{af}', `\\begin{af}${afOptions}`)),
    }
  },
}

export const availableExports = [exportLatexSetAF]
