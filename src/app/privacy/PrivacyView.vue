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
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useLayoutMode } from '@/modules/common/layout/useLayoutMode'

const { layoutMode } = useLayoutMode()
const router = useRouter()

const isCompact = computed(() => layoutMode.value === 'compact')

const sections = [
  { id: 'what-we-collect', title: 'What we collect' },
  { id: 'what-we-dont', title: 'What we never collect' },
  { id: 'opting-out', title: 'Opting out' },
  { id: 'imprint', title: 'Imprint' },
]
</script>

<template>
  <div class="flex flex-col bg-base-100" :class="isCompact ? 'h-dvh w-screen overflow-hidden' : ''">
    <!-- Mobile app bar -->
    <header
      v-if="isCompact"
      class="flex-none flex items-center gap-1 px-2 pr-3 border-b border-base-300 bg-base-200"
      style="padding-top: calc(env(safe-area-inset-top) + 0.5rem)"
    >
      <button
        class="btn btn-square btn-ghost btn-sm"
        aria-label="Back to editor"
        @click="router.push('/')"
      >
        <ChevronLeftIcon class="size-6 opacity-70" />
      </button>
      <span class="flex-1 text-lg font-bold py-2.5 leading-tight">Privacy Policy and Imprint</span>
    </header>

    <div
      :class="
        isCompact
          ? 'flex-1 overflow-y-auto px-4 py-4'
          : 'm-auto flex flex-nowrap justify-center my-4 gap-4'
      "
      :style="isCompact ? 'padding-bottom: max(env(safe-area-inset-bottom), 1.25rem)' : ''"
    >
      <!-- Desktop section nav -->
      <aside v-if="!isCompact" class="w-3xs">
        <ul class="menu">
          <h2 class="menu-title">Privacy Policy and Imprint</h2>
          <li v-for="s of sections" :key="s.id">
            <a :href="'#' + s.id">{{ s.title }}</a>
          </li>
        </ul>
      </aside>

      <!-- Single source of truth for the notice text -->
      <main class="max-w-3xl">
        <h1 v-if="!isCompact" class="m-1 font-bold text-xl">Privacy Policy and Imprint</h1>
        <p class="m-1 mb-4">
          AgonProject collects lightweight, <strong>anonymous, aggregated</strong> usage statistics
          so we can see which parts of the app get used. There are no cookies, no personal data, and
          no tracking. The content of anything you build in the app is never collected.
        </p>

        <h2 id="what-we-collect" class="m-1 font-bold text-lg">What we collect</h2>
        <p class="m-1">
          We record simple, anonymous events — a page view, opening a module or an evaluation,
          generating a random framework, starting or finishing a tutorial, or creating a share link.
          Each event stores only the type of action and, at most, a non-identifying detail like the
          module or the chosen generation algorithm — never the specific content or the share's
          contents.
        </p>

        <h2 id="what-we-dont" class="m-1 font-bold text-lg mt-4">What we never collect</h2>
        <ul class="m-1 list-disc list-inside">
          <li>IP addresses</li>
          <li>Precise location</li>
          <li>Share IDs or any other content you create in the app</li>
          <li>Any other personal data</li>
        </ul>

        <h2 id="opting-out" class="m-1 font-bold text-lg mt-4">Opting out</h2>
        <p class="m-1 mb-4">
          We honour
          <a
            class="link link-primary"
            target="_blank"
            rel="noopener"
            href="https://globalprivacycontrol.org/"
            >Global Privacy Control</a
          > and the <em>Do Not Track</em> setting.
        </p>

        <h2 id="imprint" class="m-1 font-bold text-lg mt-4">Imprint</h2>
        <p class="m-1 mb-4">
          Responsible according to § 5 DDG and § 18 (2) MStV: Lars Bengel (<a
            class="link link-primary"
            href="mailto:lars.bengel@fernuni-hagen.de"
            >lars.bengel@fernuni-hagen.de</a
          >), Universitätsstraße 11, 58097 Hagen, Germany.
        </p>
      </main>
    </div>
  </div>
</template>
