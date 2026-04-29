<script setup lang="ts">
import FloatingWindow from './modules/common/window/FloatingWindow.vue'

const open = defineModel('open', { required: true })
const extension = defineModel('extension', { required: true, default: 's1' })
</script>

<template>
  <FloatingWindow v-model:open="open" title="Extensions">
    <div class="p-4">
      <!-- TOOD check how to use fieldste correctly -->
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
  </FloatingWindow>
</template>
