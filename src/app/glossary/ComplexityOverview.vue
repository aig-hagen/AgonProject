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

import { problemKeys } from '@/app/glossary/complexity'
import ComplexityCellView from '@/app/glossary/ComplexityCellView.vue'
import GlossaryInline from '@/app/glossary/GlossaryInline.vue'
import {
  type ComplexityRow,
  type ComplexityTable,
  SHOWN_PROBLEMS,
} from '@/modules/common/complexity/types'
import type { Publication } from '@/modules/common/publications/types'
import PublicationCitation from '@/modules/common/tooltip/PublicationCitation.vue'
import type { TooltipDefinition } from '@/modules/common/tooltip/tooltipRegistry'

const { table, entries } = defineProps<{
  table: ComplexityTable
  entries: Record<string, { definition: TooltipDefinition }>
}>()

const emit = defineEmits<{ follow: [ref: string] }>()

const { t } = useI18n({ useScope: 'global' })

const sections = computed(() => [
  { label: table.variant ? t('glossary.complexity.general') : '', rows: table.rows },
  ...(table.variant
    ? [{ label: t(`glossary.complexity.${table.variant.label}`), rows: table.variant.rows }]
    : []),
])

const problemsIn = (rows: Record<string, ComplexityRow>) =>
  SHOWN_PROBLEMS.filter((p) => Object.values(rows).some((row) => row[p]))

// Sources numbered in order of first appearance across the shown rows.
const sources = computed(() => {
  const list: Publication[] = []
  for (const { rows } of sections.value)
    for (const key of table.groups.flatMap((group) => group.keys))
      for (const p of SHOWN_PROBLEMS) {
        const source = rows[key]?.[p]?.source
        if (source && !list.includes(source)) list.push(source)
      }
  return list
})
const sourceNumber = (source: Publication) => sources.value.indexOf(source) + 1
</script>

<template>
  <div class="flex flex-col gap-6 text-sm">
    <section v-for="section in sections" :key="section.label">
      <h3 v-if="section.label" class="section-label mb-2">{{ section.label }}</h3>
      <div class="overflow-x-auto">
        <table class="border-collapse">
          <thead>
            <tr class="border-b border-base-300 text-left">
              <th class="font-medium pr-4 pb-1.5">{{ t('glossary.complexity.semantics') }}</th>
              <th
                v-for="problem in problemsIn(section.rows)"
                :key="problem"
                class="font-medium pr-4 pb-1.5 whitespace-nowrap"
              >
                <GlossaryInline
                  :parts="[{ ref: problemKeys[problem] }]"
                  :entries="entries"
                  @follow="emit('follow', $event)"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(group, g) in table.groups" :key="g">
              <tr>
                <th
                  :colspan="problemsIn(section.rows).length + 1"
                  class="section-label text-left pt-3 pb-1"
                >
                  {{ group.label }}
                </th>
              </tr>
              <tr
                v-for="key in group.keys"
                :key="key"
                class="border-b border-base-300/60 align-top"
              >
                <th class="text-left font-normal pr-4 py-1.5 whitespace-nowrap">
                  <GlossaryInline
                    :parts="[{ ref: key }]"
                    :entries="entries"
                    @follow="emit('follow', $event)"
                  />
                </th>
                <td v-for="problem in problemsIn(section.rows)" :key="problem" class="pr-4 py-1.5">
                  <ComplexityCellView
                    v-if="section.rows[key]?.[problem]"
                    :cell="section.rows[key][problem]"
                    :entries="entries"
                    :source-number="sourceNumber(section.rows[key][problem].source)"
                    @follow="emit('follow', $event)"
                  />
                  <span v-else class="text-base-content/40">–</span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>
    <p class="text-xs text-base-content/65">{{ t('glossary.complexity.legend') }}</p>
    <section>
      <h3 class="section-label mb-2">{{ t('glossary.complexity.sources') }}</h3>
      <ol class="flex flex-col gap-2">
        <li
          v-for="(source, i) in sources"
          :id="`complexity-source-${i + 1}`"
          :key="i"
          class="flex gap-2"
        >
          <span class="text-base-content/65 w-5 shrink-0 text-right">{{ i + 1 }}</span>
          <PublicationCitation :publication="source" compact />
        </li>
      </ol>
    </section>
  </div>
</template>
