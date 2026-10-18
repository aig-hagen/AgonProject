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

import { cellParts } from '@/app/glossary/complexity'
import GlossaryInline from '@/app/glossary/GlossaryInline.vue'
import type { ComplexityCell } from '@/modules/common/complexity/types'
import { formatCitation, publicationHref, shortLabel } from '@/modules/common/publications/format'
import type { TooltipDefinition } from '@/modules/common/tooltip/tooltipRegistry'

const { cell, entries, sourceNumber } = defineProps<{
  cell: ComplexityCell
  entries: Record<string, { definition: TooltipDefinition }>
  /** Set in the overview table: cite by number instead of spelling out the source. */
  sourceNumber?: number
}>()

const emit = defineEmits<{ follow: [ref: string] }>()

const { t } = useI18n({ useScope: 'global' })

const parts = computed(() =>
  cellParts(cell, {
    trivial: t('glossary.complexity.trivial'),
    complete: sourceNumber
      ? t('glossary.complexity.completeShort')
      : t('glossary.complexity.complete'),
    hard: t('glossary.complexity.hard'),
    in: t('glossary.complexity.in'),
    // The table explains ∉ in its legend.
    unless: sourceNumber ? undefined : t('glossary.complexity.unlessPNP'),
  }),
)

const details = computed(() => [shortLabel(cell.source), cell.note].filter(Boolean).join(' · '))
</script>

<template>
  <span v-if="sourceNumber" :title="details" class="whitespace-nowrap">
    <GlossaryInline :parts="parts" :entries="entries" @follow="emit('follow', $event)" />
    <sup class="ml-0.5 text-base-content/65">
      <a :href="`#complexity-source-${sourceNumber}`" class="hover:text-primary">{{
        sourceNumber
      }}</a
      ><span v-if="cell.note">*</span>
    </sup>
  </span>
  <span v-else class="flex flex-col">
    <span>
      <GlossaryInline :parts="parts" :entries="entries" @follow="emit('follow', $event)" />
      <span v-if="cell.note" class="text-base-content/65"> ({{ cell.note }})</span>
    </span>
    <a
      :href="publicationHref(cell.source)"
      :title="formatCitation(cell.source)"
      target="_blank"
      rel="noopener noreferrer"
      class="text-xs text-base-content/65 hover:text-primary"
      >{{ shortLabel(cell.source) }}</a
    >
  </span>
</template>
