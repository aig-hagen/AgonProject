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
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { EvaluationWindowQuery } from '@/modules/common/evaluation/BaseEvaluationWindow.vue'
import { TWEETY_TIMEOUT_IN_MS } from '@/modules/common/evaluation/tweety-project/fetch'

// Shared status logic for the desktop card and the compact sheet body: the error strip,
// the first-load skeleton flag, and an elapsed-time counter while evaluating.
export function useEvaluationStatus(query: EvaluationWindowQuery, onEvaluate: () => void) {
  const { t } = useI18n({ useScope: 'global' })
  const { error, isPending, isLoading, isError } = query

  const timeoutSeconds = Math.round((query.timeoutMs ?? TWEETY_TIMEOUT_IN_MS) / 1000)

  watch(isLoading, (loading, wasLoading) => {
    if (loading && !wasLoading) onEvaluate()
  })

  // All failure modes share one status strip; only wording and tone differ.
  const statusStrip = computed(() => {
    if (!isError.value) return undefined
    switch (error.value?.name) {
      case 'ServiceUnavailableError':
        return { kind: 'warning', message: t('evaluation.status.serviceUnavailable') }
      case 'RateLimitError':
        return { kind: 'warning', message: t('evaluation.status.rateLimited') }
      case 'EvaluationTimeoutError':
        return {
          kind: 'warning',
          message: t('evaluation.status.timedOut', { seconds: timeoutSeconds }),
        }
      case 'ReasonerError':
        return { kind: 'error', message: error.value.message }
      default:
        return { kind: 'error', message: t('evaluation.status.failed') }
    }
  })

  // True only on the very first evaluation, before any result exists — the slot
  // where skeleton chips render. Re-evaluations keep the previous results visible.
  const isInitialLoad = computed(() => isLoading.value && isPending.value)

  const elapsedSeconds = ref(0)
  let interval: ReturnType<typeof setInterval> | null = null

  function stopTimer() {
    if (interval !== null) clearInterval(interval)
    interval = null
  }

  watch(
    isLoading,
    (loading) => {
      stopTimer()
      if (!loading) return
      elapsedSeconds.value = 0
      interval = setInterval(() => elapsedSeconds.value++, 1000)
    },
    { immediate: true },
  )

  onUnmounted(stopTimer)

  return { statusStrip, isInitialLoad, elapsedSeconds }
}
