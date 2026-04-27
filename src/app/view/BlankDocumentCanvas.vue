<script setup lang="ts" generic="DocumentT">
import type { Example } from '@/modules/common/examples'

export interface ExampleGroup<DocumentT> {
  displayNameSingular: string
  examples: Example<DocumentT>[]
  initialCotent: DocumentT
}
const { exampleGroups } = defineProps<{
  exampleGroups: ExampleGroup<DocumentT>[]
}>()

const emit = defineEmits<{
  open: [content: DocumentT]
}>()

function openExample(example: Example<DocumentT>) {
  emit('open', example.load())
}

function openContent(content: DocumentT) {
  emit('open', content)
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
          @click="openContent(exampleGroup.initialCotent)"
        >
          Create New
        </h4>
        <!-- TODO This UI is not clear. Buttons are not visible as such. -->

        <template v-if="exampleGroup.examples.length !== 0">
          <h4 class="text-lg p-1 px-1 mb-1">Select Example</h4>

          <button
            v-for="(example, index) in exampleGroup.examples"
            :key="index"
            class="block btn btn-ghost p-1 px-2 h-8 font-normal"
            @click="openExample(example)"
          >
            Open <span class="italic">{{ example.name }}</span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
