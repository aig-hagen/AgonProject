import saveAs from 'file-saver'

export function saveToFile(content: string, name: string, ending: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const fileName = `${name}.${ending}`
  saveAs(blob, fileName)
}
