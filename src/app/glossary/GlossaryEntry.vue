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
import { termTitle } from '@/app/glossary/glossaryContext'
import GlossaryEntryDetails from '@/app/glossary/GlossaryEntryDetails.vue'
import GlossaryInline from '@/app/glossary/GlossaryInline.vue'
import KatexInlineElement from '@/modules/common/tooltip/KatexInlineElement.vue'
import TermSymbol from '@/modules/common/tooltip/TermSymbol.vue'
import type { TooltipDefinition } from '@/modules/common/tooltip/tooltipRegistry'

const {
  termKey,
  definition,
  backlinks = [],
} = defineProps<{
  termKey: string
  definition: TooltipDefinition
  backlinks?: { key: string; definition: TooltipDefinition }[]
}>()
</script>

<template>
  <article>
    <h2 class="flex flex-wrap items-center gap-2 text-lg font-bold leading-snug mb-4">
      <KatexInlineElement :text="termTitle(definition)" />
      <TermSymbol v-if="definition.symbol" :symbol="definition.symbol" class="text-sm" />
    </h2>
    <p class="text-base-content/80 leading-relaxed">
      <GlossaryInline :parts="definition.content" />
    </p>
    <GlossaryEntryDetails :term-key="termKey" :definition="definition" :backlinks="backlinks" />
  </article>
</template>
