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
import { useI18n } from 'vue-i18n'

import { attributions, ctanAttributions, getAttributionId } from '@/app/third-party/attributions'
import PageHeader from '@/modules/common/layout/PageHeader.vue'

const { t } = useI18n({ useScope: 'global' })
</script>

<template>
  <div class="flex flex-col h-dvh w-full bg-base-100 overflow-hidden">
    <PageHeader :title="t('thirdParty.titleShort')" :back-label="t('home.backToEditor')" />

    <!-- Single-column disclosure list -->
    <div
      class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4"
      style="padding-bottom: max(env(safe-area-inset-bottom), 1.25rem)"
    >
      <p class="text-sm text-base-content/80 leading-relaxed">{{ t('thirdParty.intro') }}</p>

      <!-- TeX packages -->
      <h2 class="font-bold text-lg">
        {{ t('thirdParty.texPackages') }}
      </h2>
      <p class="text-xs text-base-content/65 leading-relaxed -mt-2">
        {{ t('thirdParty.texIntroShort') }}
      </p>
      <details
        v-for="attribution of ctanAttributions"
        :key="getAttributionId(attribution)"
        class="rounded-box border border-base-300 px-3.5 py-3"
      >
        <summary class="text-sm font-semibold cursor-pointer marker:text-base-content/40">
          <template v-if="attribution.scope !== undefined">@{{ attribution.scope }}/</template
          >{{ attribution.name
          }}<template v-if="attribution.version !== undefined"
            ><span class="text-base-content/65 font-normal">
              @{{ attribution.version }}</span
            ></template
          >
        </summary>
        <div class="mt-2.5 flex flex-col gap-2">
          <p class="text-xs text-base-content/80 leading-relaxed">
            <i18n-t
              v-if="attribution.publisher"
              keypath="thirdParty.publishedWithPublisher"
              tag="span"
              scope="global"
            >
              <template #publisher
                ><em>{{ attribution.publisher }}</em></template
              >
              <template #license
                ><em>{{ attribution.license }}</em></template
              >
              <template #repository
                ><a class="link link-primary break-all" :href="attribution.repository">{{
                  attribution.repository
                }}</a></template
              >
            </i18n-t>
            <i18n-t v-else keypath="thirdParty.publishedNoPublisher" tag="span" scope="global">
              <template #license
                ><em>{{ attribution.license }}</em></template
              >
              <template #repository
                ><a class="link link-primary break-all" :href="attribution.repository">{{
                  attribution.repository
                }}</a></template
              >
            </i18n-t>
          </p>
          <pre
            v-if="attribution.licenseText"
            class="text-xs whitespace-pre-wrap rounded-box bg-base-200 p-2.5 overflow-x-auto"
            >{{ attribution.licenseText }}</pre
          >
          <p v-else class="text-xs text-base-content/65">
            {{ t('thirdParty.noLicenseText') }}
          </p>
        </div>
      </details>

      <!-- Libraries & projects -->
      <h2 class="font-bold text-lg mt-1">
        {{ t('thirdParty.librariesProjects') }}
      </h2>
      <details
        v-for="attribution of attributions"
        :key="getAttributionId(attribution)"
        class="rounded-box border border-base-300 px-3.5 py-3"
      >
        <summary class="text-sm font-semibold cursor-pointer marker:text-base-content/40">
          <template v-if="attribution.scope !== undefined">@{{ attribution.scope }}/</template
          >{{ attribution.name
          }}<template v-if="attribution.version !== undefined"
            ><span class="text-base-content/65 font-normal">
              @{{ attribution.version }}</span
            ></template
          >
        </summary>
        <div class="mt-2.5 flex flex-col gap-2">
          <p class="text-xs text-base-content/80 leading-relaxed">
            <i18n-t
              v-if="attribution.publisher"
              keypath="thirdParty.publishedWithPublisher"
              tag="span"
              scope="global"
            >
              <template #publisher
                ><em>{{ attribution.publisher }}</em></template
              >
              <template #license
                ><em>{{ attribution.license }}</em></template
              >
              <template #repository
                ><a class="link link-primary break-all" :href="attribution.repository">{{
                  attribution.repository
                }}</a></template
              >
            </i18n-t>
            <i18n-t v-else keypath="thirdParty.publishedNoPublisher" tag="span" scope="global">
              <template #license
                ><em>{{ attribution.license }}</em></template
              >
              <template #repository
                ><a class="link link-primary break-all" :href="attribution.repository">{{
                  attribution.repository
                }}</a></template
              >
            </i18n-t>
          </p>
          <pre
            v-if="attribution.licenseText"
            class="text-xs whitespace-pre-wrap rounded-box bg-base-200 p-2.5 overflow-x-auto"
            >{{ attribution.licenseText }}</pre
          >
          <p v-else class="text-xs text-base-content/65">
            {{ t('thirdParty.noLicenseText') }}
          </p>
        </div>
      </details>
    </div>
  </div>
</template>
