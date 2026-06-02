<!--
  Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.

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
import { computed } from 'vue'

import FormulaEditor from '@/modules/dialectical-argumentation/condition/FormulaEditor.vue'
import {
  formulaToString,
  type FormulaNode,
} from '@/modules/dialectical-argumentation/condition/formula'
import type { AdfArgumentData, DialecticalArgumentation } from '@/modules/dialectical-argumentation/model'
import type { NodeId } from '@/modules/common/graph-editor/graphEditor'
import FloatingWindow from '@/modules/common/window/FloatingWindow.vue'

const props = defineProps<{
  argumentId: NodeId
  adf: DialecticalArgumentation<AdfArgumentData>
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  'update:formula': [FormulaNode]
}>()

const argument = computed(() => props.adf.getArgument(props.argumentId))

const argNameMap = computed(() => {
  const map = new Map<number, string>()
  for (const [id, data] of props.adf.arguments()) {
    map.set(id, data.name)
  }
  return map
})

const availableArguments = computed(() => {
  const result: { id: number; name: string }[] = []
  for (const [id, data] of props.adf.arguments()) {
    result.push({ id, name: data.name })
  }
  return result
})

const formulaPreview = computed(() =>
  formulaToString(argument.value.condition, argNameMap.value),
)
</script>

<template>
  <FloatingWindow
    v-model:open="open"
    :title="`Condition for ${argument.name}`"
    :initial-position="{ x: 128, y: 64 }"
    :intitalSize="{ width: 400, height: 360 }"
  >
    <div class="p-4 flex flex-col gap-4 overflow-y-auto h-full">
      <FormulaEditor
        :formula="argument.condition"
        :available-arguments="availableArguments"
        @update:formula="emit('update:formula', $event)"
      />
      <div class="border-t pt-2 mt-auto">
        <p class="label text-xs">Formula preview</p>
        <p class="font-mono text-sm">{{ formulaPreview }}</p>
      </div>
    </div>
  </FloatingWindow>
</template>
