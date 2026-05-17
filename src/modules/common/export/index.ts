import { type Extension } from '@codemirror/state'

export interface ExportConfig<DocumentT> {
  name: string
  export(document: DocumentT): ExportResult
  codemirrorOptions?: {
    extensions: Extension[]
  }
}

export interface ExportResult {
  text: string
  svg?: Promise<string>
}

export interface ExportFileData {
  content: string
  name: string
  ending: string
}
