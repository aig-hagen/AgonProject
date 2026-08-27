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
import { attributions, ctanAttributions, getAttributionId } from '@/app/third-party/attributions'
</script>

<template>
  <div class="m-auto flex flex-nowrap justify-center my-4 gap-4">
    <aside class="w-3xs">
      <ul class="menu">
        <h2 class="menu-title">Third-Party Libraries and Projects</h2>
        <li>
          <a href="tex-packages">TeX packages</a>
          <ul>
            <li v-for="attribution of ctanAttributions" :key="getAttributionId(attribution)">
              <a :href="'#' + getAttributionId(attribution)"
                ><template v-if="attribution.scope !== undefined"
                  >@{{ attribution.scope }}/</template
                >{{ attribution.name }}</a
              >
            </li>
          </ul>
        </li>
        <li v-for="attribution of attributions" :key="getAttributionId(attribution)">
          <a :href="'#' + getAttributionId(attribution)"
            ><template v-if="attribution.scope !== undefined">@{{ attribution.scope }}/</template
            >{{ attribution.name }}</a
          >
        </li>
      </ul>
    </aside>
    <main class="max-w-3xl">
      <h1 class="m-1 font-bold text-xl">Third-Party Libraries and Projects</h1>
      <p class="m-1 mb-4">
        This application makes use of open-source software components. We gratefully acknowledge the
        developers and contributors of these projects. The following attributions are provided to
        comply with applicable open-source licenses.
      </p>
      <h2 id="tex-packages" class="m-1 font-bold text-lg">Tex Packages</h2>
      <p class="m-1 mb-4">
        This application bundles and serves TeX packages to render TeX on the client side. For some
        packages, only the parts required by this application are included. The following is a list
        of the packages used and where their original full versions can be obtained.
      </p>
      <template v-for="attribution of ctanAttributions" :key="getAttributionId(attribution)">
        <h3 class="m-1 font-bold" :id="getAttributionId(attribution)">
          <template v-if="attribution.scope !== undefined">@{{ attribution.scope }}/</template
          >{{ attribution.name
          }}<template v-if="attribution.version !== undefined">@{{ attribution.version }}</template>
        </h3>

        <p class="m-1">
          Published<template v-if="attribution.publisher">
            by <em> {{ attribution.publisher }}</em></template
          >
          under <em>{{ attribution.license }}</em> at
          <a class="link link-primary" :href="attribution.repository">{{
            attribution.repository
          }}</a
          >.
        </p>
        <blockquote class="m-1 alert whitespace-pre-wrap w-fit" v-if="attribution.licenseText">
          {{ attribution.licenseText }}
        </blockquote>
        <p class="m-1" v-else>This software component provides no license text.</p>
      </template>
      <template v-for="attribution of attributions" :key="getAttributionId(attribution)">
        <h2 class="m-1 font-bold" :id="getAttributionId(attribution)">
          <template v-if="attribution.scope !== undefined">@{{ attribution.scope }}/</template
          >{{ attribution.name
          }}<template v-if="attribution.version !== undefined">@{{ attribution.version }}</template>
        </h2>

        <p class="m-1">
          Published<template v-if="attribution.publisher">
            by <em> {{ attribution.publisher }}</em></template
          >
          under <em>{{ attribution.license }}</em> at
          <a class="link link-primary" :href="attribution.repository">{{
            attribution.repository
          }}</a
          >.
        </p>
        <blockquote class="m-1 alert whitespace-pre-wrap w-fit" v-if="attribution.licenseText">
          {{ attribution.licenseText }}
        </blockquote>
        <p class="m-1" v-else>This software component provides no license text.</p>
      </template>
    </main>
  </div>
</template>
