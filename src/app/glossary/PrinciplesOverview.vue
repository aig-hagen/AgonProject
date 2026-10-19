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

import GlossaryInline from '@/app/glossary/GlossaryInline.vue'
import PrincipleCellView from '@/app/glossary/PrincipleCellView.vue'
import type { PrincipleTable } from '@/modules/common/principles/types'
import KatexInlineElement from '@/modules/common/tooltip/KatexInlineElement.vue'
import type { TooltipDefinition } from '@/modules/common/tooltip/tooltipRegistry'

const { table, entries } = defineProps<{
  table: PrincipleTable
  entries: Record<string, { definition: TooltipDefinition }>
}>()

const emit = defineEmits<{ follow: [ref: string] }>()

const { t } = useI18n({ useScope: 'global' })

const allSemantics = table.groups.flatMap((group) => group.keys)
const allPrinciples = table.principleGroups.flatMap((group) => group.principles)
const shownSemantics = ref(new Set(allSemantics))
const shownPrinciples = ref(
  new Set(allPrinciples.filter((p) => !table.hiddenByDefault?.includes(p))),
)

function toggle(set: Set<string>, key: string) {
  if (set.has(key)) set.delete(key)
  else set.add(key)
}

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

const labelOf = (key: string) => entries[key]?.definition.label ?? key
const titleOf = (key: string) => entries[key]?.definition.title ?? labelOf(key)
</script>

<template>
  <div class="flex flex-col gap-4 text-sm">
    <div class="flex flex-wrap gap-2">
      <details class="dropdown">
        <summary class="btn btn-sm">
          {{ t('glossary.principles.show') }}: {{ t('glossary.principles.semantics') }} ({{
            shownSemantics.size
          }}/{{ allSemantics.length }})
        </summary>
        <div
          class="dropdown-content z-10 mt-1 p-3 w-72 max-h-96 overflow-y-auto bg-base-100 border border-base-300 rounded-box shadow"
        >
          <div class="flex gap-3 mb-2">
            <button class="text-primary" @click="shownSemantics = new Set(allSemantics)">
              {{ t('glossary.principles.all') }}
            </button>
            <button class="text-primary" @click="shownSemantics = new Set()">
              {{ t('glossary.principles.none') }}
            </button>
          </div>
          <template v-for="group in table.groups" :key="group.label">
            <p class="section-label mt-2 mb-1">{{ group.label }}</p>
            <label v-for="key in group.keys" :key="key" class="flex items-center gap-2 py-0.5">
              <input
                type="checkbox"
                class="checkbox checkbox-xs"
                :checked="shownSemantics.has(key)"
                @change="toggle(shownSemantics, key)"
              />
              {{ labelOf(key) }}
            </label>
          </template>
        </div>
      </details>
      <details class="dropdown">
        <summary class="btn btn-sm">
          {{ t('glossary.principles.show') }}: {{ t('glossary.principles.title') }} ({{
            shownPrinciples.size
          }}/{{ allPrinciples.length }})
        </summary>
        <div
          class="dropdown-content z-10 mt-1 p-3 w-80 max-h-96 overflow-y-auto bg-base-100 border border-base-300 rounded-box shadow"
        >
          <div class="flex gap-3 mb-2">
            <button class="text-primary" @click="shownPrinciples = new Set(allPrinciples)">
              {{ t('glossary.principles.all') }}
            </button>
            <button class="text-primary" @click="shownPrinciples = new Set()">
              {{ t('glossary.principles.none') }}
            </button>
          </div>
          <template v-for="group in table.principleGroups" :key="group.key">
            <p class="section-label mt-2 mb-1">
              {{ t(`glossary.principles.groups.${group.key}`) }}
            </p>
            <label
              v-for="key in group.principles"
              :key="key"
              class="flex items-center gap-2 py-0.5"
            >
              <input
                type="checkbox"
                class="checkbox checkbox-xs"
                :checked="shownPrinciples.has(key)"
                @change="toggle(shownPrinciples, key)"
              />
              <KatexInlineElement :text="titleOf(key)" />
            </label>
          </template>
        </div>
      </details>
    </div>

    <div v-if="columns.length && principleGroups.length" class="overflow-x-auto">
      <table class="border-collapse">
        <thead>
          <tr class="text-left">
            <th></th>
            <th
              v-for="group in semanticsGroups"
              :key="group.label"
              :colspan="group.keys.length"
              :title="group.label"
              class="section-label font-medium px-1 pb-1 border-l border-base-300"
            >
              <!-- Zero width, so a long label can't widen its columns. -->
              <div class="w-0 min-w-full truncate">{{ group.label }}</div>
            </th>
          </tr>
          <tr class="border-b border-base-300">
            <th class="text-left font-medium pr-4 pb-1.5">
              {{ t('glossary.principles.principle') }}
            </th>
            <th
              v-for="key in columns"
              :key="key"
              class="w-8 min-w-8 text-xs font-medium px-0.5 pb-1.5"
            >
              <button class="hover:text-primary" :title="labelOf(key)" @click="emit('follow', key)">
                {{ key }}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="group in principleGroups" :key="group.key">
            <tr>
              <th :colspan="columns.length + 1" class="section-label text-left pt-3 pb-1">
                {{ t(`glossary.principles.groups.${group.key}`) }}
              </th>
            </tr>
            <tr
              v-for="principle in group.principles"
              :key="principle"
              class="border-b border-base-300/60"
            >
              <th class="text-left font-normal pr-4 py-1 whitespace-nowrap">
                <GlossaryInline
                  :parts="[{ ref: principle, label: titleOf(principle) }]"
                  :entries="entries"
                  @follow="emit('follow', $event)"
                />
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
  </div>
</template>
