<script setup lang="ts">
import {
  AcademicCapIcon,
  ArrowUpRightIcon,
  CodeBracketIcon,
  UserGroupIcon,
} from '@heroicons/vue/24/outline'

const sourceTree = import.meta.env.VITE_APP_SOURCE_TREE
const sourceLink = `https://github.com/aig-hagen/argumentation-toolbox/tree/${sourceTree}`
</script>
<template>
  <div class="my-4 gap-2 flex flex-wrap">
    <a
      class="btn btn-xs btn-soft"
      target="_blank"
      rel="noopener"
      href="https://www.fernuni-hagen.de/aig/en/"
      ><AcademicCapIcon class="size-4" />AIG Hagen<ArrowUpRightIcon class="size-2"
    /></a>
    <a class="btn btn-xs btn-soft" target="_blank" rel="noopener" :href="sourceLink"
      ><CodeBracketIcon class="size-4" />Source {{ sourceTree }}<ArrowUpRightIcon class="size-2"
    /></a>
    <a class="btn btn-xs btn-soft" target="_blank" rel="noopener" href="/third-party"
      ><UserGroupIcon class="size-4" />Third-Party<ArrowUpRightIcon class="size-2"
    /></a>
  </div>
</template>
