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

const {
  linkNames,
  allowHyperLinkCreation = false,
  nodeTapAction = 'Rename',
} = defineProps<{
  linkNames: string[]
  allowHyperLinkCreation?: boolean
  /** Primary node-tap action for this module (see the primary-action table). */
  nodeTapAction?: string
}>()

const linkNamesSlash = computed(() => linkNames.join('/'))
const hasTypes = computed(() => linkNames.length > 1)

const gestureClass =
  'inline-flex items-center rounded-md bg-base-200 px-2 py-0.5 text-xs font-medium justify-self-start'
</script>

<template>
  <dl class="flex flex-col">
    <p class="font-semibold pt-2 pb-1 opacity-60 text-xs uppercase tracking-wide">
      Arguments &amp; Attacks
    </p>
    <div class="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2 items-baseline">
      <dt :class="gestureClass">Double-tap</dt>
      <dd>Add an argument on the canvas</dd>

      <dt :class="gestureClass">Tap</dt>
      <dd>{{ nodeTapAction }} an argument</dd>

      <dt :class="gestureClass">Hold</dt>
      <dd>Delete an argument</dd>

      <dt :class="gestureClass">Hold + drag</dt>
      <dd>
        <template v-if="allowHyperLinkCreation">
          Tap arguments to select sources, then hold a selected source and drag to the target to
          create a collective attack
        </template>
        <template v-else>
          Drag from one argument to another to create a {{ linkNamesSlash }}
        </template>
      </dd>

      <template v-if="hasTypes">
        <dt :class="gestureClass">Selector</dt>
        <dd>The bottom-left selector sets which {{ linkNamesSlash }} you create next</dd>

        <dt :class="gestureClass">Tap {{ linkNamesSlash }}</dt>
        <dd>Change its type or delete it</dd>
      </template>
      <template v-else>
        <dt :class="gestureClass">Tap {{ linkNamesSlash }}</dt>
        <dd>Delete it</dd>
      </template>
    </div>

    <p class="font-semibold pt-3 pb-1 opacity-60 text-xs uppercase tracking-wide">Navigation</p>
    <div class="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2 items-baseline">
      <dt :class="gestureClass">Drag</dt>
      <dd>Pan the canvas</dd>

      <dt :class="gestureClass">Pinch</dt>
      <dd>Zoom in and out</dd>

      <dt :class="gestureClass">Fit</dt>
      <dd>Recenter the view (bottom bar) — moving arguments by hand is not needed; use Relayout</dd>
    </div>

    <p class="font-semibold pt-3 pb-1 opacity-60 text-xs uppercase tracking-wide">General</p>
    <div class="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2 items-baseline">
      <dt :class="gestureClass">Undo</dt>
      <dd>Top bar; Redo and Share are in the menu</dd>

      <dt :class="gestureClass">Menu</dt>
      <dd>Settings, tutorials, glossary and file actions</dd>
    </div>
  </dl>
</template>
