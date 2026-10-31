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
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import FilterDropdown from '@/app/glossary/FilterDropdown.vue'
import { useGlossaryContext } from '@/app/glossary/glossaryContext'
import GlossaryInline from '@/app/glossary/GlossaryInline.vue'
import PrincipleCellView from '@/app/glossary/PrincipleCellView.vue'
import { defaultPrinciples } from '@/app/glossary/principles'
import { compareEntries } from '@/app/literature/search'
import { useLayoutMode } from '@/modules/common/layout/useLayoutMode'
import type { PrincipleTable } from '@/modules/common/principles/types'
import type { Publication } from '@/modules/common/publications/types'
import PublicationCitation from '@/modules/common/tooltip/PublicationCitation.vue'
import TermTooltip from '@/modules/common/tooltip/TermTooltip.vue'

const { table } = defineProps<{ table: PrincipleTable }>()

const { entries, pathOf, titleOf } = useGlossaryContext()
// Compact: no tooltips (a tap would both open one and navigate), and the table scrolls in its own
// box with sticky header row and first column.
const { isCompact } = useLayoutMode()

const { t } = useI18n({ useScope: 'global' })

const shownSemantics = ref(new Set(table.groups.flatMap((group) => group.keys)))
const shownPrinciples = ref(new Set(defaultPrinciples(table)))
const filterPrincipleGroups = computed(() =>
  table.principleGroups.map((group) => ({
    label: t(`glossary.principles.groups.${group.key}`),
    keys: group.principles,
  })),
)

const semanticsGroups = computed(() =>
  table.groups
    .map((group) => ({ ...group, keys: group.keys.filter((k) => shownSemantics.value.has(k)) }))
    .filter((group) => group.keys.length),
)
const columns = computed(() => semanticsGroups.value.flatMap((group) => group.keys))
const principleGroups = computed(() =>
  table.principleGroups
    .map((group) => ({
      ...group,
      principles: group.principles.filter((p) => shownPrinciples.value.has(p)),
    }))
    .filter((group) => group.principles.length),
)

// Sources of the shown cells, in bibliography order.
const sources = computed(() => {
  const found = new Set<Publication>()
  for (const key of columns.value)
    for (const p of principleGroups.value.flatMap((group) => group.principles)) {
      const source = table.rows[key]?.[p]?.source
      if (source) found.add(source)
    }
  return [...found].sort((a, b) =>
    compareEntries({ key: '', publication: a }, { key: '', publication: b }),
  )
})

const labelOf = (key: string) => entries[key]?.definition.label ?? key
</script>

<template>
  <div class="flex flex-col gap-4 text-sm">
    <div class="flex flex-wrap gap-2">
      <FilterDropdown
        v-model="shownSemantics"
        :label="t('glossary.principles.semantics')"
        :groups="table.groups"
        :item-label="labelOf"
      />
      <FilterDropdown
        v-model="shownPrinciples"
        :label="t('glossary.principles.title')"
        :groups="filterPrincipleGroups"
        :item-label="titleOf"
      />
    </div>

    <div
      v-if="columns.length && principleGroups.length"
      :class="isCompact ? 'max-h-[70dvh] overflow-auto' : 'overflow-x-auto'"
    >
      <table class="border-collapse">
        <thead>
          <tr class="text-left">
            <th></th>
            <th
              v-for="group in semanticsGroups"
              :key="group.label"
              :colspan="group.keys.length"
              :title="group.label"
              class="text-xs font-medium text-base-content/65 px-1 pb-1 border-l border-base-300"
            >
              <!-- Zero width, so a long label can't widen its columns. -->
              <div class="w-0 min-w-full truncate">{{ group.label }}</div>
            </th>
          </tr>
          <tr class="border-b border-base-300">
            <th
              class="text-left font-medium pr-4 pb-1.5"
              :class="{ 'table-sticky-head table-sticky-col': isCompact }"
            >
              {{ t('glossary.principles.principle') }}
            </th>
            <th
              v-for="key in columns"
              :key="key"
              class="w-8 min-w-8 text-xs font-medium px-0.5 pb-1.5"
              :class="{ 'table-sticky-head': isCompact }"
            >
              <component
                :is="isCompact ? 'span' : TermTooltip"
                v-bind="isCompact ? {} : { id: key, triggerClass: '' }"
              >
                <RouterLink :to="pathOf(key)" class="hover:text-primary">
                  {{ key }}
                </RouterLink>
              </component>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="group in principleGroups" :key="group.key">
            <tr>
              <th
                :colspan="columns.length + 1"
                class="bg-base-200 font-medium text-left px-1.5 py-1"
              >
                <span class="sticky left-1.5">
                  {{ t(`glossary.principles.groups.${group.key}`) }}
                </span>
              </th>
            </tr>
            <tr
              v-for="principle in group.principles"
              :key="principle"
              class="border-b border-base-300"
            >
              <!-- Compact: names wrap in a narrow column so the marks get the width. -->
              <th
                class="text-left font-normal pr-4 py-1"
                :class="
                  isCompact ? 'table-sticky-col w-32 min-w-32 leading-snug' : 'whitespace-nowrap'
                "
              >
                <GlossaryInline :parts="[{ ref: principle, label: titleOf(principle) }]" />
              </th>
              <td v-for="key in columns" :key="key" class="px-0.5 py-1 text-center">
                <PrincipleCellView
                  v-if="table.rows[key]?.[principle]"
                  :cell="table.rows[key][principle]"
                  compact
                />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <p class="text-xs text-base-content/65">{{ t('glossary.principles.legend') }}</p>
    <section v-if="sources.length">
      <h3 class="section-heading mb-2">{{ t('glossary.sources') }}</h3>
      <ul class="flex flex-col gap-2">
        <li v-for="(source, i) in sources" :key="i">
          <PublicationCitation :publication="source" compact />
        </li>
      </ul>
    </section>
  </div>
</template>
