<!--
  Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.

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
  along with this program, if not, see <https://www.gnu.org/licenses/>.
-->
<script lang="ts">
import type { InjectionKey } from 'vue'

// Module-scope symbols so all HoverTooltip instances share the same injection key.
const ANCESTOR_KEEP_OPEN_FNS: InjectionKey<Array<() => void>> = Symbol('hoverTooltipKeepOpen')
const ANCESTOR_SCHEDULE_CLOSE_FNS: InjectionKey<Array<() => void>> = Symbol('hoverTooltipScheduleClose')
const NESTING_DEPTH: InjectionKey<number> = Symbol('hoverTooltipDepth')
</script>

<script setup lang="ts">
import type { Placement } from '@floating-ui/vue'
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue'
import { inject, provide, ref, useTemplateRef } from 'vue'

const { placement = 'bottom' } = defineProps<{
  placement?: Placement
}>()

const triggerEl = useTemplateRef('trigger')
const panelEl = useTemplateRef('panel')

const depth = inject(NESTING_DEPTH, 0)
const ancestorKeepOpenFns = inject(ANCESTOR_KEEP_OPEN_FNS, [])
const ancestorScheduleCloseFns = inject(ANCESTOR_SCHEDULE_CLOSE_FNS, [])

const isOpen = ref(false)
let closeTimer: ReturnType<typeof setTimeout> | null = null

const { floatingStyles } = useFloating(triggerEl, panelEl, {
  placement,
  middleware: [offset(6), flip(), shift({ padding: 8 })],
  whileElementsMounted: autoUpdate,
})

function keepOpen() {
  if (closeTimer !== null) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  isOpen.value = true
}

function scheduleClose() {
  closeTimer = setTimeout(() => {
    isOpen.value = false
  }, 150)
  // When this tooltip closes, ancestors should close too if nothing else keeps them open.
  ancestorScheduleCloseFns.forEach((fn) => fn())
}

function onEnter() {
  keepOpen()
  // Keep all ancestor tooltips open while this one (or a descendant) is hovered.
  ancestorKeepOpenFns.forEach((fn) => fn())
}

// Expose this tooltip's functions to descendants, chained with any ancestor functions.
provide(ANCESTOR_KEEP_OPEN_FNS, [...ancestorKeepOpenFns, keepOpen])
provide(ANCESTOR_SCHEDULE_CLOSE_FNS, [...ancestorScheduleCloseFns, scheduleClose])
provide(NESTING_DEPTH, depth + 1)
</script>

<template>
  <span ref="trigger" class="cursor-help border-b border-dotted border-info" @mouseenter="onEnter" @mouseleave="scheduleClose">
    <slot />
  </span>
  <Teleport to="body">
    <div
      v-show="isOpen"
      ref="panel"
      :style="[floatingStyles, { zIndex: 9000 + depth }]"
      class="max-w-xs rounded-box bg-base-100 border border-base-300 shadow-lg p-3 text-sm"
      @mouseenter="onEnter"
      @mouseover="keepOpen"
      @mouseleave="scheduleClose"
    >
      <slot name="content" />
    </div>
  </Teleport>
</template>
