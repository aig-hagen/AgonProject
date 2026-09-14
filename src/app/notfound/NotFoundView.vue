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
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

const { t } = useI18n({ useScope: 'global' })
</script>

<template>
  <div class="h-dvh w-screen flex flex-col items-center justify-center gap-4 bg-base-100 px-6">
    <p class="text-6xl font-bold text-base-content/20">404</p>
    <h1 class="text-xl font-bold text-center">{{ t('notFound.heading') }}</h1>
    <p class="max-w-sm text-center text-base-content/70">{{ t('notFound.description') }}</p>
    <RouterLink to="/" class="btn btn-primary btn-sm gap-1 mt-2">
      <ArrowLeftIcon class="size-4" />
      {{ t('notFound.backToEditor') }}
    </RouterLink>
  </div>
</template>
