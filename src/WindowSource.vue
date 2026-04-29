<script setup lang="ts">
import FloatingWindow from './modules/common/window/FloatingWindow.vue'
import { onMounted, useTemplateRef } from 'vue'
import { basicSetup, EditorView } from 'codemirror'

const open = defineModel('open', { required: true })
const content = useTemplateRef('content')
onMounted(() => {
  // TODO do cleanup after closing if needed
  new EditorView({
    doc: `X
Y
Z
#
L K
E L support
N M
M L
M N
B A
F D
H E
M E
D E
C A
G D
D C
E C
D G
E D
E M
I H
J I
O A
H D
`,
    extensions: [basicSetup],
    parent: content.value!,
  })
})
</script>

<template>
  <FloatingWindow v-model:open="open" title="Source">
    <div ref="content"></div>
  </FloatingWindow>
</template>

<style>
/* TODO Revisit this quick and dirty solution */
.cm-editor:focus,
.cm-editor.cm-focused,
.cm-editor .cm-editor:focus-within {
  outline: none !important;
}
.cm-editor {
  height: 100%;
}
</style>
