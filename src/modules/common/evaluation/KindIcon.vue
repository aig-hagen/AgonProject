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
import type { EvaluationKind } from '@/modules/common/evaluation/types'
import SerialisationIcon from '@/modules/common/graph-editor/SerialisationIcon.vue'
import SigmaIcon from '@/modules/common/graph-editor/SigmaIcon.vue'
import SucceqIcon from '@/modules/common/graph-editor/SucceqIcon.vue'

// Kind marker used across the compact host (header pill, saved-config list, add
// picker). Extension → sigma, ranking → succeeds-or-equal (the literature symbols),
// serialisation → a tree of sequences. Colour inherits currentColor.
defineProps<{ kind: EvaluationKind }>()
</script>

<template>
  <SigmaIcon v-if="kind === 'extension'" />
  <SucceqIcon v-else-if="kind === 'ranking'" />
  <SerialisationIcon v-else />
</template>
