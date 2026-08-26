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
import { computed, provide, ref, shallowRef, toRef, watch } from 'vue'

import type { ExtensionWindowInstanceState } from '@/modules/abstract-argumentation/evaluation/extensionWindowState'
import {
  defaultArgsForSemantics,
  KNOWN_META_REASONERS,
  KNOWN_SEMANTIC_GROUPS,
  type MetaReasonerParameter,
  useExtensionEvaluationQuery,
} from '@/modules/abstract-argumentation/evaluation/tweetyProject'
import { abstractArgumentationGlossary } from '@/modules/abstract-argumentation/glossary'
import { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import type { DocumentId } from '@/modules/common/documents/db'
import BaseEvaluationWindow from '@/modules/common/evaluation/BaseEvaluationWindow.vue'
import EvaluationResultGrid from '@/modules/common/evaluation/EvaluationResultGrid.vue'
import type { Input } from '@/modules/common/evaluation/types'
import { useExtensionWindowBase } from '@/modules/common/evaluation/useExtensionWindowBase'
import GroupedSelect, { type GroupedSelectGroup } from '@/modules/common/forms/GroupedSelect.vue'
import ParameterField from '@/modules/common/forms/ParameterField.vue'
import type { Highlight } from '@/modules/common/graph-editor/graphEditor'
import TermDefinitionBlock from '@/modules/common/tooltip/TermDefinitionBlock.vue'
import { TOOLTIP_REGISTRY_KEY } from '@/modules/common/tooltip/tooltipRegistry'

interface ExtensionSemanticsOption {
  key: string
  displayName: string
  parameters?: MetaReasonerParameter[]
}

const {
  input,
  instanceState,
  instanceOffset = 0,
  documentId,
  stateKey,
  suppressed = false,
  hosted = false,
} = defineProps<{
  input: Input<AbstractArgumentation<ArgumentData>>
  instanceState: ExtensionWindowInstanceState
  instanceOffset?: number
  documentId?: DocumentId
  stateKey?: string
  suppressed?: boolean
  hosted?: boolean
}>()

const emit = defineEmits<{
  'update:instanceState': [state: ExtensionWindowInstanceState]
  highlight: [highlight?: Highlight]
  close: []
  evaluate: []
  focus: []
}>()

provide(TOOLTIP_REGISTRY_KEY, abstractArgumentationGlossary)

const semanticGroups = KNOWN_SEMANTIC_GROUPS
const allSemantics: ExtensionSemanticsOption[] = [
  ...semanticGroups.flatMap((g) => g.semantics),
  ...KNOWN_META_REASONERS,
]

const semanticsSelectGroups: GroupedSelectGroup<ExtensionSemanticsOption>[] = [
  ...semanticGroups.map((g) => ({ key: g.key, displayName: g.displayName, options: g.semantics })),
  { key: 'meta', displayName: 'Meta Semantics', options: KNOWN_META_REASONERS },
]

function resolveSemanticFromKey(key: string): ExtensionSemanticsOption {
  return allSemantics.find((s) => s.key === key) ?? allSemantics[0]!
}

// Meta-reasoner parameters are either a pick from the known semantics (`compatibleSemantics`,
// e.g. Vacuous Reduct's base/reduct semantics) or a fixed, non-semantics set of choices
// (`options`, e.g. Serialisable's selection/termination function) - this normalizes both into
// the same { key, displayName } shape for rendering and notation formatting.
function paramOptions(param: MetaReasonerParameter): { key: string; displayName: string }[] {
  return (
    param.options ?? (param.compatibleSemantics ?? []).map((key) => resolveSemanticFromKey(key))
  )
}

const selectedSemantic = shallowRef<ExtensionSemanticsOption>(
  resolveSemanticFromKey(instanceState.semanticKey),
)
const args = ref<Record<string, string>>(
  instanceState.args ?? defaultArgsForSemantics(instanceState.semanticKey),
)
const selectedMode = ref<string>(instanceState.mode)

watch(selectedSemantic, (semantic, previous) => {
  if (previous !== undefined && semantic.key !== previous.key) {
    args.value = defaultArgsForSemantics(semantic.key)
  }
})

watch(
  [selectedSemantic, args, selectedMode],
  () => {
    emit('update:instanceState', {
      id: instanceState.id,
      semanticKey: selectedSemantic.value.key,
      args: args.value,
      mode: selectedMode.value,
    })
  },
  { deep: true },
)

const query = useExtensionEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantic.value.key),
  args,
  selectedMode,
  true,
)

