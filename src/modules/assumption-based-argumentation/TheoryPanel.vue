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
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { computed, ref, useTemplateRef } from 'vue'

import type { ABAF, NodeId } from '@/modules/assumption-based-argumentation/model'
import { getNextName } from '@/modules/common/nextName'
import { useNotifications } from '@/modules/common/notifications/useNotifications'

const { aba, compact = false } = defineProps<{
  aba: ABAF
  // Fills its container (bottom sheet) instead of rendering as a floating card.
  compact?: boolean
}>()

const emit = defineEmits<{
  edit: [recipe: (draft: ABAF) => void]
}>()

const { addErrorNotification } = useNotifications()

// TODO: source this from the module glossary once ABA has a glossary registry. Hardcoded for now.
const ABA_DEFINITION =
  'An ABA framework is a tuple (L, R, A, ‾): a language L, inference rules R, assumptions A ⊆ L, ' +
  'and a contrary map ‾ from each assumption to a sentence. An assumption is attacked when its ' +
  'contrary is derived; the theory is flat when no assumption heads a rule.'

function nodeName(id: NodeId): string {
  return aba.hasNode(id) ? aba.getNode(id).name : '?'
}
function isAssm(id: NodeId): boolean {
  return aba.hasNode(id) && aba.getNode(id).kind === 'assumption'
}
function usedNames(): string[] {
  return [...aba.nodeEntries()].map(([, d]) => d.name)
}

const isFlat = computed(() => aba.isFlat())

// Grouped by kind (assumptions first, then atoms); insertion order kept within each group.
const kindOrder = { assumption: 0, atom: 1 } as const
const statements = computed(() =>
  [...aba.nodeEntries()]
    .map(([id, d]) => ({
      id,
      name: d.name,
      kind: d.kind,
      contrary: d.kind === 'assumption' ? aba.getContrary(id) : undefined,
    }))
    .sort((a, b) => kindOrder[a.kind] - kindOrder[b.kind]),
)

// Facts are empty-body rules (`h ←`), so they belong in the Rules list. Fact rows carry the
// node id (facts are a node flag); ordinary rows carry the rule id.
type RuleRow =
  | { key: string; fact: true; nodeId: NodeId; head: string; body: string }
  | { key: string; fact: false; ruleId: number; head: string; body: string }
const ruleRows = computed<RuleRow[]>(() => {
  const facts: RuleRow[] = [...aba.nodeEntries()]
    .filter(([, d]) => d.fact)
    .map(([id, d]) => ({ key: 'f' + id, fact: true, nodeId: id, head: d.name, body: '⊤' }))
  const rules: RuleRow[] = aba.rules().map((r) => ({
    key: 'r' + r.id,
    fact: false,
    ruleId: r.id,
    head: nodeName(r.head),
    body: r.body.map(nodeName).join(', '),
  }))
  return [...facts, ...rules]
})

const lints = computed(() => {
  const out: string[] = []
  for (const a of aba.assumptions()) {
    const c = aba.getContrary(a)
    if (c === undefined) out.push(`assumption “${nodeName(a)}” has no contrary`)
    else if (c === a) out.push(`“${nodeName(a)}” is its own contrary → self-attacker`)
    else if (isAssm(c)) out.push(`contrary of “${nodeName(a)}” is an assumption (“${nodeName(c)}”)`)
  }
  for (const r of aba.rules()) {
    if (r.body.includes(r.head))
      out.push(`tautological rule ${nodeName(r.head)} ← …, ${nodeName(r.head)}`)
  }
  for (const [id, d] of aba.nodeEntries()) {
    if (d.kind !== 'atom' || d.fact) continue
    const derived = aba.rules().some((r) => r.head === id)
    const used =
      aba.rules().some((r) => r.body.includes(id)) || aba.contraries().some(([, t]) => t === id)
    if (!derived && used) out.push(`atom “${d.name}” is used but never derivable (no rule/fact)`)
  }
  return out
})

// New statements land near the existing ones rather than at a fixed spot.
function spawnPosition(): { x: number; y: number } {
  let x = 0
  let y = 0
  let n = 0
  for (const [, d] of aba.nodeEntries()) {
    x += d.x
    y += d.y
    n++
  }
  const jitter = () => (Math.random() - 0.5) * 160
  return n ? { x: x / n + jitter(), y: y / n + jitter() } : { x: jitter(), y: jitter() }
}
function genName(): string {
  return getNextName(usedNames()) || 's' + aba.nextNodeId()
}

