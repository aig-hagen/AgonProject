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
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { RouterLink } from 'vue-router'

import { useLayoutMode } from '@/modules/common/layout/useLayoutMode'

const { title, backLabel, onBack } = defineProps<{
  title: string
  backLabel: string
  /** Replaces the default link to the editor, e.g. to go back within the page's own levels. */
  onBack?: () => void
}>()

const { isCompact } = useLayoutMode()
</script>

<template>
  <!-- Equal side columns keep the title centered regardless of the back button's width. -->
  <header
    class="flex-none grid grid-cols-[1fr_minmax(0,auto)_1fr] items-center gap-2 border-b border-base-300 bg-base-200"
    :class="isCompact ? 'min-h-14 px-1.5' : 'min-h-12 px-3'"
    style="padding-top: env(safe-area-inset-top)"
  >
    <component
      :is="onBack ? 'button' : RouterLink"
      v-bind="onBack ? { type: 'button', onClick: onBack } : { to: '/' }"
      class="btn btn-ghost justify-self-start"
      :class="isCompact ? 'btn-square size-11' : 'btn-sm gap-1 pl-1.5'"
      :aria-label="isCompact ? backLabel : undefined"
    >
      <ChevronLeftIcon class="size-5 text-base-content/65" />
      <span v-if="!isCompact">{{ backLabel }}</span>
    </component>
    <h1 class="min-w-0 truncate text-center text-lg font-bold">{{ title }}</h1>
    <div class="flex items-center justify-end gap-1">
      <slot name="actions" />
    </div>
  </header>
</template>
