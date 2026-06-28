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
import { useStorage } from '@vueuse/core'
import { createSharedComposable } from '@vueuse/shared'
import { computed, type InjectionKey, ref } from 'vue'

import type { Tutorial, TutorialContext } from '@/modules/common/tutorial/types'

/**
 * Each GraphEditor instance provides its own unique ID under this key so that
 * TutorialOverlay and WindowTutorials in the same tab can identify themselves
 * as belonging to the same editor, and overlays in other tabs can stay silent.
 */
export const TUTORIAL_INSTANCE_KEY: InjectionKey<string> = Symbol('tutorialInstance')

export const useTutorial = createSharedComposable(() => {
  const completedTutorials = useStorage<string[]>('tutorial:completed', [])
  const autoStartedTutorials = useStorage<string[]>('tutorial:autoStarted', [])

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

  function startTutorial(tutorial: Tutorial, ctx?: TutorialContext, ownerId?: string): void {
    activeTutorial.value = tutorial
    activeStepIndex.value = 0
    baselineContext.value = ctx ?? null
    if (ownerId !== undefined) activeOwnerId.value = ownerId
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
    isTutorialDone,
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
    resetAllTutorials,
  }
})
