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
import { BookOpenIcon } from '@heroicons/vue/24/outline'
import { computed, inject } from 'vue'

import { useLayoutMode } from '@/modules/common/layout/useLayoutMode'
import KatexInlineElement from '@/modules/common/tooltip/KatexInlineElement.vue'
import TermTooltip from '@/modules/common/tooltip/TermTooltip.vue'
import { TOOLTIP_REGISTRY_KEY } from '@/modules/common/tooltip/tooltipRegistry'

const { id } = defineProps<{ id: string }>()

const { isCompact } = useLayoutMode()

const registry = inject(TOOLTIP_REGISTRY_KEY, {})
const definition = computed(() => registry[id])
</script>

<template>
  <div
    v-if="definition"
    :class="
      isCompact
        ? 'rounded-box border border-base-300 bg-base-200/50 px-2.5 py-2'
        : 'text-xs text-base-content/60 leading-relaxed mt-2'
    "
  >
    <div class="flex items-center gap-1 mb-0.5">
      <KatexInlineElement
        v-if="definition.title"
        :text="definition.title"
        class="font-semibold"
        :class="isCompact ? 'text-xs text-base-content' : 'text-base-content/80'"
      />
      <span v-if="isCompact" class="flex-1"></span>
      <a
        v-if="definition.reference"
        :href="definition.reference.href"
        :title="definition.reference.label"
        target="_blank"
        rel="noopener noreferrer"
        :class="
          isCompact
            ? 'grid place-items-center size-5 rounded-md bg-primary/10 text-primary hover:bg-primary/20'
            : 'text-base-content/40 hover:text-base-content/70'
        "
      >
        <BookOpenIcon :class="isCompact ? 'size-3' : 'size-3'" />
      </a>
    </div>
    <span :class="isCompact ? 'block text-xs leading-snug text-base-content/70' : ''">
      <template v-for="(part, i) in definition.content" :key="i">
        <KatexInlineElement v-if="typeof part === 'string'" :text="part" />
        <TermTooltip v-else :id="part.ref">
          <KatexInlineElement v-if="part.label" :text="part.label" />
        </TermTooltip>
      </template>
    </span>
  </div>
</template>
