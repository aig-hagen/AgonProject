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
import { offset, useFloating } from '@floating-ui/vue'
import { ArrowLongRightIcon } from '@heroicons/vue/24/outline'
import { onClickOutside } from '@vueuse/core'
import { toRef, useTemplateRef } from 'vue'

import ArrowDoubleLongRightIcon from '@/modules/common/graph-editor/ArrowDoubleLongRightIcon.vue'
import { type LinkConfigs, LinkType } from '@/modules/common/graph-editor/graphEditor'

const { reference, linkConfigs } = defineProps<{
  reference: SVGElement
  linkConfigs: LinkConfigs
}>()

const emit = defineEmits<{
  'update:arrowType': [value: LinkType]
  close: []
}>()

const floating = useTemplateRef('floating')
const { floatingStyles } = useFloating(
  toRef(() => reference),
  floating,
  {
    middleware: [
      // Centers vertically on reference
      offset(({ rects }) => {
        return -rects.reference.height / 2 - rects.floating.height / 2
      }),
    ],
  },
)

onClickOutside(floating, () => emit('close'), {
  ignore: [reference],
})
</script>

<template>
  <div tabindex="0" ref="floating" :style="floatingStyles">
    <ul class="dropdown menu rounded-box bg-base-100 shadow-sm/30">
      <li v-for="(config, linkType) in linkConfigs" :key="linkType">
        <a @click="emit('update:arrowType', linkType)"
          ><component :is="config!.icon" v-if="config!.icon" class="size-5 opacity-70" />
          <ArrowLongRightIcon v-else-if="linkType === LinkType.SINGLE" class="size-5 opacity-70" />
          <ArrowDoubleLongRightIcon v-else class="size-5 opacity-70" />{{ config!.displayName }}</a
        >
      </li>
    </ul>
  </div>
</template>
