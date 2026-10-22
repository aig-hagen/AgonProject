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
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

import { useLayoutMode } from '@/modules/common/layout/useLayoutMode'

const { placeholder } = defineProps<{ placeholder: string }>()
const query = defineModel<string>({ required: true })

const { isCompact } = useLayoutMode()
</script>

<template>
  <label
    class="flex items-center gap-2 rounded-field border border-base-300 bg-base-200 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--color-focus)"
    :class="isCompact ? 'h-11 px-3.5' : 'h-9 px-3'"
  >
    <MagnifyingGlassIcon
      class="shrink-0 text-base-content/40"
      :class="isCompact ? 'size-5' : 'size-4'"
    />
    <input
      v-model="query"
      type="search"
      class="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-base-content/65"
      :placeholder="placeholder"
      :aria-label="placeholder"
    />
  </label>
</template>
