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
import { ArrowTopRightOnSquareIcon, BookOpenIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'

import { formatCitation, type Publication } from '@/modules/common/tooltip/publications'

const { publication, compact = false } = defineProps<{
  publication: Publication
  // Short label + title only, for tight spots like definition tooltips.
  compact?: boolean
}>()

const surnames = computed(() => publication.authors.map((a) => a.split(', ')[0]).join(', '))
const venue = computed(() => publication.venue.replace(/^In: /, ''))
</script>

<template>
  <a
    :href="publication.href"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="formatCitation(publication)"
    class="group"
    :class="compact ? 'flex items-start gap-1.5 text-xs' : 'flex flex-col gap-0.5'"
  >
    <template v-if="compact">
      <BookOpenIcon class="size-3.5 shrink-0 mt-px text-base-content/40" />
      <span class="min-w-0 leading-snug">
        <span class="font-medium text-base-content/80 group-hover:text-primary">
          {{ publication.shortLabel }}
        </span>
        <span class="block line-clamp-2 text-base-content/55">{{ publication.title }}</span>
      </span>
    </template>
    <template v-else>
      <span class="text-sm font-medium leading-snug text-base-content group-hover:text-primary">
        {{ publication.title }}
        <ArrowTopRightOnSquareIcon class="inline size-3 align-baseline opacity-50" />
      </span>
      <span class="text-xs text-base-content/70">{{ surnames }} · {{ publication.year }}</span>
      <span class="text-xs italic leading-snug text-base-content/50">{{ venue }}</span>
    </template>
  </a>
</template>
