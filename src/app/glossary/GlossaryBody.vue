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
import GlossaryInline from '@/app/glossary/GlossaryInline.vue'
import type { GlossaryBlock } from '@/modules/common/glossary/types'

const { blocks } = defineProps<{ blocks: GlossaryBlock[] }>()
</script>

<template>
  <div class="flex flex-col gap-3 leading-relaxed text-base-content/80">
    <template v-for="(block, i) in blocks" :key="i">
      <h3 v-if="block.kind === 'heading' && block.level === 2" class="section-label mt-3">
        <GlossaryInline :parts="block.content" />
      </h3>
      <h4 v-else-if="block.kind === 'heading'" class="font-semibold text-base-content mt-1">
        <GlossaryInline :parts="block.content" />
      </h4>
      <ul v-else-if="block.kind === 'list'" class="list-disc pl-5 flex flex-col gap-1">
        <li v-for="(item, j) in block.items" :key="j">
          <GlossaryInline :parts="item" />
        </li>
      </ul>
      <p v-else>
        <GlossaryInline :parts="block.content" />
      </p>
    </template>
  </div>
</template>
