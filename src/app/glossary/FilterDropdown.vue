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
import { useI18n } from 'vue-i18n'

import KatexInlineElement from '@/modules/common/tooltip/KatexInlineElement.vue'

const { label, groups, itemLabel } = defineProps<{
  label: string
  groups: { label: string; keys: string[] }[]
  itemLabel: (key: string) => string
}>()

const shown = defineModel<Set<string>>({ required: true })

const { t } = useI18n({ useScope: 'global' })

const allKeys = computed(() => groups.flatMap((group) => group.keys))

function toggle(key: string) {
  const next = new Set(shown.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  shown.value = next
}
</script>

<template>
  <details class="dropdown">
    <summary class="btn btn-sm">
      {{ t('glossary.principles.show') }}: {{ label }} ({{ shown.size }}/{{ allKeys.length }})
    </summary>
    <div
      class="dropdown-content z-10 mt-1 p-3 w-80 max-h-96 overflow-y-auto bg-base-100 border border-base-300 rounded-box shadow"
    >
      <div class="flex gap-3 mb-2">
        <button class="text-primary" @click="shown = new Set(allKeys)">
          {{ t('glossary.principles.all') }}
        </button>
        <button class="text-primary" @click="shown = new Set()">
          {{ t('glossary.principles.none') }}
        </button>
      </div>
      <template v-for="group in groups" :key="group.label">
        <p class="section-label mt-2 mb-1">{{ group.label }}</p>
        <label v-for="key in group.keys" :key="key" class="flex items-center gap-2 py-0.5">
          <input
            type="checkbox"
            class="checkbox checkbox-xs"
            :checked="shown.has(key)"
            @change="toggle(key)"
          />
          <KatexInlineElement :text="itemLabel(key)" />
        </label>
      </template>
    </div>
  </details>
</template>
