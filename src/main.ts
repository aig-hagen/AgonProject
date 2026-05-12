import '@/style.css'
import '@/app/setup-immer'

import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'

import App from '@/app/App.vue'
import { openDocumentsDB } from '@/app/db'
import router from '@/app/router'
import { abstractArgumentationModule } from '@/modules/abstract-argumentation/moduleConfig'
import { bipoloarArgumentationModule } from '@/modules/bipolar-argumentation/moduleConfig'

const PRODUCTION_DATABASE_DOCUMENTS_NAME = 'documents'
const db = await openDocumentsDB(PRODUCTION_DATABASE_DOCUMENTS_NAME)

const modules = [abstractArgumentationModule, bipoloarArgumentationModule] as const

const app = createApp(App, {
  db: db,
  modules: modules,
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
