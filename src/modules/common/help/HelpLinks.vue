<!--
  AgonProject - The platform to explore different approaches to formal argumentation.

  Copyright (C) 2026  Artificial Intelligence Group at the Faculty of Mathematics and Computer Science of the FernUniversität in Hagen <https://www.fernuni-hagen.de/aig/en/>

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->
<script setup lang="ts">
import { ArrowUpRightIcon, UserGroupIcon } from '@heroicons/vue/24/outline'

import GithubMarkIcon from '@/modules/common/help/GithubMarkIcon.vue'

const sourceTree = import.meta.env.VITE_APP_SOURCE_TREE
const sourceLink = `https://github.com/aig-hagen/AgonProject/tree/${sourceTree}`
</script>
<template>
  <div class="my-4 gap-2 flex flex-wrap">
    <a
      class="btn btn-xs btn-soft"
      target="_blank"
      rel="noopener"
      href="https://www.fernuni-hagen.de/aig/en/"
      ><img src="/favicon-32x32.png" class="size-4" alt="" />AIG Hagen<ArrowUpRightIcon
        class="size-2"
    /></a>
    <a class="btn btn-xs btn-soft" target="_blank" rel="noopener" href="https://tweetyproject.org"
      ><img src="/tweety-logo.png" class="size-4" alt="" />TweetyProject<ArrowUpRightIcon
        class="size-2"
    /></a>
    <a class="btn btn-xs btn-soft" target="_blank" rel="noopener" :href="sourceLink"
      ><GithubMarkIcon class="size-4" />Source {{ sourceTree }}<ArrowUpRightIcon class="size-2"
    /></a>
    <a class="btn btn-xs btn-soft" target="_blank" rel="noopener" href="/third-party"
      ><UserGroupIcon class="size-4" />Third-Party<ArrowUpRightIcon class="size-2"
    /></a>
  </div>
</template>
