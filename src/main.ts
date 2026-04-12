import { createApp } from 'vue'
import './style.css'
import { createPinia } from 'pinia'

import App from './app/App.vue'
import router from './router'
import './app/setup-immer'
import { openDocumentsDB } from './modules/document/useDocuments'

const PRODUCTION_DATABASE_DOCUMENTS_NAME = 'documents'
const db = await openDocumentsDB(PRODUCTION_DATABASE_DOCUMENTS_NAME)
const APP_CONFIGURATION = {
  db: db,
}
const app = createApp(App, {
  db: APP_CONFIGURATION.db,
})

app.use(createPinia())
app.use(router)

app.mount('#app')
