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
<script setup lang="ts" generic="DocumentT extends Objectish">
import type { IDBPDatabase } from 'idb'
import type { Objectish } from 'immer'
import { provide } from 'vue'

import HomeViewDesktop from '@/app/home/HomeViewDesktop.vue'
import HomeViewMobile from '@/app/home/HomeViewMobile.vue'
import type { ModuleConfig } from '@/app/home/moduleConfig'
import { useHomeController } from '@/app/home/useHomeController'
import { DOCUMENTS_DB_INJECTION_KEY, type DocumentsDB } from '@/modules/common/documents/db'
import { useLayoutMode } from '@/modules/common/layout/useLayoutMode'

const { db, modules } = defineProps<{
  db: IDBPDatabase<DocumentsDB>
  modules: ModuleConfig<DocumentT>[]
}>()

provide(DOCUMENTS_DB_INJECTION_KEY, db)

// One controller instance, shared by both shells so state survives the breakpoint.
const controller = useHomeController(db, modules)

const { layoutMode } = useLayoutMode()
</script>

<template>
  <HomeViewMobile v-if="layoutMode === 'compact'" :modules="modules" :controller="controller" />
  <HomeViewDesktop v-else :db="db" :modules="modules" :controller="controller" />
</template>
