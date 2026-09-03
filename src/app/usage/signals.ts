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
// Analytics event types. Keep in sync with the ALLOWED_TYPES allowlist in
// servers/share/src/analytics.ts — the backend rejects anything not listed there.
export const ANALYTICS_EVENTS = {
  pageView: 'page_view',
  moduleOpen: 'module_open',
  generateRun: 'generate_run',
  evaluationOpen: 'evaluation_open',
  evaluationRateLimited: 'evaluation_rate_limited',
  shareCreate: 'share_create',
  tutorialStart: 'tutorial_start',
  tutorialComplete: 'tutorial_complete',
} as const

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]
