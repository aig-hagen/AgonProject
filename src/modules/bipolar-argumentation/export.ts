import {
  exportLatexArgumentationCommon,
  latexExportCommonConfig,
} from '@/modules/common/argumentation/export'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import type { ExportConfig } from '@/modules/common/export'
import type { BipoloarArgumentation } from '@/modules/bipolar-argumentation/model'

const exportLatexBipolarArgumentation: ExportConfig<BipoloarArgumentation<ArgumentData>> = {
  ...latexExportCommonConfig(),
  export(document) {
    const args = document.arguments()
    const attacks = document.attacks()
    const supports = document.supports()
    return exportLatexArgumentationCommon(args, attacks, supports)
  },
}

export const availableExports = [exportLatexBipolarArgumentation]
