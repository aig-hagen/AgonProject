<script setup lang="ts" generic="DocumentT">
import type { Example } from '@/modules/common/examples'

export interface ExampleGroup<DocumentT> {
  newNamePrefix: string
  displayNameSingular: string
  examples: Example<DocumentT>[]
  initialCotent: DocumentT
}
const { exampleGroups } = defineProps<{
  exampleGroups: ExampleGroup<DocumentT>[]
}>()

const emit = defineEmits<{
  open: [content: DocumentT, newNamePrefix: string]
}>()

function openExample(example: Example<DocumentT>, newNamePrefix: string) {
  emit('open', example.load(), newNamePrefix)
}

function openContent(content: DocumentT, newNamePrefix: string) {
  emit('open', content, newNamePrefix)
}
</script>
<template>
  <div class="max-w-7xl m-auto p-8">
    <h2 class="text-4xl font-bold my-8">
      Argumentation Toolbox
      <div class="text-lg font-normal text-neutral-800">
        Create and Inspect Argumentation Frameworks
      </div>
    </h2>
    <div class="flex flex-row flex-wrap">
      <div class="flex-1" v-for="(exampleGroup, index) in exampleGroups" :key="index">
        <h3 class="text-xl font-bold mb-2">{{ exampleGroup.displayNameSingular }}</h3>
        <h4
          class="text-lg btn btn-ghost font-normal mb-2 p-1 px-1"
          @click="openContent(exampleGroup.initialCotent, exampleGroup.newNamePrefix)"
        >
          Create New
        </h4>
        <template v-if="exampleGroup.examples.length !== 0">
          <h4 class="text-lg p-1 px-1 mb-1">Select Example</h4>

          <button
            v-for="(example, index) in exampleGroup.examples"
            :key="index"
            class="block btn btn-ghost p-1 px-2 h-8 font-normal"
            @click="openExample(example, example.name)"
          >
            Open <span class="italic">{{ example.name }}</span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
