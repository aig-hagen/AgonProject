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

import { complexityTableFor } from '@/app/glossary/complexity'
import ComplexityOverview from '@/app/glossary/ComplexityOverview.vue'
import ComplexityResults from '@/app/glossary/ComplexityResults.vue'
import GlossaryBody from '@/app/glossary/GlossaryBody.vue'
import { termTitle, useGlossaryContext } from '@/app/glossary/glossaryContext'
import { principleTableFor } from '@/app/glossary/principles'
import PrinciplesOverview from '@/app/glossary/PrinciplesOverview.vue'
import PrinciplesResults from '@/app/glossary/PrinciplesResults.vue'
import KatexInlineElement from '@/modules/common/tooltip/KatexInlineElement.vue'
import PublicationCitation from '@/modules/common/tooltip/PublicationCitation.vue'
import type { TooltipDefinition } from '@/modules/common/tooltip/tooltipRegistry'

const {
  termKey,
  definition,
  backlinks = [],
  compact = false,
} = defineProps<{
  termKey: string
  definition: TooltipDefinition
  backlinks?: { key: string; definition: TooltipDefinition }[]
  /** Mobile card: tighter spacing, and the source is shown by the card itself. */
  compact?: boolean
}>()

const { t } = useI18n({ useScope: 'global' })
const { pathOf } = useGlossaryContext()

const complexityOverview = computed(() => complexityTableFor(termKey))
const principleOverview = computed(() => principleTableFor(termKey))

const overviewClass = computed(() => (compact ? 'mt-3' : 'mt-6'))
const sectionClass = computed(() => (compact ? 'mt-3' : 'mt-6 pt-4 border-t border-base-300'))
</script>

<template>
  <div>
    <GlossaryBody v-if="definition.body" :blocks="definition.body" :class="{ 'mt-4': !compact }" />
    <ComplexityOverview
      v-if="complexityOverview"
      :table="complexityOverview"
      :class="overviewClass"
    />
    <ComplexityResults :term-key="termKey" :class="sectionClass" />
    <PrinciplesOverview
      v-if="principleOverview"
      :table="principleOverview"
      :class="overviewClass"
    />
    <PrinciplesResults :term-key="termKey" :class="sectionClass" />
    <section v-if="!compact && definition.reference" :class="sectionClass">
      <h3 class="section-label mb-2">{{ t('glossary.source') }}</h3>
      <PublicationCitation :publication="definition.reference" />
    </section>
    <section v-if="backlinks.length" :class="sectionClass">
      <component
        :is="compact ? 'h4' : 'h3'"
        class="section-label"
        :class="compact ? 'mb-1' : 'mb-2'"
      >
        {{ t('glossary.referencedBy') }}
      </component>
      <ul class="flex flex-wrap gap-y-1" :class="compact ? 'gap-x-3' : 'gap-x-4 text-sm'">
        <li v-for="link in backlinks" :key="link.key">
          <RouterLink
            :to="pathOf(link.key)"
            class="text-primary underline-offset-2 hover:underline"
          >
            <KatexInlineElement :text="termTitle(link.definition)" />
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>
