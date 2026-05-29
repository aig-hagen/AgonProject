/*
 * Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.
 *
 * Copyright (C) 2026  Artificial Intelligence Group at the Faculty of Mathematics and Computer Science of the FernUniversität in Hagen <https://www.fernuni-hagen.de/aig/en/>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import '@aig-hagen/graph-component/lib/graph-component.css'
import '@/style.css'
import '@/app/setup-immer'

import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createApp, markRaw } from 'vue'

import App from '@/app/App.vue'
import router from '@/app/router'
import { abstractArgumentationModule } from '@/modules/abstract-argumentation/moduleConfig'
import { bipoloarArgumentationModule } from '@/modules/bipolar-argumentation/moduleConfig'
import { openDocumentsDB } from '@/modules/common/documents/db'

const PRODUCTION_DATABASE_DOCUMENTS_NAME = 'documents'
const db = await openDocumentsDB(PRODUCTION_DATABASE_DOCUMENTS_NAME)

const modules = [abstractArgumentationModule, bipoloarArgumentationModule] as const

const app = createApp(App, {
  db: markRaw(db),
  modules: markRaw(modules),
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

app.use(VueQueryPlugin, { queryClient })
app.use(router)

app.mount('#app')
