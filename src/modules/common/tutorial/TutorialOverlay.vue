<!--
  Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.

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
import { autoUpdate, offset, useFloating } from '@floating-ui/vue'
import { computed, onMounted, useTemplateRef, watchEffect } from 'vue'

import type { Tutorial, TutorialContext } from '@/modules/common/tutorial/types'
import { useTutorial } from '@/modules/common/tutorial/useTutorial'

const {
  tutorials,
  defaultTutorialId,
  refs,
  context,
  isTouchDevice,
} = defineProps<{
  tutorials: Tutorial[]
  defaultTutorialId?: string
  refs: Record<string, HTMLElement | null>
  context: TutorialContext
  isTouchDevice: boolean
}>()

const {
  hasSeenWelcome,
  currentStep,
  stepCount,
  activeStepIndex,
  baselineContext,
  isActive,
  isLastStep,
  startTutorial,
  nextStep,
  prevStep,
  skipTutorial,
  completeTutorial,
} = useTutorial()

onMounted(() => {
  if (!hasSeenWelcome.value && defaultTutorialId) {
    const tutorial = tutorials.find((t) => t.id === defaultTutorialId)
    if (tutorial) {
      startTutorial(tutorial, context)
      hasSeenWelcome.value = true
    }
  }
})

watchEffect(() => {
  if (!isActive.value || !currentStep.value) return
  if (currentStep.value.advanceOn !== 'action') return
  if (!currentStep.value.advanceCondition) return
  if (!baselineContext.value) return
  if (currentStep.value.advanceCondition(context, baselineContext.value)) {
    nextStep(context)
  }
})

const anchorRef = computed<HTMLElement | null>(() => {
  if (!currentStep.value?.anchor) return null
  return refs[currentStep.value.anchor] ?? null
})

const isAnchored = computed(() => anchorRef.value !== null)

const stepBody = computed(() => {
  if (!currentStep.value) return ''
  const body = currentStep.value.body
  return typeof body === 'function' ? body(isTouchDevice) : body
})

const nextTutorial = computed(() => {
  if (!currentStep.value?.nextTutorialId) return null
  return tutorials.find((t) => t.id === currentStep.value!.nextTutorialId) ?? null
})

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
  startTutorial(next, context)
}

// Floating-ui setup for anchored steps
const floatingEl = useTemplateRef<HTMLElement>('floating')

const { floatingStyles } = useFloating(anchorRef, floatingEl, {
  placement: computed(() => currentStep.value?.placement ?? 'right-start'),
  middleware: computed(() => [offset(currentStep.value?.offsetPx ?? 64)]),
  whileElementsMounted: autoUpdate,
})
</script>

<template>
  <template v-if="isActive && currentStep">
    <!-- Anchored step: floats next to a UI element -->
    <div v-if="isAnchored" ref="floating" :style="floatingStyles" class="z-50 pointer-events-auto">
      <div class="card bg-base-100 shadow-xl w-72 border border-base-300">
        <div class="card-body p-4 gap-3">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs text-base-content/50 font-medium">
              {{ activeStepIndex + 1 }} / {{ stepCount }}
            </span>
            <progress
              class="progress progress-info flex-1"
              :value="activeStepIndex + 1"
              :max="stepCount"
            ></progress>
          </div>
          <h3 class="card-title text-sm">{{ currentStep.title }}</h3>
          <div class="text-sm text-base-content/80 leading-relaxed" v-html="stepBody"></div>
          <div class="flex items-center justify-between gap-2 pt-1">
            <button
              v-if="activeStepIndex > 0"
              class="btn btn-ghost btn-xs"
              @click="handlePrev"
            >← Back</button>
            <div v-else class="flex-0"></div>
            <div class="flex items-center gap-2">
              <button
                v-if="!isLastStep"
                class="btn btn-ghost btn-xs text-base-content/50"
                @click="skipTutorial"
              >Skip</button>
              <template v-if="isLastStep">
                <button v-if="nextTutorial" class="btn btn-info btn-xs" @click="handleStartNext">
                  ▶ {{ nextTutorial.name }}
                </button>
                <button class="btn btn-primary btn-xs" @click="handleDone">Done</button>
              </template>
              <button
                v-else-if="currentStep.advanceOn === 'button'"
                class="btn btn-primary btn-xs"
                @click="handleNext"
              >Next →</button>
              <span v-else class="text-xs text-base-content/40 italic">Waiting…</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Unanchored step: fixed to top-right of editor container -->
    <div
      v-else
      class="absolute top-4 right-4 z-50 pointer-events-auto"
    >
      <div class="card bg-base-100 shadow-xl w-80 border border-base-300">
        <div class="card-body p-4 gap-3">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs text-base-content/50 font-medium">
              {{ activeStepIndex + 1 }} / {{ stepCount }}
            </span>
            <progress
              class="progress progress-info flex-1"
              :value="activeStepIndex + 1"
              :max="stepCount"
            ></progress>
          </div>
          <h3 class="card-title text-sm">{{ currentStep.title }}</h3>
          <div class="text-sm text-base-content/80 leading-relaxed" v-html="stepBody"></div>
          <div class="flex items-center justify-between gap-2 pt-1">
            <button
              v-if="activeStepIndex > 0"
              class="btn btn-ghost btn-xs"
              @click="handlePrev"
            >← Back</button>
            <div v-else class="flex-0"></div>
            <div class="flex items-center gap-2">
              <button
                v-if="!isLastStep"
                class="btn btn-ghost btn-xs text-base-content/50"
                @click="skipTutorial"
              >Skip tutorial</button>
              <template v-if="isLastStep">
                <button v-if="nextTutorial" class="btn btn-info btn-xs" @click="handleStartNext">
                  ▶ {{ nextTutorial.name }}
                </button>
                <button class="btn btn-primary btn-xs" @click="handleDone">Done</button>
              </template>
              <button
                v-else-if="currentStep.advanceOn === 'button'"
                class="btn btn-primary btn-xs"
                @click="handleNext"
              >Next →</button>
              <span v-else class="text-xs text-base-content/40 italic">Waiting…</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>
