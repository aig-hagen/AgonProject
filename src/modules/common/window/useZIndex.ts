import { onUnmounted, type Ref, ref } from 'vue'

const allRefs: Ref<string>[] = []

export const POINTER_SHIELD_Z_INDEX = 1000
const Z_INDEX_FORGROUND_STRING = zIndexString(POINTER_SHIELD_Z_INDEX + 1)
const Z_INDEX_BACKGROUND = POINTER_SHIELD_Z_INDEX - 1

function remove(ref: Ref<string>) {
  const index = allRefs.indexOf(ref)
  if (index !== -1) {
    allRefs.splice(index, 1)
  }
}

function updateAllRefs() {
  for (let i = 0; i < allRefs.length; i++) {
    const ref = allRefs[allRefs.length - 1 - i]!
    ref.value = zIndexString(Z_INDEX_BACKGROUND - i)
  }
}

export function useZIndex() {
  const zIndexRef = ref<string>('invalid')
  allRefs.push(zIndexRef)
  updateAllRefs()

  function focusIn() {
    remove(zIndexRef)
    allRefs.push(zIndexRef)
    updateAllRefs()
    zIndexRef.value = Z_INDEX_FORGROUND_STRING
  }
  function focusOut() {
    updateAllRefs()
  }

  onUnmounted(() => {})
  return {
    zIndex: zIndexRef,
    focusIn,
    focusOut,
  }
}

function zIndexString(zIndex: number): string {
  return (zIndex - 1).toString(10)
}
