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
import { PlusIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { computed, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import type { NodeId, NodeKind } from '@/modules/assumption-based-argumentation/model'
import StatementGlyph from '@/modules/assumption-based-argumentation/StatementGlyph.vue'

// A head select plus a body token field. Typed names become removable pills, and body chips drop
// into the same field. With `editing`, it is prefilled from an existing rule and offers save/cancel.
const {
  statements,
  head = null,
  body = [],
  editing = false,
} = defineProps<{
  statements: { id: NodeId; name: string; kind: NodeKind }[]
  head?: NodeId | null
  body?: string[]
  editing?: boolean
}>()

const emit = defineEmits<{
  commit: [head: NodeId, body: string[]]
  cancel: []
}>()

const { t } = useI18n({ useScope: 'global' })

const newHead = ref<NodeId | null>(head)
const bodyTokens = ref<string[]>([...body])
const bodyDraft = ref('')
const bodyInput = useTemplateRef<HTMLInputElement>('bodyInput')
const hasBody = computed(() => bodyTokens.value.length > 0 || bodyDraft.value.trim().length > 0)

function addBodyToken(name: string) {
  const n = name.trim()
  if (n && !bodyTokens.value.includes(n)) bodyTokens.value = [...bodyTokens.value, n]
}
function toggleBodyMember(name: string) {
  bodyTokens.value = bodyTokens.value.includes(name)
    ? bodyTokens.value.filter((t) => t !== name)
    : [...bodyTokens.value, name]
}
function removeBodyToken(name: string) {
  bodyTokens.value = bodyTokens.value.filter((t) => t !== name)
}
function commitDraftToken() {
  addBodyToken(bodyDraft.value)
  bodyDraft.value = ''
}
function onBodyKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
    if (bodyDraft.value.trim()) {
      e.preventDefault()
      commitDraftToken()
    }
  } else if (e.key === 'Backspace' && !bodyDraft.value && bodyTokens.value.length) {
    e.preventDefault()
    removeBodyToken(bodyTokens.value[bodyTokens.value.length - 1]!)
  }
}
function commit() {
  if (newHead.value === null) return
  const draft = bodyDraft.value.trim()
  emit('commit', newHead.value, draft ? [...bodyTokens.value, draft] : [...bodyTokens.value])
  newHead.value = null
  bodyTokens.value = []
  bodyDraft.value = ''
}
</script>

<template>
  <div
    class="rounded-field bg-inset border p-2.5 flex flex-col gap-2"
    :class="editing ? 'border-primary/60' : 'border-base-300'"
    @keydown.esc="editing && emit('cancel')"
  >
    <div class="flex items-center gap-1.5">
      <select
        v-model="newHead"
        class="select select-xs w-auto max-w-32 shrink-0 font-(family-name:--font-graph)"
        :aria-label="t('editor.aba.theory.ruleHead')"
      >
        <option :value="null" disabled>{{ t('editor.aba.theory.headPlaceholder') }}</option>
        <option v-for="s in statements" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
      <span class="font-(family-name:--font-graph) text-base-content/60">←</span>
      <div
        class="input input-xs h-auto min-h-6 min-w-0 flex-1 flex-wrap gap-1 py-0.5 cursor-text"
        @click="bodyInput?.focus()"
      >
        <span
          v-for="token in bodyTokens"
          :key="token"
          class="badge badge-xs badge-primary badge-soft gap-0.5 font-(family-name:--font-graph)"
        >
          {{ token }}
          <button
            type="button"
            :aria-label="t('editor.aba.theory.remove', { name: token })"
            @click.stop="removeBodyToken(token)"
          >
            <XMarkIcon class="size-3" />
          </button>
        </span>
        <input
          ref="bodyInput"
          v-model="bodyDraft"
          class="min-w-10 flex-1 font-(family-name:--font-graph)"
          type="text"
          :aria-label="t('editor.aba.theory.ruleBody')"
          :placeholder="bodyTokens.length ? '' : t('editor.aba.theory.bodyPlaceholder')"
          @keydown="onBodyKeydown"
          @blur="commitDraftToken"
        />
      </div>
    </div>
    <div v-if="statements.length" class="flex flex-wrap gap-1">
      <button
        v-for="s in statements"
        :key="s.id"
        type="button"
        class="badge badge-sm cursor-pointer gap-1.5 font-(family-name:--font-graph)"
        :class="bodyTokens.includes(s.name) ? 'badge-primary badge-soft' : 'badge-ghost'"
        :aria-pressed="bodyTokens.includes(s.name)"
        @click="toggleBodyMember(s.name)"
      >
        <StatementGlyph :kind="s.kind" />
        {{ s.name }}
      </button>
    </div>
    <div v-if="editing" class="grid grid-cols-2 gap-1.5">
      <button class="btn btn-sm btn-ghost" type="button" @click="emit('cancel')">
        {{ t('common.actions.cancel') }}
      </button>
      <button
        class="btn btn-sm btn-primary"
        type="button"
        :disabled="newHead === null"
        @click="commit"
      >
        {{ t('common.actions.save') }}
      </button>
    </div>
    <button
      v-else
      class="btn btn-sm btn-primary"
      type="button"
      :disabled="newHead === null"
      @click="commit"
    >
      <PlusIcon class="size-4" />
      {{ hasBody ? t('editor.aba.theory.addRule') : t('editor.aba.theory.addFact') }}
    </button>
  </div>
</template>
