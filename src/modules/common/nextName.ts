// Unicode code point are like ASCII codes but for Unicode.
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt
export const a = 97
export const z = 122

export function getNextName(names: Iterable<string>) {
  let nextNameAsCodePoint = a

  for (const name of names) {
    if (name.length != 1) {
      continue
    }
    const nameCodePoint = name.codePointAt(0)!
    if (nameCodePoint < nextNameAsCodePoint) {
      continue
    }
    if (nameCodePoint === z) {
      return ''
    }
    if (nameCodePoint < z) {
      nextNameAsCodePoint = nameCodePoint + 1
    }
  }
  return String.fromCodePoint(nextNameAsCodePoint)
}
