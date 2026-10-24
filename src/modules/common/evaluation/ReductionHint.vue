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
import { QuestionMarkCircleIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { Semantics } from '@/modules/common/evaluation/tweety-project/semantics'

// Marks semantics the backend computes via an AF reduction; `withText` spells out why.
const { reduction, withText = false } = defineProps<{
  reduction: NonNullable<Semantics['reduction']>
  withText?: boolean
}>()

const { t } = useI18n({ useScope: 'global' })
const message = computed(() => t(`evaluation.reduction.${reduction}`))
</script>

<template>
  <span
    class="inline-flex items-start gap-1.5 text-base-content/65"
    :class="{ 'text-xs': withText }"
    :title="withText ? undefined : message"
  >
    <QuestionMarkCircleIcon class="size-3.5 shrink-0" />
    <span v-if="withText">{{ message }}</span>
  </span>
</template>
