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
import { ChevronDownIcon, MapPinIcon } from '@heroicons/vue/24/outline'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { complexityRowFor, complexityTableFor } from '@/app/glossary/complexity'
import ComplexityOverview from '@/app/glossary/ComplexityOverview.vue'
import ComplexityResults from '@/app/glossary/ComplexityResults.vue'
import GlossaryBody from '@/app/glossary/GlossaryBody.vue'
import GlossaryInline from '@/app/glossary/GlossaryInline.vue'
import KatexInlineElement from '@/modules/common/tooltip/KatexInlineElement.vue'
import PublicationCitation from '@/modules/common/tooltip/PublicationCitation.vue'
import type { TooltipDefinition } from '@/modules/common/tooltip/tooltipRegistry'

const {
  termKey,
  definition,
  entries,
  backlinks = [],
  pinned = false,
  active = false,
} = defineProps<{
  termKey: string
  definition: TooltipDefinition
  entries: Record<string, { definition: TooltipDefinition }>
  backlinks?: { key: string; definition: TooltipDefinition }[]
  pinned?: boolean
  /** The term in the URL: highlighted and opened. */
  active?: boolean
}>()

const emit = defineEmits<{ follow: [ref: string] }>()

const { t } = useI18n({ useScope: 'global' })

const overviewTable = computed(() => complexityTableFor(termKey))
const hasComplexity = computed(() => !!complexityRowFor(termKey) || !!overviewTable.value)

const expanded = ref(active)
watch(
  () => active,
  (isActive) => {
    if (isActive) expanded.value = true
  },
)
</script>

<template>
  <article
    class="rounded-box border p-3.5"
    :class="pinned || active ? 'border-primary/40 bg-primary/5' : 'border-base-300'"
  >
    <h3 class="flex items-center gap-1.5 text-base font-semibold leading-snug">
      <MapPinIcon v-if="pinned" class="size-4 text-primary shrink-0" />
      <KatexInlineElement :text="definition.title ?? definition.label" />
      <span
        v-if="definition.untranslated"
        class="badge badge-xs badge-ghost ml-auto shrink-0 font-normal text-base-content/65"
      >
        {{ t('glossary.englishOnly') }}
      </span>
    </h3>
    <p class="mt-1.5 text-sm leading-relaxed text-base-content/80">
      <GlossaryInline
        :parts="definition.content"
        :entries="entries"
        @follow="emit('follow', $event)"
      />
    </p>
    <PublicationCitation
      v-if="definition.reference"
      :publication="definition.reference"
      compact
      class="mt-2.5 pt-2.5 border-t border-base-300"
    />
    <template v-if="definition.body || backlinks.length || hasComplexity">
      <div v-if="expanded" class="mt-2.5 pt-2.5 border-t border-base-300 text-sm">
        <GlossaryBody
          v-if="definition.body"
          :blocks="definition.body"
          :entries="entries"
          @follow="emit('follow', $event)"
        />
        <ComplexityOverview
          v-if="overviewTable"
          :table="overviewTable"
          :entries="entries"
          class="mt-3"
          @follow="emit('follow', $event)"
        />
        <ComplexityResults
          :term-key="termKey"
          :entries="entries"
          class="mt-3"
          @follow="emit('follow', $event)"
        />
        <section v-if="backlinks.length" class="mt-3">
          <h4 class="section-label mb-1">{{ t('glossary.referencedBy') }}</h4>
          <div class="flex flex-wrap gap-x-3 gap-y-1">
            <button
              v-for="link in backlinks"
              :key="link.key"
              class="text-primary"
              @click="emit('follow', link.key)"
            >
              <KatexInlineElement :text="link.definition.title ?? link.definition.label" />
            </button>
          </div>
        </section>
      </div>
      <button
        class="mt-2 flex items-center gap-1 text-xs font-medium text-primary"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        {{ expanded ? t('glossary.less') : t('glossary.more') }}
        <ChevronDownIcon
          class="size-3.5 transition-transform"
          :class="{ 'rotate-180': expanded }"
        />
      </button>
    </template>
  </article>
</template>
