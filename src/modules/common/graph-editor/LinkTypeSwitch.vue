<script setup lang="ts">
import { offset, useFloating } from '@floating-ui/vue'
import { ArrowLongRightIcon } from '@heroicons/vue/24/outline'
import { onClickOutside } from '@vueuse/core'
import { toRef, useTemplateRef } from 'vue'

import ArrowDoubleLongRightIcon from '@/modules/common/graph-editor/ArrowDoubleLongRightIcon.vue'
import { type LinkConfigs, LinkType } from '@/modules/common/graph-editor/graphEditor'

const { reference, linkConfigs } = defineProps<{
  reference: SVGElement
  linkConfigs: LinkConfigs
}>()

const emit = defineEmits<{
  'update:arrowType': [value: LinkType]
  close: []
}>()

const floating = useTemplateRef('floating')
const { floatingStyles } = useFloating(
  toRef(() => reference),
  floating,
  {
    middleware: [
      // Centers vertically on reference
      offset(({ rects }) => {
        return -rects.reference.height / 2 - rects.floating.height / 2
      }),
    ],
  },
)

onClickOutside(floating, () => emit('close'), {
  ignore: [reference],
})
</script>

<template>
  <div tabindex="0" ref="floating" :style="floatingStyles">
    <ul class="dropdown menu rounded-box bg-base-100 shadow-sm/30">
      <li v-for="(config, linkType) in linkConfigs" :key="linkType">
        <a @click="emit('update:arrowType', linkType)"
          ><ArrowLongRightIcon v-if="linkType === LinkType.SINGLE" class="size-5 opacity-70" />
          <ArrowDoubleLongRightIcon
            v-if="linkType === LinkType.DOUBLE"
            class="size-5 opacity-70"
          />{{ config!.displayName }}</a
        >
      </li>
    </ul>
  </div>
</template>
