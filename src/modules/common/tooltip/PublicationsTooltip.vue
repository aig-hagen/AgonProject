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
import { BookOpenIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'

import type { Publication } from '@/app/home/moduleConfig'

defineProps<{
  publications: Publication[]
}>()

const open = ref(false)
const buttonEl = ref<HTMLButtonElement | null>(null)
const tooltipStyle = ref<{ top: string; right: string }>({ top: '0px', right: '0px' })
let closeTimer: ReturnType<typeof setTimeout> | null = null

function onMouseEnter() {
  if (closeTimer !== null) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  if (buttonEl.value) {
    const rect = buttonEl.value.getBoundingClientRect()
    tooltipStyle.value = {
      top: `${rect.bottom + 4}px`,
      right: `${window.innerWidth - rect.right}px`,
    }
  }
  open.value = true
}

function onMouseLeave() {
  closeTimer = setTimeout(() => {
    open.value = false
  }, 100)
}
</script>
<template>
  <div class="shrink-0" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <button
      ref="buttonEl"
      class="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-base-content/70"
    >
      <BookOpenIcon class="w-4 h-4" />
    </button>
    <Teleport to="body">
      <div
        v-show="open"
        :style="tooltipStyle"
        class="fixed z-9999 w-80 rounded-box bg-base-100 shadow-lg p-3 flex flex-col gap-1"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
      >
        <p class="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">
          Publications
        </p>
        <a
          v-for="(pub, i) in publications"
          :key="i"
          :href="pub.href"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs text-base-content/70 hover:text-base-content hover:underline leading-snug"
        >
          {{ pub.label }}
        </a>
      </div>
    </Teleport>
  </div>
</template>
