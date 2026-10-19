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

import { principleStatus, statusMark } from '@/app/glossary/principles'
import type { PrincipleCell } from '@/modules/common/principles/types'
import { formatCitation, publicationHref, shortLabel } from '@/modules/common/publications/format'

const { cell, compact } = defineProps<{
  cell: PrincipleCell
  /** Overview table: only the mark, with the details on hover. */
  compact?: boolean
}>()

const status = computed(() => principleStatus(cell))
const details = computed(() =>
  [cell.source && shortLabel(cell.source), cell.remark].filter(Boolean).join(' · '),
)
const markClass = computed(
  () =>
    ({
      satisfied: 'text-success',
      violated: 'text-error',
      open: 'text-base-content/50',
    })[status.value],
)
</script>

<template>
  <span v-if="compact" :title="details" :class="markClass" class="cursor-default">
    {{ statusMark[status] }}
  </span>
  <span v-else class="flex flex-col">
    <span>
      <span :class="markClass">{{ statusMark[status] }}</span>
      <a
        v-if="cell.source"
        :href="publicationHref(cell.source)"
        :title="formatCitation(cell.source)"
        target="_blank"
        rel="noopener noreferrer"
        class="text-xs text-base-content/65 hover:text-primary"
        >{{ shortLabel(cell.source) }}</a
      >
    </span>
    <span v-if="cell.remark" class="text-xs text-base-content/65">{{ cell.remark }}</span>
  </span>
</template>
