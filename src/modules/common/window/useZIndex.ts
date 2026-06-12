/*
 * Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.
 *
 * Copyright (C) 2026  Artificial Intelligence Group at the Faculty of Mathematics and Computer Science of the FernUniversität in Hagen <https://www.fernuni-hagen.de/aig/en/>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
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

  onUnmounted(() => { remove(zIndexRef) })
  return {
    zIndex: zIndexRef,
    focusIn,
    focusOut,
  }
}

function zIndexString(zIndex: number): string {
  return (zIndex - 1).toString(10)
}
