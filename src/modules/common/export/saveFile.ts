import saveAs from 'file-saver'

export function saveToFile(content: string, name: string, ending: string) {
  function pad(value: number, maxLenght: number): string {
    return value.toString().padStart(maxLenght, '0')
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const now = new Date()
  const fileName = `${pad(now.getFullYear(), 4)}-${pad(now.getMonth() + 1, 2)}-${pad(now.getDate(), 2)}_${name}.${ending}`
  saveAs(blob, fileName)
}
