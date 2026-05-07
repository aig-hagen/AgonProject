<script setup lang="ts">
import 'katex/dist/katex.min.css'
import renderMathInElement from 'katex/contrib/auto-render'
import { useTemplateRef, watchEffect } from 'vue'
const { text } = defineProps<{
  text: string
}>()

const elementRef = useTemplateRef('element')

watchEffect(() => {
  if (elementRef.value === null) {
    return
  }
  elementRef.value.innerText = text
  renderMathInElement(elementRef.value, {
    strict: true,
    delimiters: [{ left: '$', right: '$', display: false }],
  })
})
</script>
<template>
  <span ref="element"></span>
</template>
