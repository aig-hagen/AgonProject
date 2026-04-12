<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useDebounceFn } from '@vueuse/core'
import { useTemplateRef } from 'vue'

const PLACEHOLDER = 'new argumentation'

const { active, value } = defineProps<{
  active: boolean
  value: string
}>()

const emit = defineEmits<{
  rename: [name: string]
  delete: []
}>()

const debouncedRename = useDebounceFn((name) => {
  emit('rename', name)
}, 300)

function getInputSizerValue(value: string) {
  if (value !== '') {
    return value
  }
  return PLACEHOLDER
}

function handleInput(e: InputEvent) {
  const target = e.target as HTMLInputElement
  inputSizerRef.value!.dataset.value = getInputSizerValue(target.value)
  debouncedRename(target.value)
}

function handleDelete() {
  emit('delete')
}

const inputSizerRef = useTemplateRef('input-sizer')
</script>
<template>
  <div role="tab" class="tab shrink-0" :class="{ 'tab-active': active }">
    <!--
      Input sizer to make input dynamically grow.
      See https://css-tricks.com/auto-growing-inputs-textareas/#aa-other-ideas
    -->
    <label ref="input-sizer" class="input-sizer min-w-14" :data-value="getInputSizerValue(value)">
      <input
        spellcheck="false"
        class="focus:outline-none"
        :value="value"
        :placeholder="PLACEHOLDER"
        @input="handleInput"
      />
    </label>
    <button class="btn btn-square btn-xs ml-2 btn-ghost" @click="handleDelete" title="Close">
      <XMarkIcon class="size-4"></XMarkIcon>
    </button>
  </div>
</template>

<style>
input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.input-sizer {
  display: inline-block;
  position: relative;
  width: fit-content;
}

.input-sizer::after {
  content: attr(data-value) ' ';
  visibility: hidden;
}
</style>
