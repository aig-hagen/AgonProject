<script setup lang="ts" generic="DocumentT">
import type { Example } from '@/modules/common/examples'
import HelpLinks from '@/modules/common/help/HelpLinks.vue'
import MainMenu from '@/modules/common/main-menu/MainMenu.vue'

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
  new: []
  load: []
}>()

function openExample(example: Example<DocumentT>, newNamePrefix: string) {
  emit('open', example.load(), newNamePrefix)
}

function openContent(content: DocumentT, newNamePrefix: string) {
  emit('open', content, newNamePrefix)
}
</script>
<template>
  <div class="h-full w-full">
    <div class="max-w-7xl m-auto p-8">
      <h2 class="text-4xl font-bold my-4">
        Argumentation Toolbox
        <div class="text-lg font-normal text-neutral-800">
          Create and Inspect Argumentation Frameworks
        </div>
      </h2>
      <HelpLinks />
      <div class="flex flex-row flex-wrap">
        <div class="flex-1" v-for="(exampleGroup, index) in exampleGroups" :key="index">
          <h3 class="text-xl font-bold mb-2">{{ exampleGroup.displayNameSingular }}</h3>
          <h4
            class="text-lg btn btn-link font-normal mb-2 p-1 px-1"
            @click="openContent(exampleGroup.initialCotent, exampleGroup.newNamePrefix)"
          >
            Start new
          </h4>
          <template v-if="exampleGroup.examples.length !== 0">
            <h4 class="text-lg p-1 px-1 mb-1">Open Example</h4>

            <button
              v-for="(example, index) in exampleGroup.examples"
              :key="index"
              class="block btn btn-link p-1 px-2 h-8 font-normal"
              @click="openExample(example, example.name)"
            >
              {{ example.name }}
            </button>
          </template>
        </div>
      </div>
    </div>
    <div class="absolute top-4 bottom-4 left-4 flex flex-col justify-start pointer-events-none">
      <MainMenu @new="emit('new')" @load="emit('load')" />
    </div>
  </div>
</template>
