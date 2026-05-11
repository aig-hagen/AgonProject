<script setup lang="ts">
import { offset, useFloating } from '@floating-ui/vue'
import { ArrowLongRightIcon } from '@heroicons/vue/24/outline'
import { toRef, useTemplateRef } from 'vue'

import ArrowDoubleLongRightIcon from '@/modules/common/graph-editor/ArrowDoubleLongRightIcon.vue'
import { type LinkConfigs, LinkType } from '@/modules/common/graph-editor/graphEditor'

const { reference, linkConfigs } = defineProps<{
  reference: SVGElement
  linkConfigs: LinkConfigs
}>()

const emit = defineEmits<{
  'update:arrowType': [value: LinkType]
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
</script>

<template>
  <div ref="floating" :style="floatingStyles">
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
