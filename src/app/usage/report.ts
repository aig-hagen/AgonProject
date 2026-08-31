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
import type { AnalyticsEvent } from '@/app/usage/signals'
import { ANALYTICS_EVENTS } from '@/app/usage/signals'

// On by default in production builds; off in dev unless explicitly enabled.
// Set VITE_ANALYTICS_ENABLED=false to opt a production build out entirely.
const ENABLED =
  import.meta.env.VITE_ANALYTICS_ENABLED === 'true' ||
  (import.meta.env.PROD && import.meta.env.VITE_ANALYTICS_ENABLED !== 'false')

// Honour Do-Not-Track / Global Privacy Control: if the visitor has signalled
// they don't want tracking, we record nothing at all.
function privacyOptedOut(): boolean {
  if (typeof navigator === 'undefined') return true
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean }
  return nav.doNotTrack === '1' || nav.globalPrivacyControl === true
}

const active = ENABLED && !privacyOptedOut()

/**
 * Record an analytics event. Fire-and-forget: it never blocks the UI, never
 * throws, and any failure (network error, 429, disabled) is silently ignored.
 */
export function trackEvent(type: AnalyticsEvent, name?: string, props?: unknown): void {
  if (!active) return
  try {
    void fetch('/events', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, name, props }),
    }).catch(() => {})
  } catch {
    // never let analytics break the app
  }
}

export function trackPageView(path: string): void {
  trackEvent(ANALYTICS_EVENTS.pageView, path)
}