// Explicit per-column track sizes (matching each field's own ParameterField min/max
// below) instead of uniform repeat() tracks, so Semantics' column isn't coupled to
// Mode's — Mode has a smaller max-width and would otherwise leave its track's spare
// space stranded rather than letting Semantics use it.
//
// The container-query breakpoints below must stay >= the actual sum of that row's
// column minimums + gaps, or the grid switches column count before there's room and
// briefly overflows (horizontal scrollbar) while shrinking:
//   2 columns need >= 10rem (Semantics min) + 7rem (Mode min) + 0.75rem (gap-3) = 17.75rem -> @min-[18rem]
//   4 columns need >= 17.75rem + 7rem (Base min) + 7rem (Reduct min) + 1.5rem (2 more gaps) = 33.25rem -> @min-[33.5rem]
// Full class strings (including variant prefixes) are kept literal and unbroken so
// Tailwind's content scanner can find them — building them via interpolation would
// hide the "@min-[...]:grid-cols-[...]" candidates from it.
const GRID_COLS_UP_TO_2 =
  'grid-cols-1 @min-[18rem]:grid-cols-[minmax(10rem,14rem)_minmax(7rem,8rem)]'
const GRID_COLS_UP_TO_4 =
  'grid-cols-1 @min-[18rem]:grid-cols-[minmax(10rem,14rem)_minmax(7rem,8rem)] @min-[33.5rem]:grid-cols-[minmax(10rem,14rem)_minmax(7rem,8rem)_minmax(7rem,14rem)_minmax(7rem,14rem)]'

// The window title needs the current meta-reasoner's parameters resolved to their
// Semantics objects before it can format a notation (formatTitleNotation is the
// plain-text variant of formatNotation, which may contain KaTeX).
const titleSemanticName = computed(() => {
  const metaReasoner = KNOWN_META_REASONERS.find((m) => m.key === selectedSemantic.value.key)
  if (metaReasoner === undefined) return selectedSemantic.value.displayName
  const resolvedParams = metaReasoner.parameters.map((p) => {
    const options = paramOptions(p)
    return options.find((o) => o.key === args.value[p.key]) ?? options[0]!
  })
  return (metaReasoner.formatTitleNotation ?? metaReasoner.formatNotation)(resolvedParams)
})

const {
  selectedExtension,
  selectionHint,
  emptyMessage,
  dataExtensionsFormatedAndSorted,
  resultItems,
  currentHighlight,
} = useExtensionWindowBase(selectedMode, query)

// Meta-reasoners with 2 parameters (e.g. Vacuous Reduct, Serialisable) have 4 fields total
// incl. Semantics/Mode and can grow to a 4-column row; every other case (0 or 1 parameter)
// stays at 2 columns so a 3rd field always wraps to its own row instead of the layout ever
// showing exactly 3 columns.
const hasFourParamFields = computed(() => (selectedSemantic.value.parameters?.length ?? 0) >= 2)

const emittedHighlight = computed(() => (suppressed ? undefined : currentHighlight.value))
const isActive = computed(() => !suppressed && currentHighlight.value !== undefined)

watch(emittedHighlight, (h) => emit('highlight', h))
function onWindowFocus() {
  emit('focus')
}

const windowTitle = computed(() => {
  const modeLabel =
    selectedMode.value === 'enumerate'
      ? 'Enumerate'
      : selectedMode.value === 'credulous'
        ? 'Credulous'
        : 'Skeptical'
  return `${titleSemanticName.value} · ${modeLabel}`
})
</script>

<template>
  <BaseEvaluationWindow
    :title="windowTitle"
    :hosted="hosted"
    :instance-offset="instanceOffset"
    :initial-size="{ width: 400, height: 360 }"
    :active="isActive"
    :query="query"
    :document-id="documentId"
    :state-key="stateKey"
    @close="emit('close')"
    @focus="onWindowFocus"
    @evaluate="emit('evaluate')"
  >
    <template #parameters>
      <div class="@container basis-full">
        <div class="grid gap-3" :class="hasFourParamFields ? GRID_COLS_UP_TO_4 : GRID_COLS_UP_TO_2">
          <ParameterField label="Semantics" min-width="10rem">
            <GroupedSelect v-model="selectedSemantic" :groups="semanticsSelectGroups" full-width />
          </ParameterField>
          <ParameterField label="Mode" max-width="8rem">
            <select v-model="selectedMode" class="select select-sm w-full bg-base-200">
              <option value="enumerate">Enumerate</option>
              <option value="credulous">Credulous</option>
              <option value="skeptical">Skeptical</option>
            </select>
          </ParameterField>
          <ParameterField
            v-for="param in selectedSemantic.parameters ?? []"
            :key="param.key"
            :label="param.label"
            :title="param.description"
          >
            <select v-model="args[param.key]" class="select select-sm w-full bg-base-200">
              <option v-for="opt in paramOptions(param)" :key="opt.key" :value="opt.key">
                {{ opt.displayName }}
              </option>
            </select>
          </ParameterField>
        </div>
      </div>
    </template>
    <template #parameters-footer>
      <TermDefinitionBlock :id="selectedSemantic.key" />
    </template>
    <template #results>
      <template v-if="dataExtensionsFormatedAndSorted !== undefined">
        <EvaluationResultGrid
          v-model:selected="selectedExtension"
          :items="resultItems"
          :empty-message="emptyMessage"
          :selection-hint="selectionHint"
          :evaluation-duration-in-ms="dataExtensionsFormatedAndSorted.evaluationDurationInMs"
        />
      </template>
    </template>
  </BaseEvaluationWindow>
</template>
