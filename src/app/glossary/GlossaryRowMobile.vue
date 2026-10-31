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
import { ChevronRightIcon, MapPinIcon } from '@heroicons/vue/24/outline'

import KatexInlineElement from '@/modules/common/tooltip/KatexInlineElement.vue'

const {
  to,
  title,
  meta,
  pinned = false,
} = defineProps<{
  to: string
  /** May contain `$…$` math. */
  title: string
  /** Short context on the right, e.g. the module prefix. */
  meta?: string
  pinned?: boolean
}>()
</script>

<template>
  <RouterLink
    :to="to"
    class="flex min-h-11 items-center gap-2 border-b py-1.5 pl-4 pr-3 text-sm active:bg-base-200 hover:bg-base-200"
    :class="pinned ? 'border-primary/40 bg-primary/5' : 'border-base-300'"
  >
    <MapPinIcon v-if="pinned" class="size-4 shrink-0 text-primary" />
    <span class="min-w-0 flex-1 truncate"><KatexInlineElement :text="title" /></span>
    <span v-if="meta" class="shrink-0 text-xs text-base-content/65">{{ meta }}</span>
    <ChevronRightIcon class="size-4 shrink-0 text-base-content/40" />
  </RouterLink>
</template>
