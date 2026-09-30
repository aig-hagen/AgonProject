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
import type { NodeKind } from '@/modules/assumption-based-argumentation/model'

defineProps<{ kind: NodeKind }>()
</script>

<template>
  <span class="glyph" :class="kind === 'assumption' ? 'glyph-assm' : 'glyph-atom'" />
</template>

<style scoped>
/* Mini node shapes in the graph's own node colors, so the list reads like the canvas. */
.glyph {
  display: inline-block;
  flex: none;
  width: 11px;
  height: 11px;
  border: 1.5px solid var(--graph-node-stroke-color, var(--color-primary));
  background: var(--graph-node-color, var(--color-base-200));
}
.glyph-assm {
  border-radius: 50%;
}
.glyph-atom {
  border-radius: 2px;
  transform: rotate(45deg) scale(0.85);
}
</style>
