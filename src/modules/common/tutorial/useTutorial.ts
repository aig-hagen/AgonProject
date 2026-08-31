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
import { useMediaQuery, useStorage } from '@vueuse/core'
import { createSharedComposable } from '@vueuse/shared'
import { computed, type InjectionKey, ref } from 'vue'

import { trackEvent } from '@/app/usage/report'
import { ANALYTICS_EVENTS } from '@/app/usage/signals'
import { notifyStorageFailureOnce } from '@/modules/common/notifications/storageFailure'
import type { Tutorial, TutorialContext } from '@/modules/common/tutorial/types'

/**
 * Each GraphEditor instance provides its own unique ID under this key so that
 * TutorialOverlay and WindowTutorials in the same tab can identify themselves
 * as belonging to the same editor, and overlays in other tabs can stay silent.
 */
export const TUTORIAL_INSTANCE_KEY: InjectionKey<string> = Symbol('tutorialInstance')

export const useTutorial = createSharedComposable(() => {
  const completedTutorials = useStorage<string[]>('tutorial:completed', [], undefined, {
    onError: notifyStorageFailureOnce,
  })
  const autoStartedTutorials = useStorage<string[]>('tutorial:autoStarted', [], undefined, {
    onError: notifyStorageFailureOnce,
  })
  const isTouchDevice = useMediaQuery('(pointer: coarse)')

  const activeTutorial = ref<Tutorial | null>(null)
  const activeStepIndex = ref(0)
  const baselineContext = ref<TutorialContext | null>(null)
  /** ID of the GraphEditor instance that currently owns the active tutorial. */
  const activeOwnerId = ref<string | null>(null)

  const currentStep = computed(() => {
    if (!activeTutorial.value) return null
    return activeTutorial.value.steps[activeStepIndex.value] ?? null
  })

  const stepCount = computed(() => activeTutorial.value?.steps.length ?? 0)
  const isActive = computed(() => activeTutorial.value !== null)
  const isLastStep = computed(() => activeStepIndex.value === stepCount.value - 1)

  function isTutorialDone(id: string): boolean {
    return completedTutorials.value.includes(id)
  }

  /**
   * Filter out steps that don't apply to this run: `desktopOnly` steps on touch devices, and
   * `firstBasicOnly` steps once the user has completed any other basic (`*-basics`) tutorial —
   * the generic delete/undo teaching only needs to happen once.
   */
  function withGatedSteps(tutorial: Tutorial): Tutorial {
    const hasDoneBasics = completedTutorials.value.some(
      (id) => id.endsWith('-basics') && id !== tutorial.id,
    )
    const hasDoneEval = completedTutorials.value.some(
      (id) => id.endsWith('-evaluation') && id !== tutorial.id,
    )
    const steps = tutorial.steps.filter(
      (step) =>
        !(step.desktopOnly && isTouchDevice.value) &&
        !(step.firstBasicOnly && hasDoneBasics) &&
        !(step.firstEvalOnlyDesktop && !isTouchDevice.value && hasDoneEval) &&
        !(step.firstEvalOnly && hasDoneEval),
    )
    return steps.length === tutorial.steps.length ? tutorial : { ...tutorial, steps }
  }

  function startTutorial(tutorial: Tutorial, ctx?: TutorialContext, ownerId?: string): void {
    activeTutorial.value = withGatedSteps(tutorial)
    activeStepIndex.value = 0
    baselineContext.value = ctx ?? null
    if (ownerId !== undefined) activeOwnerId.value = ownerId
    trackEvent(ANALYTICS_EVENTS.tutorialStart, tutorial.id)
  }

  function nextStep(currentCtx: TutorialContext): void {
    if (!activeTutorial.value) return
    if (activeStepIndex.value >= stepCount.value - 1) {
      completeTutorial()
      return
    }
    activeStepIndex.value++
    baselineContext.value = { ...currentCtx }
  }

  function prevStep(currentCtx: TutorialContext): void {
    if (!activeTutorial.value || activeStepIndex.value === 0) return
    activeStepIndex.value--
    baselineContext.value = { ...currentCtx }
  }

  function skipTutorial(): void {
    activeTutorial.value = null
    activeStepIndex.value = 0
    baselineContext.value = null
    activeOwnerId.value = null
  }

  function completeTutorial(): void {
    if (!activeTutorial.value) return
    const id = activeTutorial.value.id
    trackEvent(ANALYTICS_EVENTS.tutorialComplete, id)
    if (!completedTutorials.value.includes(id)) {
      completedTutorials.value = [...completedTutorials.value, id]
    }
    activeTutorial.value = null
    activeStepIndex.value = 0
    baselineContext.value = null
    activeOwnerId.value = null
  }

  function resetAllTutorials(): void {
    completedTutorials.value = []
    autoStartedTutorials.value = []
  }

  return {
    completedTutorials,
    autoStartedTutorials,
    activeTutorial,
    activeStepIndex,
    baselineContext,
    activeOwnerId,
    currentStep,
    stepCount,
    isActive,
    isLastStep,
    isTouchDevice,
    isTutorialDone,
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
    resetAllTutorials,
  }
})
