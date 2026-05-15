interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_APP_SOURCE_TREE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
