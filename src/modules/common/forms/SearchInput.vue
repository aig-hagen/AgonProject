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
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { useLayoutMode } from '@/modules/common/layout/useLayoutMode'

const { placeholder } = defineProps<{ placeholder: string }>()
const query = defineModel<string>({ required: true })

const { t } = useI18n({ useScope: 'global' })
const { isCompact } = useLayoutMode()
const input = useTemplateRef('input')

function clear() {
  query.value = ''
  input.value?.focus()
}
</script>

<template>
  <label
    class="group flex items-center gap-2 rounded-field border border-base-300 bg-base-200 transition-colors focus-within:bg-base-100 focus-within:border-(--color-focus) has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--color-focus)"
    :class="isCompact ? 'h-11 pl-3.5' : 'h-9 pl-3'"
  >
    <MagnifyingGlassIcon
      class="shrink-0 text-base-content/40 transition-colors group-focus-within:text-base-content/70"
      :class="isCompact ? 'size-5' : 'size-4'"
    />
    <!-- outline-none! beats the unlayered global :focus-visible ring; the label draws it instead -->
    <input
      ref="input"
      v-model="query"
      type="search"
      class="flex-1 min-w-0 self-stretch bg-transparent outline-none! text-sm placeholder:text-base-content/65 [&::-webkit-search-cancel-button]:appearance-none"
      :class="{ 'pr-3': !query }"
      :placeholder="placeholder"
      :aria-label="placeholder"
      @keydown.esc="query && (clear(), $event.stopPropagation())"
    />
    <button
      v-if="query"
      type="button"
      class="shrink-0 grid place-items-center self-stretch text-base-content/50 hover:text-base-content outline-none!"
      :class="isCompact ? 'w-11' : 'w-8'"
      :title="t('common.actions.clear')"
      :aria-label="t('common.actions.clear')"
      @click="clear"
    >
      <XMarkIcon :class="isCompact ? 'size-5' : 'size-4'" />
    </button>
  </label>
</template>
