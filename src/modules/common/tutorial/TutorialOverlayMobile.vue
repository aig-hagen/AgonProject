<!--
  AgonProject - The platform to explore different approaches to formal argumentation.

  Copyright (C) 2026  Artificial Intelligence Group at the Faculty of Mathematics and Computer Science of the FernUniversität in Hagen <https://www.fernuni-hagen.de/aig/en/>

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->
<script setup lang="ts">
import { useElementBounding } from '@vueuse/core'
import { computed, inject, nextTick, onMounted, onUnmounted, watchEffect } from 'vue'

import TermTooltip from '@/modules/common/tooltip/TermTooltip.vue'
import type { Tutorial, TutorialBodyPart, TutorialContext } from '@/modules/common/tutorial/types'
import { TUTORIAL_INSTANCE_KEY, useTutorial } from '@/modules/common/tutorial/useTutorial'

const { tutorials, defaultTutorialId, refs, context, isTouchDevice } = defineProps<{
  tutorials: Tutorial[]
  defaultTutorialId?: string
  refs: Record<string, HTMLElement | null>
  context: TutorialContext
  isTouchDevice: boolean
}>()

const {
  autoStartedTutorials,
  isTutorialDone,
  currentStep,
  stepCount,
  activeStepIndex,
  activeOwnerId,
  baselineContext,
  isActive,
  isLastStep,
  startTutorial,
  nextStep,
  prevStep,
  skipTutorial,
  completeTutorial,
} = useTutorial()

const instanceId = inject(TUTORIAL_INSTANCE_KEY, '')

// This overlay only renders if no other tab owns the active tutorial.
const isOwner = computed(() => !isActive.value || activeOwnerId.value === instanceId)

onMounted(() => {
  if (
    defaultTutorialId &&
    !autoStartedTutorials.value.includes(defaultTutorialId) &&
    !isTutorialDone(defaultTutorialId)
  ) {
    const tutorial = tutorials.find((t) => t.id === defaultTutorialId)
    if (tutorial) {
      nextTick(() => {
        autoStartedTutorials.value = [...autoStartedTutorials.value, defaultTutorialId]
        startTutorial(tutorial, context, instanceId)
      })
    }
  }
})

onUnmounted(() => {
  if (activeOwnerId.value === instanceId) {
    skipTutorial()
  }
})

watchEffect(() => {
  if (!isOwner.value || !isActive.value || !currentStep.value) return
  if (resolvedAdvanceOn.value !== 'action') return
  if (!currentStep.value.advanceCondition) return
  if (!baselineContext.value) return
  if (currentStep.value.advanceCondition(context, baselineContext.value)) {
    nextStep(context)
  }
})

const resolvedAdvanceOn = computed<'button' | 'action'>(() => {
  const a = currentStep.value?.advanceOn
  if (!a) return 'button'
  return typeof a === 'function' ? a(isTouchDevice) : a
})

const bodyParts = computed<TutorialBodyPart[]>(() => {
  if (!currentStep.value) return []
  const body = currentStep.value.body
  const resolved = typeof body === 'function' ? body(isTouchDevice) : body
  return typeof resolved === 'string' ? [resolved] : resolved
})

const nextTutorial = computed(() => {
  if (!currentStep.value?.nextTutorialId) return null
  return tutorials.find((t) => t.id === currentStep.value!.nextTutorialId) ?? null
})

// Spotlight: a ring drawn over the step's anchored control, when it resolves to a mounted
// element. Unlike desktop, the card itself stays docked; only the target is highlighted.
const anchorRef = computed<HTMLElement | null>(() => {
  if (!currentStep.value?.anchor) return null
  return refs[currentStep.value.anchor] ?? null
})
const { x, y, width, height } = useElementBounding(anchorRef)
const hasSpotlight = computed(() => anchorRef.value !== null && width.value > 0)
const spotlightStyle = computed(() => ({
  left: `${x.value - 6}px`,
  top: `${y.value - 6}px`,
  width: `${width.value + 12}px`,
  height: `${height.value + 12}px`,
}))

function handleNext() {
  nextStep(context)
}
function handlePrev() {
  prevStep(context)
}
function handleDone() {
  completeTutorial()
}
function handleStartNext() {
  const next = nextTutorial.value
  if (!next) return
  completeTutorial()
  startTutorial(next, context, instanceId)
}
</script>

<template>
  <template v-if="isOwner && isActive && currentStep">
    <!-- Spotlight ring over the anchored target (fixed to the viewport rect). -->
    <div
      v-if="hasSpotlight"
      class="fixed z-30 pointer-events-none rounded-2xl ring-4 ring-primary/40 shadow-[0_0_0_9999px_rgba(0,0,0,0.04)] transition-all"
      :style="spotlightStyle"
    ></div>

    <!-- Docked card below the top bar; the canvas stays live underneath. -->
    <div
      class="absolute inset-x-2 z-30 pointer-events-auto"
      style="top: calc(env(safe-area-inset-top) + 3.75rem)"
    >
      <div
        class="rounded-2xl bg-base-100 border border-primary/20 shadow-xl shadow-primary/10 p-3.5"
      >
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-semibold text-base-content/60 shrink-0">
            Step {{ activeStepIndex + 1 }} of {{ stepCount }}
          </span>
          <progress
            class="progress progress-primary flex-1 h-1.5"
            :value="activeStepIndex + 1"
            :max="stepCount"
          ></progress>
          <button
            class="btn btn-ghost btn-xs btn-square"
            aria-label="Skip tutorial"
            @click="skipTutorial"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="size-4"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <h3 class="text-[15px] font-semibold mb-1">{{ currentStep.title }}</h3>
        <div class="text-[13px] text-base-content/80 leading-relaxed">
          <template v-for="(part, i) in bodyParts" :key="i">
            <TermTooltip v-if="typeof part === 'object'" :id="part.tooltipId">{{
              part.text
            }}</TermTooltip>
            <span v-else class="contents" v-html="part"></span>
          </template>
        </div>
        <div class="flex items-center justify-between gap-2 mt-3">
          <button
            v-if="activeStepIndex > 0"
            class="btn btn-ghost btn-sm gap-1 text-base-content/70"
            @click="handlePrev"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="size-4"
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
            Back
          </button>
          <div v-else class="flex-0"></div>
          <div class="flex items-center gap-2">
            <template v-if="isLastStep">
              <button v-if="nextTutorial" class="btn btn-soft btn-sm" @click="handleStartNext">
                ▶ {{ nextTutorial.name }}
              </button>
              <button class="btn btn-primary btn-sm" @click="handleDone">Done</button>
            </template>
            <button
              v-else-if="resolvedAdvanceOn === 'button'"
              class="btn btn-primary btn-sm gap-1"
              @click="handleNext"
            >
              Next
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="size-4"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
            <span
              v-else
              class="flex items-center gap-2 text-[13px] font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full"
            >
              <span class="size-2 rounded-full bg-primary animate-pulse"></span>
              Waiting for you…
            </span>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>
