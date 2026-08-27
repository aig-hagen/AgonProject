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
import { useRouter } from 'vue-router'

import { attributions, ctanAttributions, getAttributionId } from '@/app/third-party/attributions'

const router = useRouter()
</script>

<template>
  <div class="flex flex-col h-dvh w-screen bg-base-100 overflow-hidden">
    <!-- Top bar -->
    <header
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
      <span class="flex-1 text-lg font-bold py-2.5 leading-tight">Third-Party Libraries</span>
    </header>

    <!-- Single-column disclosure list -->
    <div
      class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4"
      style="padding-bottom: max(env(safe-area-inset-bottom), 1.25rem)"
    >
      <p class="text-sm text-base-content/70 leading-relaxed">
        This application makes use of open-source software components. We gratefully acknowledge the
        developers and contributors of these projects. The following attributions are provided to
        comply with applicable open-source licenses.
      </p>

      <!-- TeX packages -->
      <div class="text-xs font-bold text-base-content/40 tracking-wide">TEX PACKAGES</div>
      <p class="text-xs text-base-content/60 leading-relaxed -mt-2">
        Bundled and served to render TeX client-side. For some packages, only the parts required by
        this application are included.
      </p>
      <details
        v-for="attribution of ctanAttributions"
        :key="getAttributionId(attribution)"
        class="rounded-2xl border border-base-300 px-3.5 py-3"
      >
        <summary class="text-sm font-semibold cursor-pointer marker:text-base-content/40">
          <template v-if="attribution.scope !== undefined">@{{ attribution.scope }}/</template
          >{{ attribution.name
          }}<template v-if="attribution.version !== undefined"
            ><span class="text-base-content/50 font-normal">
              @{{ attribution.version }}</span
            ></template
          >
        </summary>
        <div class="mt-2.5 flex flex-col gap-2">
          <p class="text-xs text-base-content/70 leading-relaxed">
            Published<template v-if="attribution.publisher">
              by <em>{{ attribution.publisher }}</em></template
            >
            under <em>{{ attribution.license }}</em> at
            <a class="link link-primary break-all" :href="attribution.repository">{{
              attribution.repository
            }}</a
            >.
          </p>
          <pre
            v-if="attribution.licenseText"
            class="text-[11px] whitespace-pre-wrap rounded-lg bg-base-200 p-2.5 overflow-x-auto"
            >{{ attribution.licenseText }}</pre
          >
          <p v-else class="text-xs text-base-content/50">
            This software component provides no license text.
          </p>
        </div>
      </details>

      <!-- Libraries & projects -->
      <div class="text-xs font-bold text-base-content/40 tracking-wide mt-1">
        LIBRARIES &amp; PROJECTS
      </div>
      <details
        v-for="attribution of attributions"
        :key="getAttributionId(attribution)"
        class="rounded-2xl border border-base-300 px-3.5 py-3"
      >
        <summary class="text-sm font-semibold cursor-pointer marker:text-base-content/40">
          <template v-if="attribution.scope !== undefined">@{{ attribution.scope }}/</template
          >{{ attribution.name
          }}<template v-if="attribution.version !== undefined"
            ><span class="text-base-content/50 font-normal">
              @{{ attribution.version }}</span
            ></template
          >
        </summary>
        <div class="mt-2.5 flex flex-col gap-2">
          <p class="text-xs text-base-content/70 leading-relaxed">
            Published<template v-if="attribution.publisher">
              by <em>{{ attribution.publisher }}</em></template
            >
            under <em>{{ attribution.license }}</em> at
            <a class="link link-primary break-all" :href="attribution.repository">{{
              attribution.repository
            }}</a
            >.
          </p>
          <pre
            v-if="attribution.licenseText"
            class="text-[11px] whitespace-pre-wrap rounded-lg bg-base-200 p-2.5 overflow-x-auto"
            >{{ attribution.licenseText }}</pre
          >
          <p v-else class="text-xs text-base-content/50">
            This software component provides no license text.
          </p>
        </div>
      </details>
    </div>
  </div>
</template>
