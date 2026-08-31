/*
 * AgonProject - The platform to explore different approaches to formal argumentation.
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
import { createRouter, createWebHistory } from 'vue-router'

import GenerateView from '@/app/generate/GenerateView.vue'
import GlossaryView from '@/app/glossary/GlossaryView.vue'
import HomeView from '@/app/home/HomeView.vue'
import PrivacyView from '@/app/privacy/PrivacyView.vue'
import ShareView from '@/app/share/ShareView.vue'
import ThirdPartyView from '@/app/third-party/ThirdPartyView.vue'
import { trackPageView } from '@/app/usage/report'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
    },
    {
      path: '/generate',
      component: GenerateView,
    },
    {
      path: '/glossary',
      component: GlossaryView,
    },
    {
      path: '/share/:id',
      component: ShareView,
    },
    {
      path: '/third-party',
      component: ThirdPartyView,
    },
    {
      path: '/privacy',
      component: PrivacyView,
    },
  ],
})

// Track the route pattern (e.g. '/share/:id'), never the concrete path, so no
// share IDs or other path parameters are recorded.
router.afterEach((to) => {
  const pattern = to.matched[to.matched.length - 1]?.path ?? to.path
  trackPageView(pattern)
})

export default router
