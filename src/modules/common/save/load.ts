export abstract class ImportError {
  abstract message: string
}

export class JsonSyntaxError extends ImportError {
  message: string
  constructor(cause: string, fileName: string) {
    super()
    this.message = `The provided file \`${fileName}\` is not a valid JSON file: ${cause}`
  }
}

export class SchemaMismatchError extends ImportError {
  message: string
  constructor(cause: string) {
    super()
    // The `cause` will already contain a file name
    this.message = `Data does not match the expected schema: ${cause}`
  }
}

export class InvalidDataError extends ImportError {
  message: string
  constructor(cause: string, fileName: string) {
    super()
    this.message = `The provided file \`${fileName}\` contains invalid data: ${cause}`
  }
}

export class ValidationError extends ImportError {
  message: string
  constructor(cause: string, fileName: string) {
    super()
    this.message = `The provided file \`${fileName}\` contains invalid data:

${cause}
`
  }
}

export type DeserializationResult<ValueT> = DeserializationSuccess<ValueT> | DeserializationError

export interface DeserializationSuccess<ValueT> {
  success: true
  data: ValueT
  errors?: never
}
export interface DeserializationError {
  success: false
  data?: never
  errors: ImportError[]
}
