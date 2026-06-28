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
import { arrow, autoUpdate, offset, useFloating } from '@floating-ui/vue'
import { toRef, useTemplateRef } from 'vue'

const { reference, offsetY, placement } = defineProps<{
  reference: HTMLElement | null
  offsetY: number
  placement: 'bottom' | 'bottom-start' | 'bottom-end'
}>()

const color = 'var(--color-info)'
const arrowHeadHeight = 16
const arrowHeadWidht = 8
const arrowWidht = 4
const offsetArrowHeadY = -arrowHeadHeight / 2

const floating = useTemplateRef('floating')
const floatingArrow = useTemplateRef('floatingArrow')

const { floatingStyles, middlewareData } = useFloating(
  toRef(() => reference),
  floating,
  {
    placement: placement,
    middleware: [offset(offsetY), arrow({ element: floatingArrow })],
    whileElementsMounted: autoUpdate,
  },
)
</script>

<template>
  <div ref="floating" :style="floatingStyles">
    <div
      class="alert alert-info alert-soft w-max max-w-xs"
      :style="{
        borderBlockStartWidth: `${arrowWidht}px`,
        borderBlockStartColor: color,
        borderStartStartRadius: 0,
        borderStartEndRadius: 0,
      }"
    >
      <slot></slot>
    </div>
    <div
      ref="floatingArrow"
      :style="{
        position: 'absolute',
        left: middlewareData.arrow?.x != null ? `${middlewareData.arrow.x}px` : '',
        top: `${-offsetY - offsetArrowHeadY}px`,
      }"
    >
      <div
        :style="{
          borderLeft: `${arrowHeadWidht}px solid transparent`,
          borderRight: `${arrowHeadWidht}px solid transparent`,
          borderBottom: `${arrowHeadHeight}px solid ${color}`,
        }"
      ></div>
      <div
        :style="{
          borderLeft: `${arrowWidht / 2}px solid ${color}`,
          borderRight: `${arrowWidht / 2}px solid ${color}`,
          height: `${offsetY - arrowHeadHeight + offsetArrowHeadY}px`,
          width: 0,
          margin: 'auto',
        }"
      ></div>
    </div>
  </div>
</template>
