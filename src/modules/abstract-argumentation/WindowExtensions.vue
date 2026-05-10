<script setup lang="ts">
import { computed, ref, toRef, useTemplateRef, watchEffect, nextTick, shallowRef } from 'vue'
import { AbstractArgumentation } from './model'
import type { ArgumentData } from '../common/argumentation/model'
import FloatingWindow from '../../modules/common/window/FloatingWindow.vue'
import type { Input } from '../common/evaluation/types'
import type { Highlight } from '../common/graph-editor/graphEditor'
import {
  KEY_DEFAULT_SEMANTIC,
  KNOWN_SEMANTIC_GROUPS,
  useExtensionEvaluationQuery,
  type Extension,
  type Semantic,
} from './evaluation/tweetyProject'
import { NODE_GREEN, NODE_RED } from '../common/colors'
import KatexInlineElement from '../common/KatexInlineElement.vue'

const open = defineModel<boolean>('open', { required: true })
const { input } = defineProps<{
  input: Input<AbstractArgumentation<ArgumentData>>
}>()

const emit = defineEmits<{
  highlight: [highlight?: Highlight]
}>()

const semanticGroups = KNOWN_SEMANTIC_GROUPS
const stableSemantic = semanticGroups
  .flatMap((group) => group.semantics)
  .find((semantics) => semantics.key === KEY_DEFAULT_SEMANTIC)
if (stableSemantic === undefined) {
  throw new Error('Default semantic does not exist.')
}
const selectedSemantic = shallowRef<Semantic>(stableSemantic)
const evaluateContiously = ref(false)
const enabled = computed(() => evaluateContiously.value && open.value)
const { data, status, refetch, isLoading, isPending, isError } = useExtensionEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantic.value.key),
  enabled,
)
const userCanTriggerFetch = computed(
  () => open.value && !evaluateContiously.value && status.value !== 'success',
)
const extensionsElementRef = useTemplateRef('extensions')
const extensionsElementItemRefs = useTemplateRef('extension-itme')

const EXTENSIONS_FALLBACK_WIDTH = 192
const EXTENSIONS_MIN_WIDTH_VAR = '--extension-item-min-width'

watchEffect(async () => {
  const extensionsElement = extensionsElementRef.value
  if (extensionsElement === null) {
    return
  }
  const extensionsElementItems = extensionsElementItemRefs.value
  if (extensionsElementItems === null) {
    return
  }
  const extensions = data.value?.extensions ?? []
  if (extensions.length === 0) {
    extensionsElement.style.setProperty(EXTENSIONS_MIN_WIDTH_VAR, `${EXTENSIONS_FALLBACK_WIDTH}px`)
    return
  }
  extensionsElement.style.removeProperty(EXTENSIONS_MIN_WIDTH_VAR)
  await nextTick() // wait to finish rendering
  const maxWidht = recalcMaxWidthExtension(extensionsElementItems)
  extensionsElement.style.setProperty(EXTENSIONS_MIN_WIDTH_VAR, `${maxWidht}px`)
})

function recalcMaxWidthExtension(extensionsElementItems: HTMLElement[]) {
  return Math.max(...extensionsElementItems.map((element) => element.getBoundingClientRect().width))
}

function formatExtension(extension: Extension) {
  const namesSorted = extension.map((extension) => extension.name).sort()
  return `${namesSorted.join(', ')}`
}

const dataExtensionsFormatedAndSorted = computed(() => {
  if (data.value === undefined) {
    return undefined
  }

  const formated = data.value.extensions.map((extension) => {
    const nameFormated = formatExtension(extension)
    const extensionIdsSorted = extension.map((argument) => argument.id).sort()
    return {
      key: JSON.stringify(extensionIdsSorted),
      extension: extension,
      nameFormated: nameFormated,
    }
  })

  formated.sort((a, b) => a.nameFormated.localeCompare(b.nameFormated))

  return {
    stateId: data.value.stateId,
    formatedAndSorted: formated,
    evaluationDurationInSeconds: data.value.evaluationDurationInSeconds,
  }
})

