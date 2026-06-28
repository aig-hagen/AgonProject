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
import { computed } from 'vue'

import { REDO_SHORTCUT, TOGGLE_GRID_SHORTCUT, TOGGLE_PHYSICS_SHORTCUT, UNDO_SHORTCUT } from '@/modules/common/shortcuts'

const props = defineProps<{
  linkNames: string[]
  allowHyperLinkCreation?: boolean
}>()

const linkNamesSlashSeperated = computed(() => props.linkNames.join('/'))
const linkNamesEnumeration = computed(
  () => props.linkNames.slice(0, -1).join(', ') + ' and ' + props.linkNames[props.linkNames.length - 1],
)
</script>
<template>
  <table class="table">
    <thead>
      <tr>
        <th>Action</th>
        <th>Control</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td colspan="2" class="font-semibold pt-3 pb-1 opacity-60 text-xs uppercase tracking-wide">Arguments &amp; Attacks</td>
      </tr>
      <tr>
        <td>Create argument</td>
        <td><kbd class="kbd">Left double-click</kbd> on canvas</td>
      </tr>

      <tr>
        <td>Move argument</td>
        <td><kbd class="kbd">Left-click</kbd> on argument, hold and drag</td>
      </tr>
      <tr>
        <td>Delete argument</td>
        <td><kbd class="kbd">Right-click</kbd> on argument and hold</td>
      </tr>
      <tr>
        <td>Create {{ linkNamesSlashSeperated }}</td>
        <td><kbd class="kbd">Right-click</kbd> on argument, hold and drag towards argument</td>
      </tr>
      <tr v-if="props.allowHyperLinkCreation">
        <td>Create collective attack</td>
        <td>
          <kbd class="kbd">Shift</kbd>+<kbd class="kbd">Left-click</kbd> on 2 or more arguments to select sources, then
          <kbd class="kbd">Right-click</kbd> on a selected source, hold and drag towards the target argument
        </td>
      </tr>
      <tr v-if="props.linkNames.length > 1">
        <td>Switch between {{ linkNamesEnumeration }}</td>
        <td>
          <kbd class="kbd">Left-click</kbd> on {{ linkNamesSlashSeperated }} and select new type
        </td>
      </tr>
      <tr>
        <td>Delete {{ linkNamesSlashSeperated }}</td>
        <td><kbd class="kbd">Right-click</kbd> on {{ linkNamesSlashSeperated }} and hold</td>
      </tr>

      <tr>
        <td colspan="2" class="font-semibold pt-3 pb-1 opacity-60 text-xs uppercase tracking-wide">Navigation</td>
      </tr>
      <tr>
        <td>Pan</td>
        <td><kbd class="kbd">Left-click</kbd> on canvas, hold and drag</td>
      </tr>
      <tr>
        <td>Zoom in/out</td>
        <td><kbd class="kbd">Scroll wheel</kbd> on canvas</td>
      </tr>
      <tr>
        <td>Center view</td>
        <td><kbd class="kbd">Middle-click</kbd> on canvas</td>
      </tr>

      <tr>
        <td colspan="2" class="font-semibold pt-3 pb-1 opacity-60 text-xs uppercase tracking-wide">General</td>
      </tr>
      <tr>
        <td>Undo</td>
        <td>
          <div class="flex gap-1">
            <kbd class="kbd" v-if="UNDO_SHORTCUT.modifiers.ctrl">Ctrl</kbd>
            <kbd class="kbd" v-if="UNDO_SHORTCUT.modifiers.meta">⌘</kbd>
            <kbd class="kbd" v-if="UNDO_SHORTCUT.modifiers.shift">Shift</kbd>
            <kbd class="kbd">{{ UNDO_SHORTCUT.key.toUpperCase() }}</kbd>
          </div>
        </td>
      </tr>
      <tr>
        <td>Redo</td>
        <td>
          <div class="flex gap-1">
            <kbd class="kbd" v-if="REDO_SHORTCUT.modifiers.ctrl">Ctrl</kbd>
            <kbd class="kbd" v-if="REDO_SHORTCUT.modifiers.meta">⌘</kbd>
            <kbd class="kbd" v-if="REDO_SHORTCUT.modifiers.shift">Shift</kbd>
            <kbd class="kbd">{{ REDO_SHORTCUT.key.toUpperCase() }}</kbd>
          </div>
        </td>
      </tr>
      <tr>
        <td>Toggle grid</td>
        <td><kbd class="kbd">{{ TOGGLE_GRID_SHORTCUT.key.toUpperCase() }}</kbd></td>
      </tr>
      <tr>
        <td>Toggle physics</td>
        <td><kbd class="kbd">{{ TOGGLE_PHYSICS_SHORTCUT.key.toUpperCase() }}</kbd></td>
      </tr>
    </tbody>
  </table>
</template>
