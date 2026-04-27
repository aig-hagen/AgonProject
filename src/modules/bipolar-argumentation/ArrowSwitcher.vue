<script setup lang="ts">
import { toRef, useTemplateRef } from 'vue'
import { offset, useFloating } from '@floating-ui/vue'
import { ArrowLongRightIcon } from '@heroicons/vue/24/outline'
import ArrowDoubleLongRightIcon from '../../ArrowDoubleLongRightIcon.vue'

const { reference } = defineProps<{
  reference: SVGElement
}>()

const emit = defineEmits<{
  'update:arrowType': [value: 'attack' | 'support']
}>()

const floating = useTemplateRef('floating')
const { floatingStyles } = useFloating(
  toRef(() => reference),
  floating,
  {
    middleware: [
      // Centers on reference
      offset(({ rects }) => {
        return -rects.reference.height / 2 - rects.floating.height / 2
      }),
    ],
  },
)
</script>

<template>
  <div ref="floating" :style="floatingStyles">
    <ul class="dropdown menu rounded-box bg-base-100 shadow-sm/30">
      <li>
        <a @click="emit('update:arrowType', 'attack')"
          ><ArrowLongRightIcon class="size-5 opacity-70" />Attack</a
        >
      </li>
      <li>
        <a @click="emit('update:arrowType', 'support')"
          ><ArrowDoubleLongRightIcon class="size-5 opacity-70" />Support</a
        >
      </li>
    </ul>
  </div>
</template>
<style scoped></style>
