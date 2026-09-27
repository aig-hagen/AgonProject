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
import type { AbaView } from '@/modules/assumption-based-argumentation/views/editorState'

const { flat } = defineProps<{ flat: boolean }>()
const view = defineModel<AbaView>({ required: true })

const options: { key: AbaView; label: string; flatOnly: boolean }[] = [
  { key: 'theory', label: 'Theory', flatOnly: false },
  { key: 'setaf', label: 'SETAF', flatOnly: true },
]
</script>

<template>
  <div class="join shadow-md" role="radiogroup" aria-label="Canvas view">
    <span
      v-for="option in options"
      :key="option.key"
      class="join-item"
      :class="{ 'tooltip tooltip-top': option.flatOnly && !flat }"
      :data-tip="option.flatOnly && !flat ? 'Only exact for flat theories' : undefined"
    >
      <button
        class="btn btn-sm rounded-[inherit]"
        :class="view === option.key ? 'btn-primary' : 'btn-neutral'"
        role="radio"
        :aria-checked="view === option.key"
        :disabled="option.flatOnly && !flat && view !== option.key"
        @click="view = option.key"
      >
        {{ option.label }}
      </button>
    </span>
  </div>
</template>
