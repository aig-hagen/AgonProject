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
import type { GridVisibility, PhysicsMode } from '@/modules/common/main-menu/types'
import SegmentedControl from '@/modules/common/settings/SegmentedControl.vue'
import type { GridType } from '@/modules/common/settings/useSettings'
import { useSettings } from '@/modules/common/settings/useSettings'
import type { ThemePreference } from '@/modules/common/theme/useTheme'
import { useTheme } from '@/modules/common/theme/useTheme'
import { useTutorial } from '@/modules/common/tutorial/useTutorial'

const { themePreference } = useTheme()
const {
  graphStyle,
  defaultPhysicsMode,
  defaultShowGrid,
  defaultGridType,
  gridCellScale,
  snapMode,
  showHints,
} = useSettings()
const { resetAllTutorials } = useTutorial()

const physicsOptions: { value: PhysicsMode; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'on', label: 'On' },
]
const booleanOptions: { value: boolean; label: string }[] = [
  { value: false, label: 'Off' },
  { value: true, label: 'On' },
]
const gridOptions: { value: GridVisibility; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'auto', label: 'On drag' },
  { value: 'on', label: 'On' },
]
const gridTypeOptions: { value: GridType; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rhombus', label: 'Rhombus' },
]
const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
  { value: 'dark', label: 'Dark' },
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Appearance -->
    <section class="flex flex-col gap-2">
      <h4 class="px-1 text-xs font-semibold uppercase tracking-wide text-base-content/50">
        Appearance
      </h4>
      <div class="divide-y divide-base-200 overflow-hidden rounded-2xl border border-base-300">
        <div class="flex items-center justify-between gap-4 bg-base-100 px-3.5 py-3">
          <span class="text-sm">Theme</span>
          <SegmentedControl
            v-model="themePreference"
            :options="themeOptions"
            aria-label="Theme"
          />
        </div>
        <div class="flex items-center justify-between gap-4 bg-base-100 px-3.5 py-3">
          <span class="text-sm">Graph style</span>
          <select class="select select-sm w-36" v-model="graphStyle">
            <option value="default">Default</option>
            <option value="high-contrast">High contrast</option>
            <option value="minimal">Minimal</option>
            <option value="library">Library</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Graph defaults -->
    <section class="flex flex-col gap-2">
      <h4 class="px-1 text-xs font-semibold uppercase tracking-wide text-base-content/50">
        Graph defaults
      </h4>
      <div class="divide-y divide-base-200 overflow-hidden rounded-2xl border border-base-300">
        <div class="flex items-center justify-between gap-4 bg-base-100 px-3.5 py-3">
          <span class="text-sm">Physics mode</span>
          <SegmentedControl
            v-model="defaultPhysicsMode"
            :options="physicsOptions"
            aria-label="Physics mode"
          />
        </div>
        <div class="flex items-center justify-between gap-4 bg-base-100 px-3.5 py-3">
          <span class="text-sm">Show grid</span>
          <SegmentedControl
            v-model="defaultShowGrid"
            :options="gridOptions"
            aria-label="Show grid"
          />
        </div>
        <div class="flex items-center justify-between gap-4 bg-base-100 px-3.5 py-3">
          <span class="text-sm">Grid type</span>
          <SegmentedControl
            v-model="defaultGridType"
            :options="gridTypeOptions"
            aria-label="Grid type"
          />
        </div>
        <div class="flex items-center justify-between gap-4 bg-base-100 px-3.5 py-3">
          <span class="text-sm">Grid cell size</span>
          <div class="flex items-center gap-2">
            <input
              type="range"
              class="range range-sm range-primary w-28"
              min="2"
              max="6"
              step="0.5"
              v-model.number="gridCellScale"
            />
            <span class="w-6 text-right text-sm text-base-content/60">{{ gridCellScale }}×</span>
          </div>
        </div>
        <div class="flex items-center justify-between gap-4 bg-base-100 px-3.5 py-3">
          <span class="text-sm">Snap to grid</span>
          <SegmentedControl
            v-model="snapMode"
            :options="booleanOptions"
            aria-label="Snap to grid"
          />
        </div>
      </div>
    </section>

    <!-- Tutorials -->
    <section class="flex flex-col gap-2">
      <h4 class="px-1 text-xs font-semibold uppercase tracking-wide text-base-content/50">
        Tutorials
      </h4>
      <div class="divide-y divide-base-200 overflow-hidden rounded-2xl border border-base-300">
        <div class="flex items-center justify-between gap-4 bg-base-100 px-3.5 py-3">
          <span class="text-sm">Show tutorials</span>
          <SegmentedControl
            v-model="showHints"
            :options="booleanOptions"
            aria-label="Show tutorials"
          />
        </div>
        <div class="flex items-center justify-between gap-4 bg-base-100 px-3.5 py-3">
          <span class="text-sm">Tutorial progress</span>
          <button class="btn btn-ghost btn-xs" @click="resetAllTutorials">Reset</button>
        </div>
      </div>
    </section>
  </div>
</template>
