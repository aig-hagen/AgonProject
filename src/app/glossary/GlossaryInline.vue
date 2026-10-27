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
import { useGlossaryContext } from '@/app/glossary/glossaryContext'
import SourceLink from '@/app/glossary/SourceLink.vue'
import type { GlossaryInline } from '@/modules/common/glossary/types'
import { useLayoutMode } from '@/modules/common/layout/useLayoutMode'
import { publicationByKey } from '@/modules/common/publications/lookup'
import KatexInlineElement from '@/modules/common/tooltip/KatexInlineElement.vue'
import TermTooltip from '@/modules/common/tooltip/TermTooltip.vue'

const { parts } = defineProps<{ parts: GlossaryInline[] }>()

const { entries, pathOf } = useGlossaryContext()

// On touch layouts a tap would both open the tooltip and navigate, so links stay plain.
const { isCompact } = useLayoutMode()
</script>

<template>
  <template v-for="(part, i) in parts" :key="i">
    <KatexInlineElement v-if="typeof part === 'string'" :text="part" />
    <template v-else-if="'cite' in part">
      <SourceLink
        v-if="publicationByKey(part.cite)"
        :publication="publicationByKey(part.cite)!"
        class="text-primary underline-offset-2 hover:underline"
      />
      <span v-else class="text-base-content/65">{{ part.cite }}</span>
    </template>
    <component
      :is="isCompact ? 'span' : TermTooltip"
      v-else-if="entries[part.ref]"
      v-bind="isCompact ? {} : { id: part.ref, triggerClass: '' }"
    >
      <RouterLink :to="pathOf(part.ref)" class="text-primary">
        <KatexInlineElement :text="part.label ?? entries[part.ref]!.definition.label" />
      </RouterLink>
    </component>
    <span v-else class="text-base-content/65">
      <KatexInlineElement :text="part.label ?? part.ref" />
    </span>
  </template>
</template>
