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
import { useI18n } from 'vue-i18n'

import { useLayoutMode } from '@/modules/common/layout/useLayoutMode'
import { formatCitation, publicationHref } from '@/modules/common/publications/format'
import KatexInlineElement from '@/modules/common/tooltip/KatexInlineElement.vue'
import TermSymbol from '@/modules/common/tooltip/TermSymbol.vue'
import TermTooltip from '@/modules/common/tooltip/TermTooltip.vue'
import { TOOLTIP_REGISTRY_KEY } from '@/modules/common/tooltip/tooltipRegistry'

const { id } = defineProps<{ id: string }>()

const { isCompact } = useLayoutMode()
const { t } = useI18n({ useScope: 'global' })

const registry = inject(TOOLTIP_REGISTRY_KEY, {})
const definition = computed(() => registry[id])
</script>

<template>
  <div
    v-if="definition"
    :class="
      isCompact
        ? 'rounded-box border border-base-300 bg-inset px-2.5 py-2'
        : 'text-xs text-base-content/65 leading-relaxed mt-2'
    "
  >
    <div class="flex items-center gap-1 mb-0.5">
      <KatexInlineElement
        v-if="definition.title"
        :text="definition.title"
        class="font-semibold"
        :class="isCompact ? 'text-xs text-base-content' : 'text-base-content/80'"
      />
      <TermSymbol v-if="definition.symbol" :symbol="definition.symbol" class="ml-0.5 text-xs" />
      <a
        v-if="definition.reference"
        :href="publicationHref(definition.reference)"
        :title="formatCitation(definition.reference)"
        target="_blank"
        rel="noopener noreferrer"
        class="ml-auto"
        :class="
          isCompact
            ? 'grid place-items-center size-5 rounded-field bg-primary/10 text-primary hover:bg-primary/20'
            : 'text-base-content/65 hover:text-base-content'
        "
      >
        <BookOpenIcon :class="isCompact ? 'size-3' : 'size-3'" />
      </a>
    </div>
    <!-- Floated so "More" shares the last line of the definition when it fits. -->
    <div class="flow-root" :class="isCompact ? 'text-xs leading-snug text-base-content/80' : ''">
      <template v-for="(part, i) in definition.content" :key="i">
        <KatexInlineElement v-if="typeof part === 'string'" :text="part" />
        <em v-else-if="'em' in part"><KatexInlineElement :text="part.em" /></em>
        <TermTooltip v-else :id="part.ref">
          <KatexInlineElement v-if="part.label" :text="part.label" />
        </TermTooltip>
      </template>
      <RouterLink
        v-if="definition.body"
        :to="{ path: '/glossary', query: { term: id } }"
        class="float-right ml-2 text-xs font-medium text-primary underline-offset-2 hover:underline"
      >
        {{ t('glossary.more') }} →
      </RouterLink>
    </div>
  </div>
</template>
