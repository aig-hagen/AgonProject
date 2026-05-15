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
