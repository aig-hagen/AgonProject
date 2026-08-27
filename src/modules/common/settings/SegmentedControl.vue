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
<script setup lang="ts" generic="T extends string">
const model = defineModel<T>({ required: true })

defineProps<{
  options: { value: T; label: string }[]
  ariaLabel?: string
}>()
</script>

<template>
  <div
    class="inline-flex items-center rounded-lg bg-base-300/60 p-0.5"
    role="radiogroup"
    :aria-label="ariaLabel"
  >
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      role="radio"
      :aria-checked="model === opt.value"
      class="rounded-md px-3 py-1 text-sm transition-colors"
      :class="
        model === opt.value
          ? 'bg-base-100 font-medium text-base-content shadow-sm'
          : 'text-base-content/55'
      "
      @click="model = opt.value"
    >
      {{ opt.label }}
    </button>
  </div>
</template>
