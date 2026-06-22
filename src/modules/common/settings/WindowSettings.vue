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
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->
<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useTemplateRef } from 'vue'

import { useSettings } from '@/modules/common/settings/useSettings'
import { useTheme } from '@/modules/common/theme/useTheme'

const dialog = useTemplateRef('dialog')
const { isDark } = useTheme()
const { graphStyle, defaultPhysicsMode, defaultShowGrid, defaultGridType, showHints } = useSettings()

function open() {
  dialog.value?.showModal()
}

defineExpose({ open })
</script>

<template>
  <dialog class="modal" ref="dialog">
    <div class="modal-box max-w-sm">
      <form method="dialog">
        <button class="btn btn-sm btn-square btn-ghost absolute right-2 top-2">
          <XMarkIcon class="size-4" />
        </button>
      </form>
      <h3 class="text-lg font-bold mb-5">Settings</h3>

      <div class="flex flex-col gap-6">
        <!-- Appearance -->
        <section>
          <h4 class="text-xs font-semibold uppercase tracking-wider opacity-50 mb-3">Appearance</h4>
          <div class="flex flex-col gap-3">
            <label class="flex items-center justify-between gap-4">
              <span class="text-sm">Dark mode</span>
              <input type="checkbox" class="toggle toggle-sm" v-model="isDark" />
            </label>
            <div class="flex items-center justify-between gap-4">
              <span class="text-sm">Graph style</span>
              <select class="select select-sm select-bordered w-36" v-model="graphStyle">
                <option value="default">Default</option>
                <option value="high-contrast">High contrast</option>
                <option value="minimal">Minimal</option>
                <option value="library">Library</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Graph defaults -->
        <section>
          <h4 class="text-xs font-semibold uppercase tracking-wider opacity-50 mb-3">Graph defaults</h4>
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between gap-4">
              <span class="text-sm">Physics mode</span>
              <div class="join">
                <input class="join-item btn btn-sm" type="radio" name="physics-mode" aria-label="Off" value="off" v-model="defaultPhysicsMode" />
                <input class="join-item btn btn-sm" type="radio" name="physics-mode" aria-label="Settle" value="settle" v-model="defaultPhysicsMode" />
                <input class="join-item btn btn-sm" type="radio" name="physics-mode" aria-label="On" value="on" v-model="defaultPhysicsMode" />
              </div>
            </div>
            <label class="flex items-center justify-between gap-4">
              <span class="text-sm">Show grid</span>
              <input type="checkbox" class="toggle toggle-sm" v-model="defaultShowGrid" />
            </label>
            <div class="flex items-center justify-between gap-4">
              <span class="text-sm">Grid type</span>
              <div class="join">
                <input class="join-item btn btn-sm" type="radio" name="grid-type" aria-label="Square" value="square" v-model="defaultGridType" />
                <input class="join-item btn btn-sm" type="radio" name="grid-type" aria-label="Rhombus" value="rhombus" v-model="defaultGridType" />
              </div>
            </div>
          </div>
        </section>

        <!-- Hints -->
        <section>
          <h4 class="text-xs font-semibold uppercase tracking-wider opacity-50 mb-3">Hints</h4>
          <div class="flex flex-col gap-3">
            <label class="flex items-center justify-between gap-4">
              <span class="text-sm">Show onboarding hints</span>
              <input type="checkbox" class="toggle toggle-sm" v-model="showHints" />
            </label>
          </div>
        </section>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>Close</button>
    </form>
  </dialog>
</template>