function addAtom() {
  const { x, y } = spawnPosition()
  const name = genName()
  emit('edit', (d) => d.addNode(d.nextNodeId(), { name, kind: 'atom', x, y, fact: false }))
}
function addAssumption() {
  const { x, y } = spawnPosition()
  const name = genName()
  emit('edit', (d) => {
    const id = d.nextNodeId()
    d.addNode(id, { name, kind: 'atom', x, y, fact: false })
    d.promoteToAssumption(id)
  })
}
function toggleKind(id: NodeId) {
  if (isAssm(id)) emit('edit', (d) => d.setKind(id, 'atom'))
  else emit('edit', (d) => d.promoteToAssumption(id))
}
function delNode(id: NodeId) {
  emit('edit', (d) => d.deleteNode(id))
}
// In ABA the contrary is a total map, so it can be reassigned but not cleared — the placeholder
// is disabled and only real targets are selectable.
function onContraryChange(assm: NodeId, e: Event) {
  const v = (e.target as HTMLSelectElement).value
  if (v === '') return
  const target = Number(v)
  emit('edit', (d) => d.setContrary(assm, target))
}
function onRename(id: NodeId, e: Event) {
  const input = e.target as HTMLInputElement
  const val = input.value.trim()
  const current = nodeName(id)
  if (!val || val === current) {
    input.value = current
    return
  }
  if (usedNames().includes(val)) {
    addErrorNotification(`Name “${val}” is already used`)
    input.value = current
    return
  }
  emit('edit', (d) => d.setName(id, val))
}
function deleteRuleRow(r: RuleRow) {
  if (r.fact) emit('edit', (d) => d.setFact(r.nodeId, false))
  else emit('edit', (d) => d.deleteRule(r.ruleId))
}

// --- rule builder: a head select plus a body token field. Typed names become removable pills,
// and body chips drop into the same field. Unknown names are created as atoms; empty body = fact.
const newHead = ref<NodeId | null>(null)
const bodyTokens = ref<string[]>([])
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
function resetBuilder() {
  newHead.value = null
  bodyTokens.value = []
  bodyDraft.value = ''
}
function commitBuiltRule() {
  if (newHead.value === null) return
  const head = newHead.value
  const draft = bodyDraft.value.trim()
  const tokens = draft ? [...bodyTokens.value, draft] : [...bodyTokens.value]
  if (!tokens.length) {
    emit('edit', (d) => d.setFact(head, true))
    resetBuilder()
    return
  }
  const origin = spawnPosition()
  emit('edit', (d) => {
    const resolve = (name: string): NodeId => {
      const found = d.findByName(name)
      if (found !== undefined) return found
      const id = d.nextNodeId()
      d.addNode(id, { name, kind: 'atom', ...origin, fact: false })
      return id
    }
    d.addRule(head, tokens.map(resolve))
  })
  resetBuilder()
}
</script>

