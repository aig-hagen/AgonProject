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
import { listTitle } from '@/app/glossary/glossaryContext'
import GlossaryEntryDetails from '@/app/glossary/GlossaryEntryDetails.vue'
import GlossaryInline from '@/app/glossary/GlossaryInline.vue'
import { principleRowFor, principleTableFor } from '@/app/glossary/principles'
import KatexInlineElement from '@/modules/common/tooltip/KatexInlineElement.vue'
import PublicationCitation from '@/modules/common/tooltip/PublicationCitation.vue'
import TermSymbol from '@/modules/common/tooltip/TermSymbol.vue'
import type { TooltipDefinition } from '@/modules/common/tooltip/tooltipRegistry'

const {
  termKey,
  definition,
  backlinks = [],
  pinned = false,
  active = false,
} = defineProps<{
  termKey: string
  definition: TooltipDefinition
  backlinks?: { key: string; definition: TooltipDefinition }[]
  pinned?: boolean
  /** The term in the URL: highlighted and opened. */
  active?: boolean
}>()

const { t } = useI18n({ useScope: 'global' })

const hasDetails = computed(
  () =>
    !!definition.body ||
    backlinks.length > 0 ||
    !!(complexityRowFor(termKey) || complexityTableFor(termKey)) ||
    !!(principleRowFor(termKey) || principleTableFor(termKey)),
)

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
    class="rounded-box border p-3"
    :class="pinned || active ? 'border-primary/40 bg-primary/5' : 'border-base-300'"
  >
    <h3 class="flex items-center gap-1.5 text-base font-semibold leading-snug">
      <MapPinIcon v-if="pinned" class="size-4 text-primary shrink-0" />
      <KatexInlineElement :text="listTitle(definition)" />
      <TermSymbol v-if="definition.symbol" :symbol="definition.symbol" class="text-xs" />
    </h3>
    <p class="mt-1.5 text-sm leading-relaxed text-base-content/80">
      <GlossaryInline :parts="definition.content" />
    </p>
    <PublicationCitation
      v-if="definition.reference"
      :publication="definition.reference"
      compact
      class="mt-2.5 pt-2.5 border-t border-base-300"
    />
    <template v-if="hasDetails">
      <GlossaryEntryDetails
        v-if="expanded"
        :term-key="termKey"
        :definition="definition"
        :backlinks="backlinks"
        compact
        class="mt-2.5 pt-2.5 border-t border-base-300 text-sm"
      />
      <button
        class="-mb-3 flex min-h-11 items-center gap-1 text-xs font-medium text-primary"
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
