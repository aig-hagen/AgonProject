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
import SourceLink from '@/app/glossary/SourceLink.vue'
import type { ComplexityCell } from '@/modules/common/complexity/types'
import { shortLabel } from '@/modules/common/publications/format'

const { cell, sourceNumber } = defineProps<{
  cell: ComplexityCell
  /** Set in the overview table: cite by number instead of spelling out the source. */
  sourceNumber?: number
}>()

const { t } = useI18n({ useScope: 'global' })

const parts = computed(() =>
  cellParts(cell, {
    trivial: t('glossary.complexity.trivial'),
    complete: sourceNumber
      ? t('glossary.complexity.completeShort')
      : t('glossary.complexity.complete'),
    hard: t('glossary.complexity.hard'),
    in: t('glossary.complexity.in'),
    // The overview table leaves the caveat out to keep its cells narrow.
    unless: sourceNumber ? undefined : t('glossary.complexity.unlessPNP'),
  }),
)

const details = computed(() => [shortLabel(cell.source), cell.note].filter(Boolean).join(' · '))
</script>

<template>
  <span v-if="sourceNumber" :title="details" class="whitespace-nowrap">
    <GlossaryInline :parts="parts" />
    <sup class="ml-0.5 text-base-content/65">
      <a :href="`#complexity-source-${sourceNumber}`" class="hover:text-primary">{{
        sourceNumber
      }}</a
      ><span v-if="cell.note">*</span>
    </sup>
  </span>
  <span v-else class="flex flex-col">
    <span>
      <GlossaryInline :parts="parts" />
      <span v-if="cell.note" class="text-base-content/65"> ({{ cell.note }})</span>
    </span>
    <SourceLink
      :publication="cell.source"
      class="text-xs text-base-content/65 hover:text-primary"
    />
  </span>
</template>
