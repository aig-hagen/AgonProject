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
import { computed } from 'vue'

import GroupedSelect from '@/modules/common/forms/GroupedSelect.vue'

// Flat single-level picker used in the module #parameters slots (Mode, Support type, …).
// Renders the shared GroupedSelect (one unnamed group) on both desktop and compact so it
// matches the Semantics selector exactly.
export interface PickerOption {
  value: string
  label: string
}

const { modelValue, options } = defineProps<{
  modelValue: string | undefined
  options: PickerOption[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const groups = computed(() => [
  {
    key: 'options',
    displayName: '',
    options: options.map((o) => ({ key: o.value, displayName: o.label })),
  },
])

const selected = computed(
  () => groups.value[0]!.options.find((o) => o.key === modelValue) ?? groups.value[0]!.options[0]!,
)
</script>

<template>
  <GroupedSelect
    :model-value="selected"
    :groups="groups"
    full-width
    @update:model-value="emit('update:modelValue', $event.key)"
  />
</template>
