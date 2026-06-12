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
import type { SetAF,SetAfArgumentData } from '@/modules/collective-attacks-argumentation/model'
import type { ExportFileData } from '@/modules/common/export'
import type { HistoryState } from '@/modules/common/graph-editor/graphEditor'
import type { DocumentState } from '@/modules/common/state'

defineProps<{
  state: DocumentState<SetAF<SetAfArgumentData>>
  historyState: HistoryState
}>()

defineEmits<{
  load: []
  new: []
  generate: []
  change: [state: DocumentState<SetAF<SetAfArgumentData>>]
  undo: []
  redo: []
  save: []
  export: [filedata: ExportFileData]
}>()
</script>
<template>
  <div class="h-full w-full flex items-center justify-center text-base-content/50">
    <p>Editor for Argumentation Frameworks with Collective Attacks — coming soon</p>
  </div>
</template>
