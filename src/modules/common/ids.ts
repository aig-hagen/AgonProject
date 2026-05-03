export class IdMapping<InputIdT, OutputIdT> {
  private perInputIdOutputId = new Map<InputIdT, OutputIdT>()
  private perOutputIdInputId = new Map<OutputIdT, InputIdT>()

  add(inputId: InputIdT, outputId: OutputIdT) {
    this.perInputIdOutputId.set(inputId, outputId)
    this.perOutputIdInputId.set(outputId, inputId)
  }

  delete(inputId: InputIdT): OutputIdT {
    const outputId = this.getOrFail(inputId)
    this.perInputIdOutputId.delete(inputId)
    this.perOutputIdInputId.delete(outputId)
    return outputId
  }

  has(inputId: InputIdT): boolean {
    return this.perInputIdOutputId.has(inputId)
  }

  getOrFail(inputId: InputIdT): OutputIdT {
    if (this.has(inputId)) {
      return this.perInputIdOutputId.get(inputId)!
    }
    throw new Error('No ID mapping found.')
  }

  hasReverse(outputId: OutputIdT): boolean {
    return this.perOutputIdInputId.has(outputId)
  }

  getOrFailReverse(outputId: OutputIdT): InputIdT {
    if (this.hasReverse(outputId)) {
      return this.perOutputIdInputId.get(outputId)!
    }
    throw new Error('No ID mapping found.')
  }
}

export class IdGenerator {
  private nextId: number = 0

  generate() {
    return this.nextId++
  }

  forward(nextId: number) {
    if (nextId >= this.nextId) {
      this.nextId = nextId + 1
    }
  }
}

export type UUID = `${string}-${string}-${string}-${string}-${string}`
export function generateUUID(): UUID {
  return crypto.randomUUID()
}
