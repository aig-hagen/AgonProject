<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'

import LayoutTab from '@/app/view/EditorTab.vue'

defineProps<{
  data: readonly { readonly name: string; readonly id: number }[]
  selected?: number
}>()

const emit = defineEmits<{
  rename: [id: number, name: string]
  select: [id: number]
  delete: [id: number]
  create: []
}>()
</script>

<template>
  <div role="tablist" class="tabs bg-base-200 tabs-lift flex-nowrap overflow-x-auto">
    <LayoutTab
      v-for="datum in data"
      :key="datum.id"
      :value="datum.name"
      :active="datum.id === selected"
      @delete="emit('delete', datum.id)"
      @rename="emit('rename', datum.id, $event)"
      @click="emit('select', datum.id)"
    />
    <div role="tab" class="tab sticky right-0 bg-base-200">
      <button class="btn btn-square btn-xs btn-ghost" @click="emit('create')" title="Create">
        <PlusIcon class="size-4"></PlusIcon>
      </button>
    </div>
  </div>
</template>
