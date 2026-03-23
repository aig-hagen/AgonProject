<script setup lang="ts">
const examples = [
  'dix',
  'double_loop',
  'martin_str',
  'matti_lpnmr_2024',
  'meal_wine',
  'min_uniq_stb',
  'pierson_post',
  'safa24',
  'simple_game',
  'tapp24',
  'tapp25',
  'unique_stb',
  'wild_animals',
]
</script>
<template>
  <div class="max-w-7xl m-auto p-8">
    <h2 class="text-4xl font-bold my-8">
      Argumentation Toolbox
      <div class="text-lg font-normal text-neutral-800">
        Create and Inspect Argumentation Frameworks
      </div>
    </h2>
    <div class="flex flex-row flex-wrap">
      <div class="flex-1">
        <h3 class="text-xl font-bold mb-2">Abstract Argumentation</h3>
        <h4 class="text-lg btn btn-ghost font-normal mb-2 p-1 px-1">Create New</h4>
        <h4 class="text-lg p-1 px-1 mb-1">Select Example</h4>

        <button
          v-for="example in examples"
          :key="example"
          class="block btn btn-ghost p-1 px-2 h-8 font-normal"
        >
          Open <span class="italic">{{ example }}</span>
        </button>
      </div>
      <div class="flex-1">
        <h3 class="text-xl font-bold mb-2">Bipolar Argumentation</h3>
        <h4 class="text-lg btn btn-ghost font-normal mb-2 p-1 px-1">Create New</h4>
      </div>
    </div>
    <div></div>
  </div>
</template>
