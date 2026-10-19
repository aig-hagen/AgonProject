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

import GlossaryInline from '@/app/glossary/GlossaryInline.vue'
import PrincipleCellView from '@/app/glossary/PrincipleCellView.vue'
import {
  cardinalityKey,
  principleColumnFor,
  principleRowFor,
  type PrincipleStatus,
  principleStatus,
} from '@/app/glossary/principles'
import { formatCitation, publicationHref, shortLabel } from '@/modules/common/publications/format'
import type { TooltipDefinition } from '@/modules/common/tooltip/tooltipRegistry'

const { termKey, entries } = defineProps<{
  termKey: string
  entries: Record<string, { definition: TooltipDefinition }>
}>()

const emit = defineEmits<{ follow: [ref: string] }>()

const { t } = useI18n({ useScope: 'global' })

// A semantics entry shows its row, a principle entry its column.
const row = computed(() => principleRowFor(termKey))
const column = computed(() => (row.value ? undefined : principleColumnFor(termKey)))

const groups = computed(() =>
  row.value
    ? row.value.table.principleGroups
        .map((group) => ({
          key: group.key,
          principles: group.principles.filter((p) => row.value!.row[p]),
        }))
        .filter((group) => group.principles.length)
    : [],
)
const cardinality = computed(() => row.value?.table.cardinality[termKey])

const STATUSES: PrincipleStatus[] = ['satisfied', 'violated', 'open']
const statusLabels: Record<PrincipleStatus, string> = {
  satisfied: 'satisfiedBy',
  violated: 'violatedBy',
  open: 'openFor',
}
const byStatus = computed(() =>
  STATUSES.map((status) => ({
    status,
    cells: column.value?.cells.filter(([, cell]) => principleStatus(cell) === status) ?? [],
  })).filter((entry) => entry.cells.length),
)
</script>

<template>
  <section v-if="row || column?.cells.length">
    <h3 class="section-label mb-2">{{ t('glossary.principles.title') }}</h3>
    <template v-if="row">
      <p v-if="cardinality" class="text-sm mb-3">
        {{ t('glossary.principles.cardinality') }}:
        {{ t(`glossary.principles.cardinalityValues.${cardinalityKey[cardinality.value]}`) }}
        <a
          v-if="cardinality.source"
          :href="publicationHref(cardinality.source)"
          :title="formatCitation(cardinality.source)"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs text-base-content/65 hover:text-primary"
          >· {{ shortLabel(cardinality.source) }}, {{ cardinality.locator }}</a
        >
      </p>
      <div v-for="group in groups" :key="group.key" class="mb-3">
        <h4 class="text-xs font-medium text-base-content/65 mb-1">
          {{ t(`glossary.principles.groups.${group.key}`) }}
        </h4>
        <table class="text-sm">
          <tbody>
            <tr v-for="principle in group.principles" :key="principle" class="align-top">
              <th class="text-left font-normal pr-6 py-0.5 whitespace-nowrap">
                <GlossaryInline
                  :parts="[{ ref: principle }]"
                  :entries="entries"
                  @follow="emit('follow', $event)"
                />
              </th>
              <td class="py-0.5">
                <PrincipleCellView :cell="row.row[principle]!" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <dl v-else class="text-sm flex flex-col gap-2">
      <div v-for="entry in byStatus" :key="entry.status">
        <dt class="text-xs font-medium text-base-content/65">
          {{ t(`glossary.principles.${statusLabels[entry.status]}`) }}
        </dt>
        <dd class="flex flex-wrap gap-x-3 gap-y-1">
          <span v-for="[key, cell] in entry.cells" :key="key" :title="cell.remark">
            <GlossaryInline
              :parts="[{ ref: key }]"
              :entries="entries"
              @follow="emit('follow', $event)"
            />
          </span>
        </dd>
      </div>
    </dl>
    <button
      class="mt-2 text-sm text-primary hover:opacity-70"
      @click="emit('follow', (row ?? column)!.table.overviewKey)"
    >
      {{ t('glossary.principles.compareAll') }} →
    </button>
  </section>
</template>
