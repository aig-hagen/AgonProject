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

import { complexityRowFor, problemKeys } from '@/app/glossary/complexity'
import ComplexityCellView from '@/app/glossary/ComplexityCellView.vue'
import { useGlossaryContext } from '@/app/glossary/glossaryContext'
import GlossaryInline from '@/app/glossary/GlossaryInline.vue'
import { SHOWN_PROBLEMS } from '@/modules/common/complexity/types'

const { termKey } = defineProps<{ termKey: string }>()

const { pathOf } = useGlossaryContext()

const { t } = useI18n({ useScope: 'global' })

const result = computed(() => complexityRowFor(termKey))
const problems = computed(() =>
  SHOWN_PROBLEMS.filter((p) => result.value?.row?.[p] || result.value?.variantRow?.[p]),
)
</script>

<template>
  <section v-if="result && problems.length">
    <h3 class="section-heading mb-2">{{ t('glossary.complexity.title') }}</h3>
    <div class="overflow-x-auto">
      <table class="text-sm">
        <thead v-if="result.variantRow">
          <tr class="text-left text-xs text-base-content/65">
            <th></th>
            <th class="font-medium pr-6 pb-1">{{ t('glossary.complexity.general') }}</th>
            <th class="font-medium pb-1">
              {{ t(`glossary.complexity.${result.table.variant!.label}`) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="problem in problems" :key="problem" class="align-top">
            <th class="text-left font-normal pr-6 py-1 whitespace-nowrap">
              <GlossaryInline :parts="[{ ref: problemKeys[problem] }]" />
            </th>
            <td class="pr-6 py-1">
              <ComplexityCellView v-if="result.row?.[problem]" :cell="result.row[problem]" />
              <span v-else class="text-base-content/40">–</span>
            </td>
            <td v-if="result.variantRow" class="py-1">
              <ComplexityCellView
                v-if="result.variantRow[problem]"
                :cell="result.variantRow[problem]"
              />
              <span v-else class="text-base-content/40">–</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <RouterLink
      :to="pathOf(result.table.overviewKey)"
      class="mt-2 inline-block text-sm text-primary underline-offset-2 hover:underline"
    >
      {{ t('glossary.complexity.compareAll') }} →
    </RouterLink>
  </section>
</template>
