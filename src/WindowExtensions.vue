<script setup lang="ts">
import '@interactjs/auto-start'
import '@interactjs/actions/drag'
import '@interactjs/actions/resize'
import interact from '@interactjs/interact'
import { onMounted, useTemplateRef } from 'vue'
import { MinusIcon } from '@heroicons/vue/24/solid'

const position = { x: 100, y: 100 }
const floating = useTemplateRef('floating')

const open = defineModel('open', { required: true })
const extension = defineModel('extension', { required: true, default: 's1' })

onMounted(() => {
  if (floating.value === null) {
    throw Error('Window ref not set.')
  }
  floating.value.style.transform = `translate(${position.x}px, ${position.y}px)`

  interact(floating.value)
    .draggable({
      // TODO https://interactjs.io/docs/restriction/

      ignoreFrom: '.content', // TODO Add ignore and
      listeners: {
        move(event) {
          position.x += event.dx
          position.y += event.dy
          event.target.style.transform = `translate(${position.x}px, ${position.y}px)`
        },
      },
    })
    .resizable({
      invert: 'none',
      edges: { top: true, left: true, bottom: true, right: true },
      listeners: {
        move: function (event) {
          position.x += event.deltaRect.left
          position.y += event.deltaRect.top

          const { width, height } = event.rect

          event.target.style.transform = `translate(${position.x}px, ${position.y}px)`
          event.target.style.width = `${width}px`
          event.target.style.height = `${height}px`
        },
      },
    })
})
</script>

<!-- bg-base-300 -->
<template>
  <div
    v-show="open"
    ref="floating"
    class="absolute top-0 left-0 rounded-box bg-base-200 flex flex-col shadow-lg/30 border border-base-300"
    :style="{
      transform: `translate(${position.x}px, ${position.y}px)`,
    }"
  >
    <div class="border-b border-base-300 flex justify-between py-1 pl-4 pr-2">
      <div>Extensions</div>
      <button @click="open = false" class="btn btn-square btn-xs btn-ghost">
        <MinusIcon class="size-4"></MinusIcon>
      </button>
    </div>
    <div class="flex-1 bg-base-100 p-4 overflow-x-auto">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Inputs</legend>
        <div class="flex gap-2 flex-wrap">
          <label class="select select-sm w-52">
            <span class="label">Semantics</span>
            <select>
              <option>Grounded</option>
              <option selected>Stable</option>
              <option>Preferred</option>
              <option>Complete</option>
            </select>
          </label>
          <label class="select select-sm w-52">
            <span class="label">Solver</span>
            <select>
              <option selected>TweetyProject</option>
              <option>PyArg</option>
            </select>
          </label>
        </div>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Results</legend>
        <!-- TODO Consider using grid to align items in columns-->
        <div class="flex gap-2 flex-wrap">
          <label class="label" for="louie">
            <input
              type="radio"
              class="radio radio-sm"
              id="louie"
              name="drone"
              value="s1"
              v-model="extension"
            />
            {B, C, F, G, H, J, L, N, O, X, Y, Z}
          </label>
          <label class="label" for="louie2">
            <input
              type="radio"
              class="radio radio-sm"
              id="louie2"
              name="drone"
              value="s2"
              v-model="extension"
            />
            {B, C, F, G, H, J, K, M, O, X, Y, Z}
          </label>
          <label class="label" for="louie3">
            <input
              type="radio"
              class="radio radio-sm"
              id="louie3"
              name="drone"
              value="s3"
              v-model="extension"
            />
            {X, X, X, X}
          </label>
          <label class="label" for="louie4">
            <input
              type="radio"
              class="radio radio-sm"
              id="louie4"
              name="drone"
              value="s4"
              v-model="extension"
            />
            {X, Y, Z}
          </label>
        </div>
        <p class="label">Select result to be highligted in the graph</p>
      </fieldset>
    </div>
  </div>
</template>
