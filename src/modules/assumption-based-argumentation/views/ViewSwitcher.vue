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
import { LockClosedIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { AbaView } from '@/modules/assumption-based-argumentation/views/editorState'
import {
  flatOnlyReason,
  viewOptions,
} from '@/modules/assumption-based-argumentation/views/viewOptions'
import SegmentedControl from '@/modules/common/graph-editor/SegmentedControl.vue'

const { flat } = defineProps<{ flat: boolean }>()
const view = defineModel<AbaView>({ required: true })

const { t } = useI18n({ useScope: 'global' })

const options = computed(() =>
  viewOptions(flat).map(({ key, label, icon, flatOnly }) => ({
    key,
    label,
    icon,
    disabled: flatOnly && !flat,
    tip: flatOnly && !flat ? flatOnlyReason() : undefined,
  })),
)
</script>

<template>
  <div class="relative w-fit">
    <SegmentedControl
      v-model="view"
      :options="options"
      :aria-label="t('editor.aba.views.ariaLabel')"
    />
    <!-- Out of flow so the centered bar keeps its width when this appears. -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      leave-active-class="transition duration-150 ease-in"
      enter-from-class="opacity-0 -translate-x-1"
      leave-to-class="opacity-0 -translate-x-1"
    >
      <span
        v-if="view !== 'theory'"
        class="absolute top-1/2 left-full ml-2 -mt-4 flex h-8 items-center gap-1 rounded-full border border-base-300 bg-base-100/80 px-2.5 text-xs whitespace-nowrap text-base-content/60 shadow-lg backdrop-blur-md"
        :title="t('editor.aba.views.derivedFromTheory')"
      >
        <LockClosedIcon class="size-3.5" /> {{ t('editor.aba.views.readOnly') }}
      </span>
    </Transition>
  </div>
</template>
