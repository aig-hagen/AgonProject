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

import HoverTooltip from '@/modules/common/tooltip/HoverTooltip.vue'
import KatexInlineElement from '@/modules/common/tooltip/KatexInlineElement.vue'
import { TOOLTIP_REGISTRY_KEY } from '@/modules/common/tooltip/tooltipRegistry'

const { id } = defineProps<{ id: string }>()

const registry = inject(TOOLTIP_REGISTRY_KEY, {})
const definition = computed(() => registry[id])
</script>

<template>
  <!--
    When id is not in the registry, render the slot text without any tooltip so the
    page still reads correctly even if a definition is missing.
  -->
  <HoverTooltip v-if="definition">
    <slot><KatexInlineElement :text="definition.label" /></slot>
    <template #content>
      <div
        v-if="definition.title || definition.reference"
        class="flex items-center justify-between mb-2 pb-1 border-b border-base-300"
      >
        <KatexInlineElement
          v-if="definition.title"
          :text="definition.title"
          class="font-semibold text-xs"
        />
        <a
          v-if="definition.reference"
          :href="definition.reference.href"
          :title="definition.reference.label"
          target="_blank"
          rel="noopener noreferrer"
          class="ml-auto text-base-content/40 hover:text-base-content/70 shrink-0"
        >
          <BookOpenIcon class="size-3" />
        </a>
      </div>
      <span>
        <template v-for="(part, i) in definition.content" :key="i">
          <KatexInlineElement v-if="typeof part === 'string'" :text="part as string" />
          <!-- Recursive: inline refs expand into nested TermTooltips automatically. -->
          <TermTooltip v-else :id="part.ref">
            <KatexInlineElement v-if="part.label" :text="part.label" />
          </TermTooltip>
        </template>
      </span>
    </template>
  </HoverTooltip>
  <slot v-else />
</template>
