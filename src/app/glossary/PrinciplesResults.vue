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
import { principleRowFor } from '@/app/glossary/principles'
import type { TooltipDefinition } from '@/modules/common/tooltip/tooltipRegistry'

const { termKey, entries } = defineProps<{
  termKey: string
  entries: Record<string, { definition: TooltipDefinition }>
}>()

const emit = defineEmits<{ follow: [ref: string] }>()

const { t } = useI18n({ useScope: 'global' })

const row = computed(() => principleRowFor(termKey))

const groups = computed(() =>
  row.value
    ? row.value.table.principleGroups
        .map((group) => ({
          key: group.key,
          // Open results stay in the overview table only.
          principles: group.principles.filter((p) => row.value!.row[p]?.holds !== undefined),
        }))
        .filter((group) => group.principles.length)
    : [],
)
</script>

<template>
  <section v-if="row">
    <h3 class="section-label mb-2">{{ t('glossary.principles.title') }}</h3>
    <div v-for="group in groups" :key="group.key" class="mb-3">
      <h4 class="text-xs font-medium text-base-content/65 mb-1">
        {{ t(`glossary.principles.groups.${group.key}`) }}
      </h4>
      <table class="text-sm">
        <tbody>
          <tr v-for="principle in group.principles" :key="principle" class="align-top">
            <th class="text-left font-normal pr-6 py-0.5 whitespace-nowrap">
              <GlossaryInline
                :parts="[
                  {
                    ref: principle,
                    label:
                      entries[principle]?.definition.title ??
                      entries[principle]?.definition.label ??
                      principle,
                  },
                ]"
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
    <button
      class="mt-2 text-sm text-primary hover:opacity-70"
      @click="emit('follow', row.table.overviewKey)"
    >
      {{ t('glossary.principles.compareAll') }} →
    </button>
  </section>
</template>