const selectedExtension = ref<string | undefined>(undefined)
watchEffect(() => {
  if (selectedExtension.value === undefined) {
    return
  }
  if (dataExtensionsFormatedAndSorted.value === undefined) {
    emit('highlight', undefined)
    return
  }
  for (const extension of dataExtensionsFormatedAndSorted.value.formatedAndSorted) {
    if (extension.key === selectedExtension.value) {
      const stateId = dataExtensionsFormatedAndSorted.value.stateId
      const nodeIds = new Set(extension.extension.map((argument) => argument.id))
      emit('highlight', {
        stateId: stateId,
        nodes: nodeIds,
        color: NODE_GREEN,
        restColor: NODE_RED,
      })
      return
    }
  }
  emit('highlight', undefined)
})
</script>

<template>
  <FloatingWindow v-model:open="open" title="Extensions" :initial-position="{ x: 128, y: 128 }">
    <div class="p-4">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Parameters</legend>
        <div class="flex gap-2 flex-wrap">
          <label class="select select-sm w-52">
            <span class="label">Solver</span>
            <select disabled>
              <option selected>TweetyProject</option>
            </select>
          </label>
          <label class="select select-sm w-52">
            <span class="label">Semantics</span>
            <select v-model="selectedSemantic">
              <optgroup v-for="group in semanticGroups" :key="group.key" :label="group.displayName">
                <option v-for="semantic in group.semantics" :key="semantic.key" :value="semantic">
                  {{ semantic.displayName }}
                </option>
              </optgroup>
            </select>
          </label>
        </div>
      </fieldset>
      <fieldset class="fieldset" v-if="selectedSemantic.info !== undefined">
        <details class="collapse collapse-arrow">
          <summary class="collapse-title fieldset-legend ps-0 max-w-max">Definition</summary>
          <div class="collapse-content text-sm p-0">
            <p class="mb-1">
              <KatexInlineElement :text="selectedSemantic.info.description" /><sup
                :title="selectedSemantic.info.reference.name"
                ><a
                  class="link link-primary"
                  :href="selectedSemantic.info.reference.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  >[1] ↗</a
                ></sup
              >
            </p>
          </div>
        </details>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Evaluation</legend>
        <div class="flex gap-2 flex-wrap">
          <button
            class="btn btn-sm btn-soft btn-neutral mt-2"
            :disabled="!userCanTriggerFetch"
            @click="() => refetch()"
          >
            Evaluate
          </button>
          <label class="label mt-2">
            <input type="checkbox" v-model="evaluateContiously" class="checkbox checkbox-sm" />
            Evaluate continuously
          </label>
        </div>
      </fieldset>
      <fieldset class="fieldset" v-if="!isPending || isLoading">
        <legend class="fieldset-legend">Results</legend>
        <div v-if="isError" role="alert" class="alert alert-error alert-soft">
          <span>Failed evaluating extensions</span>
        </div>
        <div v-if="isLoading" role="alert" class="alert alert-info alert-soft">
          <span>Evaluating extensions</span>
        </div>
        <template v-if="dataExtensionsFormatedAndSorted !== undefined">
          <div
            v-if="dataExtensionsFormatedAndSorted.formatedAndSorted.length === 0"
            role="alert"
            class="alert alert-info alert-soft"
          >
            <span>No extensions exist.</span>
          </div>
          <div v-else class="extensions gap-2" ref="extensions">
            <div
              v-for="extension of dataExtensionsFormatedAndSorted.formatedAndSorted"
              :key="extension.key"
            >
              <label class="label grow-2" ref="extension-itme">
                <input
                  type="radio"
                  class="radio radio-sm"
                  :name="dataExtensionsFormatedAndSorted.stateId"
                  :value="extension.key"
                  v-model="selectedExtension"
                />
                {{ '{' + extension.nameFormated + '}' }}
              </label>
            </div>
          </div>
          <p class="label">The selected extension will be highlighted in the editor.</p>
          <p v-if="dataExtensionsFormatedAndSorted.evaluationDurationInSeconds !== 0" class="label">
            Evaluation took
            {{ dataExtensionsFormatedAndSorted.evaluationDurationInSeconds }} seconds.
          </p>
        </template>
      </fieldset>
    </div>
  </FloatingWindow>
</template>
<style style="scoped">
.extensions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--extension-item-min-width), 1fr));
}
</style>
