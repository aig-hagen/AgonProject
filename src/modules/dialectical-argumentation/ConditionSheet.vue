<!--
  AgonProject - The platform to explore different approaches to formal argumentation.

  Copyright (C) 2026  Artificial Intelligence Group at the Faculty of Mathematics and Computer Science of the FernUniversität in Hagen <https://www.fernuni-hagen.de/aig/en/>

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->
<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'

import type { NodeId } from '@/modules/common/graph-editor/graphEditor'
import BottomSheet from '@/modules/common/window/BottomSheet.vue'
import {
  type FormulaNode,
  formulaToString,
} from '@/modules/dialectical-argumentation/condition/formula'
import { parseFormula } from '@/modules/dialectical-argumentation/condition/formulaParser'
import type {
  AdfArgumentData,
  DialecticalArgumentation,
} from '@/modules/dialectical-argumentation/model'

const open = defineModel<boolean>('open', { required: true })
const { argumentId, adf } = defineProps<{
  argumentId: NodeId | null
  adf: DialecticalArgumentation<AdfArgumentData>
}>()

const emit = defineEmits<{
  'update:formula': [FormulaNode]
  rename: [id: NodeId, name: string]
}>()

const argNameMap = computed(() => {
  const map = new Map<number, string>()
  for (const [id, data] of adf.arguments()) map.set(id, data.name)
  return map
})
const argNameToId = computed(() => {
  const map = new Map<string, number>()
  for (const [id, data] of adf.arguments()) map.set(data.name, id)
  return map
})
const availableArguments = computed(() =>
  [...adf.arguments()].map(([id, data]) => ({ id, name: data.name })),
)

const argumentName = computed(() =>
  argumentId === null ? '' : (argNameMap.value.get(argumentId) ?? ''),
)

const inputRef = useTemplateRef<HTMLInputElement>('input')
const inputText = ref('')
const isInvalid = ref(false)

// Re-seed the field whenever the sheet targets a (different) argument.
watch(
  [open, () => argumentId],
  ([isOpen, id]) => {
    if (!isOpen || id === null) return
    try {
      inputText.value = formulaToString(adf.getArgument(id).condition, argNameMap.value)
      isInvalid.value = false
    } catch {
      inputText.value = ''
    }
  },
  { immediate: true },
)

function parseAndEmit() {
  if (argumentId === null) return
  const parsed = parseFormula(inputText.value, argNameToId.value)
  if (parsed !== null) {
    isInvalid.value = false
    emit('update:formula', parsed)
  } else {
    isInvalid.value = inputText.value.trim().length > 0
  }
}

function insertAtCursor(text: string, cursorOffset?: number) {
  const el = inputRef.value
  const start = el?.selectionStart ?? inputText.value.length
  const end = el?.selectionEnd ?? start
  const newText = inputText.value.slice(0, start) + text + inputText.value.slice(end)
  const newPos = start + (cursorOffset ?? text.length)
  if (el) {
    el.value = newText
    el.setSelectionRange(newPos, newPos)
    el.focus()
  }
  inputText.value = newText
  parseAndEmit()
}

function deleteAtCursor() {
  const el = inputRef.value
  const start = el?.selectionStart ?? inputText.value.length
  const end = el?.selectionEnd ?? start
  // Collapsed caret deletes the char before it; a selection deletes the range.
  const from = start === end ? Math.max(0, start - 1) : start
  const newText = inputText.value.slice(0, from) + inputText.value.slice(end)
  if (el) {
    el.value = newText
    el.setSelectionRange(from, from)
    el.focus()
  }
  inputText.value = newText
  parseAndEmit()
}

function clearFormula() {
  inputText.value = ''
  if (inputRef.value) inputRef.value.value = ''
  parseAndEmit()
  void nextTick(() => inputRef.value?.focus())
}

const operatorKeys = [
  { label: '¬', text: '¬', title: 'Negation' },
  { label: '∧', text: ' ∧ ', title: 'Conjunction' },
  { label: '∨', text: ' ∨ ', title: 'Disjunction' },
  { label: '⊤', text: '⊤', title: 'Tautology' },
  { label: '⊥', text: '⊥', title: 'Contradiction' },
  { label: '( )', text: '()', title: 'Parentheses', cursorOffset: 1 },
]

// Rename lives here too: on mobile a node tap opens this sheet rather than the label edit.
const nameDraft = ref('')
watch(argumentName, (name) => {
  nameDraft.value = name
})
function commitRename() {
  if (argumentId === null) return
  const trimmed = nameDraft.value.trim()
  if (trimmed.length === 0 || trimmed === argumentName.value) return
  emit('rename', argumentId, trimmed)
}
</script>

<template>
  <BottomSheet v-model:open="open" title="Acceptance condition">
    <div class="flex flex-col gap-4 pb-4">
      <label class="flex flex-col gap-1">
        <span class="text-xs font-semibold uppercase opacity-60">Argument name</span>
        <input
          type="text"
          class="input input-sm w-full font-mono"
          v-model="nameDraft"
          spellcheck="false"
          autocomplete="off"
          @change="commitRename"
          @keydown.enter.prevent="commitRename"
        />
      </label>

      <div class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold uppercase opacity-60">Condition</span>
        <div class="relative">
          <input
            ref="input"
            type="text"
            inputmode="none"
            class="input input-md font-mono w-full"
            :class="{ 'input-error pr-8': isInvalid }"
            v-model="inputText"
            @input="parseAndEmit"
          />
          <span
            v-if="isInvalid"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-error font-bold select-none"
            title="Condition is syntactically incorrect and will not be saved"
            >!</span
          >
        </div>
        <p class="text-xs opacity-50">
          Build the condition with the keys below — the argument chips insert atoms.
        </p>
      </div>

      <!-- Operator keypad -->
      <div class="grid grid-cols-4 gap-1.5">
        <button
          v-for="key in operatorKeys"
          :key="key.label"
          type="button"
          class="btn btn-neutral font-mono text-lg"
          :title="key.title"
          :aria-label="key.title"
          @click="insertAtCursor(key.text, key.cursorOffset)"
        >
          {{ key.label }}
        </button>
        <button
          type="button"
          class="btn btn-neutral"
          aria-label="Backspace"
          title="Backspace"
          @click="deleteAtCursor"
        >
          ⌫
        </button>
        <button
          type="button"
          class="btn btn-ghost text-xs"
          :disabled="inputText.length === 0"
          @click="clearFormula"
        >
          Clear
        </button>
      </div>

      <!-- Argument atom chips -->
      <div class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold uppercase opacity-60">Arguments</span>
        <div v-if="availableArguments.length > 0" class="flex flex-wrap gap-1.5">
          <button
            v-for="arg in availableArguments"
            :key="arg.id"
            type="button"
            class="btn btn-sm btn-soft font-mono"
            @click="insertAtCursor(arg.name)"
          >
            {{ arg.name }}
          </button>
        </div>
        <p v-else class="text-xs opacity-50">Add arguments to the graph to reference them here.</p>
      </div>
    </div>
  </BottomSheet>
</template>
