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
import { createRouter, createWebHistory } from 'vue-router'

import GenerateView from '@/app/generate/GenerateView.vue'
import HomeView from '@/app/home/HomeView.vue'
import ShareView from '@/app/share/ShareView.vue'
import ThirdPartyView from '@/app/third-party/ThirdPartyView.vue'

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
      path: '/share/:id',
      component: ShareView,
    },
    {
      path: '/third-party',
      component: ThirdPartyView,
    },
  ],
})

export default router
