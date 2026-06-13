<!--
  Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.

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
  along with this program, if not, see <https://www.gnu.org/licenses/>.
-->
<script setup lang="ts">
import { BookOpenIcon } from '@heroicons/vue/24/outline'
import { computed, inject } from 'vue'

import KatexInlineElement from '@/modules/common/tooltip/KatexInlineElement.vue'
import TermTooltip from '@/modules/common/tooltip/TermTooltip.vue'
import { TOOLTIP_REGISTRY_KEY } from '@/modules/common/tooltip/tooltipRegistry'

const { id } = defineProps<{ id: string }>()

const registry = inject(TOOLTIP_REGISTRY_KEY, {})
const definition = computed(() => registry[id])
</script>

<template>
  <div v-if="definition" class="text-xs text-base-content/60 leading-relaxed mt-2">
    <div class="flex items-center gap-1 mb-0.5">
      <span v-if="definition.title" class="font-semibold text-base-content/80">{{ definition.title }}</span>
      <a
        v-if="definition.reference"
        :href="definition.reference.href"
        :title="definition.reference.label"
        target="_blank"
        rel="noopener noreferrer"
        class="text-base-content/40 hover:text-base-content/70"
      >
        <BookOpenIcon class="size-3" />
      </a>
    </div>
    <span>
      <template v-for="(part, i) in definition.content" :key="i">
        <KatexInlineElement v-if="typeof part === 'string'" :text="part" />
        <TermTooltip v-else :id="part.ref">
          <KatexInlineElement v-if="part.label" :text="part.label" />
        </TermTooltip>
      </template>
    </span>
  </div>
</template>
