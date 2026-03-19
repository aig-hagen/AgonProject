<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useDebounceFn } from '@vueuse/core'

const { active, value } = defineProps<{
  active: boolean
  value: string
}>()

const emit = defineEmits<{
  (e: 'rename', name: string): void
  (e: 'delete'): void
}>()

const debouncedRename = useDebounceFn((name) => {
  emit('rename', name)
}, 300)

function handleInput(e: InputEvent) {
  const target = e.target as HTMLInputElement
  debouncedRename(target.value)
}

function handleDelete() {
  emit('delete')
}
</script>
<template>
  <div role="tab" class="tab" :class="{ 'tab-active': active }">
    <template v-if="active">
      <input
        spellcheck="false"
        class="focus:outline-none"
        :value="value"
        placeholder="Untitled"
        @input="handleInput"
      />
    </template>
    <template v-else>
      {{ value }}
    </template>
    <button class="btn btn-square btn-xs ml-2 btn-ghost" @click="handleDelete">
      <XMarkIcon class="size-4"></XMarkIcon>
    </button>
  </div>
</template>
