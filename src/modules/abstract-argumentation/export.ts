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
