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
import { BeakerIcon } from '@heroicons/vue/24/solid'
import { useI18n } from 'vue-i18n'

defineProps<{ ribbon?: boolean }>()

const { t } = useI18n({ useScope: 'global' })
</script>
<template>
  <!-- Diagonal corner band; self-clipping so the card keeps overflow visible (tooltips). Parent needs `relative`. -->
  <span
    v-if="ribbon"
    class="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[inherit]"
  >
    <span
      class="pointer-events-auto absolute top-2 -right-11 flex w-32 rotate-45 items-center justify-center bg-secondary py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-secondary-content shadow-sm"
      :title="t('home.picker.betaHint')"
    >
      {{ t('home.picker.beta') }}
    </span>
  </span>
  <span
    v-else
    class="badge badge-sm badge-soft badge-warning shrink-0 gap-1 px-2 text-[0.65rem] font-semibold uppercase tracking-wider"
    :title="t('home.picker.betaHint')"
  >
    <BeakerIcon class="size-3" />{{ t('home.picker.beta') }}
  </span>
</template>
