export interface Example<DocumentT> {
  name: string
  load(): DocumentT
}