<template>
  <aside
    class="flex flex-col text-sm"
    :class="
      compact
        ? 'w-full'
        : 'w-80 max-h-full overflow-hidden rounded-box bg-base-100 border border-base-300 shadow-lg/30'
    "
  >
    <header
      v-if="!compact"
      class="flex items-center gap-2 py-1.5 pl-3 pr-2 bg-base-200 border-b border-base-300"
    >
      <span class="flex-1 truncate font-medium">Theory</span>
      <span class="flex items-center gap-1.5 text-xs text-base-content/70">
        <span class="size-1.5 rounded-full" :class="isFlat ? 'bg-success' : 'bg-warning'"></span>
        {{ isFlat ? 'flat' : 'non-flat' }}
      </span>
    </header>

    <div class="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4" :class="{ 'p-3': !compact }">
      <p
        class="rounded-field bg-inset border border-base-300 p-2.5 text-xs leading-relaxed text-base-content/70"
      >
        {{ ABA_DEFINITION }}
      </p>

      <section class="flex flex-col gap-1.5">
        <h3 class="section-label">Statements</h3>
        <ul v-if="statements.length" class="grid grid-cols-2 gap-1">
          <li
            v-for="s in statements"
            :key="s.id"
            class="group flex flex-col gap-1 rounded-field p-1 hover:bg-base-200"
          >
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                class="btn btn-ghost btn-xs btn-square shrink-0"
                :title="s.kind === 'assumption' ? 'Make atom' : 'Make assumption'"
                @click="toggleKind(s.id)"
              >
                <span
                  class="glyph"
                  :class="s.kind === 'assumption' ? 'glyph-assm' : 'glyph-atom'"
                />
              </button>
              <input
                class="input input-xs min-w-0 flex-1 font-mono"
                type="text"
                :value="s.name"
                :aria-label="`Name of ${s.name}`"
                @change="onRename(s.id, $event)"
              />
              <button
                type="button"
                class="btn btn-ghost btn-xs btn-square shrink-0 opacity-60 hover:opacity-100 hover:text-error"
                :class="{
                  'lg:opacity-0 lg:group-hover:opacity-60 lg:group-focus-within:opacity-60':
                    !compact,
                }"
                :title="`Delete ${s.name}`"
                @click="delNode(s.id)"
              >
                <XMarkIcon class="size-3.5" />
              </button>
            </div>
            <label
              v-if="s.kind === 'assumption'"
              class="flex items-center gap-1 pl-7 font-mono text-xs"
            >
              <span class="overline text-base-content/70">{{ s.name }}</span>
              <span class="text-base-content/40">=</span>
              <select
                class="select select-xs min-w-0 flex-1 font-mono"
                :class="{ 'text-warning': s.contrary === undefined }"
                :value="s.contrary ?? ''"
                :aria-label="`Contrary of ${s.name}`"
                @change="onContraryChange(s.id, $event)"
              >
                <option value="" disabled>choose…</option>
                <template v-for="o in statements" :key="o.id">
                  <option v-if="o.id !== s.id" :value="o.id">{{ o.name }}</option>
                </template>
              </select>
            </label>
          </li>
        </ul>
        <p v-else class="text-xs italic text-base-content/60">No statements yet.</p>
        <div class="grid grid-cols-2 gap-1.5">
          <button class="btn btn-sm" type="button" @click="addAtom">
            <span class="glyph glyph-atom" /> Atom
          </button>
          <button class="btn btn-sm" type="button" @click="addAssumption">
            <span class="glyph glyph-assm" /> Assumption
          </button>
        </div>
      </section>

      <section class="flex flex-col gap-1.5">
        <h3 class="section-label">Rules</h3>
        <ul v-if="ruleRows.length" class="flex flex-col gap-0.5">
          <li
            v-for="r in ruleRows"
            :key="r.key"
            class="group flex items-center gap-2 rounded-field py-0.5 pl-2 pr-1 hover:bg-base-200"
          >
            <span class="flex-1 min-w-0 truncate font-mono text-[0.8125rem]">
              {{ r.head }} ← {{ r.body }}
            </span>
            <span v-if="r.fact" class="badge badge-xs badge-outline badge-primary">fact</span>
            <button
              type="button"
              class="btn btn-ghost btn-xs btn-square opacity-60 hover:opacity-100 hover:text-error"
              :class="{ 'lg:opacity-0 lg:group-hover:opacity-60': !compact }"
              :title="r.fact ? 'Delete fact' : 'Delete rule'"
              @click="deleteRuleRow(r)"
            >
              <XMarkIcon class="size-3.5" />
            </button>
          </li>
        </ul>
        <p v-else class="text-xs italic text-base-content/60">No rules yet.</p>

        <div class="rounded-field bg-inset border border-base-300 p-2.5 flex flex-col gap-2">
          <div class="flex items-center gap-1.5">
            <select
              v-model="newHead"
              class="select select-xs w-20 shrink-0 font-mono"
              aria-label="Rule head"
            >
              <option :value="null" disabled>head…</option>
              <option v-for="s in statements" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
            <span class="font-mono text-base-content/60">←</span>
            <div
              class="input input-xs h-auto min-h-6 min-w-0 flex-1 flex-wrap gap-1 py-0.5 cursor-text"
              @click="bodyInput?.focus()"
            >
              <span
                v-for="t in bodyTokens"
                :key="t"
                class="badge badge-xs badge-primary badge-soft gap-0.5 font-mono"
              >
                {{ t }}
                <button type="button" :aria-label="`Remove ${t}`" @click.stop="removeBodyToken(t)">
                  <XMarkIcon class="size-3" />
                </button>
              </span>
              <input
                ref="bodyInput"
                v-model="bodyDraft"
                class="min-w-10 flex-1 font-mono"
                type="text"
                aria-label="Rule body"
                :placeholder="bodyTokens.length ? '' : 'body…'"
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
              class="badge badge-sm cursor-pointer font-mono"
              :class="bodyTokens.includes(s.name) ? 'badge-primary badge-soft' : 'badge-ghost'"
              :aria-pressed="bodyTokens.includes(s.name)"
              @click="toggleBodyMember(s.name)"
            >
              {{ s.name }}
            </button>
          </div>
          <button
            class="btn btn-sm btn-primary"
            type="button"
            :disabled="newHead === null"
            @click="commitBuiltRule"
          >
            <PlusIcon class="size-4" /> {{ hasBody ? 'Add rule' : 'Add fact' }}
          </button>
        </div>
      </section>

      <section class="flex flex-col gap-1.5">
        <h3 class="section-label">Checks</h3>
        <p v-if="!lints.length" class="flex items-center gap-2 text-xs text-success">
          <CheckCircleIcon class="size-4 shrink-0" /> No warnings — well-formed theory.
        </p>
        <ul v-else class="flex flex-col gap-1">
          <li v-for="(m, i) in lints" :key="i" class="flex items-start gap-2 text-xs">
            <ExclamationTriangleIcon class="size-4 shrink-0 text-warning" /> {{ m }}
          </li>
        </ul>
      </section>
    </div>
  </aside>
</template>

<style scoped>
.section-label {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  opacity: 0.6;
}
/* Mini node shapes in the graph's own node colors, so the list reads like the canvas. */
.glyph {
  flex: none;
  width: 11px;
  height: 11px;
  border: 1.5px solid var(--graph-node-stroke-color, var(--color-primary));
  background: var(--graph-node-color, var(--color-base-200));
}
.glyph-assm {
  border-radius: 50%;
}
.glyph-atom {
  border-radius: 2px;
  transform: rotate(45deg) scale(0.85);
}
</style>
