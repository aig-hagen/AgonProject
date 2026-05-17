import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/app/home/HomeView.vue'
import ThirdPartyView from '@/app/third-party/ThirdPartyView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
    },
    {
      path: '/third-party',
      component: ThirdPartyView,
    },
  ],
})

export default router
