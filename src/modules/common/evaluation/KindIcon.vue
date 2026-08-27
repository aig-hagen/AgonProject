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
import type { EvaluationKind } from '@/modules/common/evaluation/types'

// Kind marker used across the compact host (header pill, saved-config list, add
// picker). Icons trace the mobile mockups; stroke inherits currentColor.
defineProps<{ kind: EvaluationKind }>()
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.9"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="kind === 'extension'">
      <path
        d="M9 4c-2 0-2.2 1.4-2.2 3.2 0 1.6-.6 2.8-1.8 3.3v3c1.2.5 1.8 1.7 1.8 3.3 0 1.8.2 3.2 2.2 3.2"
      />
      <path
        d="M15 4c2 0 2.2 1.4 2.2 3.2 0 1.6.6 2.8 1.8 3.3v3c-1.2.5-1.8 1.7-1.8 3.3 0 1.8-.2 3.2-2.2 3.2"
      />
      <circle cx="10.6" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="13.4" cy="12" r="1" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="kind === 'ranking'">
      <path d="M11 5h10M11 12h10M11 19h10M3 7l2-2 2 2M5 5v14" />
    </template>
    <template v-else>
      <circle cx="5" cy="12" r="2.2" />
      <circle cx="19" cy="12" r="2.2" />
      <path d="M8 12h5.5" />
      <path d="M11.5 9.5 14 12l-2.5 2.5" />
    </template>
  </svg>
</template>
