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

import { useGlossaryContext } from '@/app/glossary/glossaryContext'
import GlossaryInline from '@/app/glossary/GlossaryInline.vue'
import PrincipleCellView from '@/app/glossary/PrincipleCellView.vue'
import { defaultPrinciples, principleRowFor } from '@/app/glossary/principles'

const { termKey } = defineProps<{ termKey: string }>()

const { pathOf, titleOf } = useGlossaryContext()

const { t } = useI18n({ useScope: 'global' })

const row = computed(() => principleRowFor(termKey))

// Same principles as the overview's default selection, open results included.
const groups = computed(() => {
  if (!row.value) return []
  const { table, row: cells } = row.value
  const shown = new Set(defaultPrinciples(table))
  return table.principleGroups
    .map((group) => ({
      key: group.key,
      principles: group.principles.filter((p) => shown.has(p) && cells[p]),
    }))
    .filter((group) => group.principles.length)
})
</script>

<template>
  <section v-if="row">
    <h3 class="section-heading mb-2">{{ t('glossary.principles.title') }}</h3>
    <!-- One table, so the columns line up across groups. -->
    <table class="text-sm mb-3">
      <tbody>
        <template v-for="(group, i) in groups" :key="group.key">
          <tr>
            <th
              colspan="2"
              class="text-left text-xs font-medium text-base-content/65 pb-1"
              :class="{ 'pt-3': i > 0 }"
            >
              {{ t(`glossary.principles.groups.${group.key}`) }}
            </th>
          </tr>
          <tr v-for="principle in group.principles" :key="principle" class="align-top">
            <th class="text-left font-normal pr-6 py-0.5 whitespace-nowrap">
              <GlossaryInline :parts="[{ ref: principle, label: titleOf(principle) }]" />
            </th>
            <td class="py-0.5">
              <PrincipleCellView :cell="row.row[principle]!" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <RouterLink
      :to="pathOf(row.table.overviewKey)"
      class="mt-2 inline-block text-sm text-primary underline-offset-2 hover:underline"
    >
      {{ t('glossary.principles.compareAll') }} →
    </RouterLink>
  </section>
</template>
