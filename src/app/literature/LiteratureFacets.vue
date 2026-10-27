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
import { useId } from 'vue'
import { useI18n } from 'vue-i18n'

import { FORMALISM_TAGS, type PublicationTag, TOPIC_TAGS } from '@/modules/common/publications/tags'

const {
  selected,
  counts,
  compact = false,
} = defineProps<{
  selected: PublicationTag[]
  counts: Record<PublicationTag, number>
  /** Bottom sheet: 44px rows, bleeding into the sheet's side padding. */
  compact?: boolean
}>()

const emit = defineEmits<{ toggle: [tag: PublicationTag] }>()

const { t } = useI18n({ useScope: 'global' })
const id = useId()

const facets = [
  { id: 'formalism', label: 'literature.formalism', tags: FORMALISM_TAGS },
  { id: 'topic', label: 'literature.topic', tags: TOPIC_TAGS },
] as const

const tagLabel = (tag: PublicationTag) =>
  (FORMALISM_TAGS as readonly string[]).includes(tag) ? tag : t(`literature.tags.${tag}`)

// A tag with no matches can't narrow anything, but stays clickable while selected.
const isDead = (tag: PublicationTag) => !counts[tag] && !selected.includes(tag)
</script>

<template>
  <div>
    <div
      v-for="facet in facets"
      :key="facet.id"
      role="group"
      :aria-labelledby="`${id}-${facet.id}`"
      class="pb-2"
    >
      <div
        :id="`${id}-${facet.id}`"
        class="section-label pt-2 pb-0.5"
        :class="compact ? '' : 'px-4'"
      >
        {{ t(facet.label) }}
      </div>
      <label
        v-for="tag in facet.tags"
        :key="tag"
        class="flex items-center gap-3 text-sm"
        :class="[
          compact ? 'h-11 -mx-4 px-4' : 'px-4 py-1.5',
          isDead(tag) ? 'text-base-content/40' : 'cursor-pointer hover:bg-base-200',
        ]"
      >
        <input
          type="checkbox"
          class="checkbox"
          :class="compact ? 'checkbox-sm' : 'checkbox-xs'"
          :checked="selected.includes(tag)"
          :disabled="isDead(tag)"
          @change="emit('toggle', tag)"
        />
        <span class="flex-1 truncate">{{ tagLabel(tag) }}</span>
        <span class="text-xs tabular-nums" :class="{ 'text-base-content/65': !isDead(tag) }">
          {{ counts[tag] }}
        </span>
      </label>
    </div>
  </div>
</template>
