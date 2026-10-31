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
import { useI18n } from 'vue-i18n'

import { listTitle } from '@/app/glossary/glossaryContext'
import GlossaryRowMobile from '@/app/glossary/GlossaryRowMobile.vue'
import { glossaryPath } from '@/app/glossary/useGlossary'
import type { TooltipDefinition } from '@/modules/common/tooltip/tooltipRegistry'

const { modulePrefix, pinned, groups } = defineProps<{
  modulePrefix: string
  /** The module's main entry, shown above the groups. */
  pinned?: [string, TooltipDefinition] | null
  groups: { label: string; terms: (readonly [string, TooltipDefinition])[] }[]
}>()

const { t } = useI18n({ useScope: 'global' })
</script>

<template>
  <div>
    <p v-if="groups.length === 0 && !pinned" class="px-4 py-4 text-sm text-base-content/65">
      {{ t('glossary.noResults') }}
    </p>
    <GlossaryRowMobile
      v-if="pinned"
      :to="glossaryPath(modulePrefix, pinned[0])"
      :title="listTitle(pinned[1])"
      pinned
    />
    <template v-for="group in groups" :key="group.label">
      <div class="section-label px-4 pt-4 pb-1">{{ group.label }}</div>
      <GlossaryRowMobile
        v-for="[key, def] in group.terms"
        :key="key"
        :to="glossaryPath(modulePrefix, key)"
        :title="listTitle(def)"
      />
    </template>
  </div>
</template>
