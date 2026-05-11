import {
  exportLatexArgumentationCommon,
  latexExportCommonConfig,
} from '../common/argumentation/export'
import type { ArgumentData } from '../common/argumentation/model'
import type { ExportConfig } from '../common/export'
import type { BipoloarArgumentation } from './model'

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
