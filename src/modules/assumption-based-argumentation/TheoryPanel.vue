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
  ChevronDownIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ABAF, NodeId } from '@/modules/assumption-based-argumentation/model'
import RuleBuilder from '@/modules/assumption-based-argumentation/RuleBuilder.vue'
import StatementGlyph from '@/modules/assumption-based-argumentation/StatementGlyph.vue'
import { getNextName } from '@/modules/common/nextName'
import { useNotifications } from '@/modules/common/notifications/useNotifications'
import TermDefinitionBlock from '@/modules/common/tooltip/TermDefinitionBlock.vue'
import TermTooltip from '@/modules/common/tooltip/TermTooltip.vue'

const { aba, compact = false } = defineProps<{
  aba: ABAF
  // Fills its container (bottom sheet) instead of rendering as a floating card.
  compact?: boolean
}>()

// Desktop only: folds the card down to its header.
const collapsed = defineModel<boolean>('collapsed', { default: false })

const emit = defineEmits<{
  edit: [recipe: (draft: ABAF) => void]
}>()

const { t } = useI18n({ useScope: 'global' })
const { addErrorNotification } = useNotifications()

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
const assumptionRows = computed(() => statements.value.filter((s) => s.kind === 'assumption'))
const atomRows = computed(() => statements.value.filter((s) => s.kind === 'atom'))

// Atom chip inputs grow with their (monospace) text while typing.
function fitToText(e: Event) {
  const input = e.target as HTMLInputElement
  input.size = Math.max(input.value.length, 1)
}

// Facts are empty-body rules (`h ←`), so they belong in the Rules list. Fact rows carry the
// node id (facts are a node flag); ordinary rows carry the rule id.
type RuleRow = { key: string; headId: NodeId; head: string; body: string[] } & (
  | { fact: true; nodeId: NodeId }
  | { fact: false; ruleId: number }
)
const ruleRows = computed<RuleRow[]>(() => {
  const facts: RuleRow[] = [...aba.nodeEntries()]
    .filter(([, d]) => d.fact)
    .map(([id, d]) => ({
      key: 'f' + id,
      fact: true,
      nodeId: id,
      headId: id,
      head: d.name,
      body: [],
    }))
  const rules: RuleRow[] = aba.rules().map((r) => ({
    key: 'r' + r.id,
    fact: false,
    ruleId: r.id,
    headId: r.head,
    head: nodeName(r.head),
    body: r.body.map(nodeName),
  }))
  return [...facts, ...rules]
})

const lints = computed(() => {
  const out: string[] = []
  for (const a of aba.assumptions()) {
    const c = aba.getContrary(a)
    const name = nodeName(a)
    if (c === undefined) out.push(t('editor.aba.checks.noContrary', { name }))
    else if (c === a) out.push(t('editor.aba.checks.selfContrary', { name }))
    else if (isAssm(c))
      out.push(t('editor.aba.checks.contraryIsAssumption', { name, contrary: nodeName(c) }))
  }
  for (const r of aba.rules()) {
    if (r.body.includes(r.head))
      out.push(t('editor.aba.checks.tautologicalRule', { head: nodeName(r.head) }))
  }
  for (const [id, d] of aba.nodeEntries()) {
    if (d.kind !== 'atom' || d.fact) continue
    const derived = aba.rules().some((r) => r.head === id)
    const used =
      aba.rules().some((r) => r.body.includes(id)) || aba.contraries().some(([, t]) => t === id)
    if (!derived && used) out.push(t('editor.aba.checks.underivable', { name: d.name }))
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
    addErrorNotification(t('editor.aba.theory.nameTaken', { name: val }))
    input.value = current
    return
  }
  emit('edit', (d) => d.setName(id, val))
}
function deleteRuleRow(r: RuleRow) {
  if (r.fact) emit('edit', (d) => d.setFact(r.nodeId, false))
  else emit('edit', (d) => d.deleteRule(r.ruleId))
}

// Body names typed in the builder that don't exist yet are created as atoms.
function resolveBody(d: ABAF, names: string[]): NodeId[] {
  const origin = spawnPosition()
  return names.map((name) => {
    const found = d.findByName(name)
    if (found !== undefined) return found
    const id = d.nextNodeId()
    d.addNode(id, { name, kind: 'atom', ...origin, fact: false })
    return id
  })
}
function addRule(head: NodeId, names: string[]) {
  emit('edit', (d) => {
    if (!names.length) d.setFact(head, true)
    else d.addRule(head, resolveBody(d, names))
  })
}

// Key of the rule row currently swapped for an inline builder.
const editingRule = ref<string | null>(null)
function saveRule(r: RuleRow, head: NodeId, names: string[]) {
  editingRule.value = null
  emit('edit', (d) => {
    const body = resolveBody(d, names)
    if (!r.fact && body.length) {
      d.updateRule(r.ruleId, head, body)
      return
    }
    if (r.fact) d.setFact(r.nodeId, false)
    else d.deleteRule(r.ruleId)
    if (body.length) d.addRule(head, body)
    else d.setFact(head, true)
  })
}
</script>

<template>
  <aside
    class="flex flex-col text-sm"
    :class="
      compact
        ? 'w-full'
        : [
            'w-88 max-h-full overflow-hidden rounded-box bg-base-100 border border-base-300 shadow-lg/30',
            { 'self-start': collapsed },
          ]
    "
  >
    <header
      v-if="!compact"
      class="flex items-center gap-2 py-1.5 pl-3 pr-2 bg-base-200"
      :class="{ 'border-b border-base-300': !collapsed }"
    >
      <span class="flex-1 truncate font-medium">{{ t('editor.aba.theory.title') }}</span>
      <span class="flex items-center gap-1.5 text-xs text-base-content/70">
        <span class="size-1.5 rounded-full" :class="isFlat ? 'bg-success' : 'bg-warning'"></span>
        <TermTooltip id="abaFlat">{{
          isFlat ? t('editor.aba.theory.flat') : t('editor.aba.theory.nonFlat')
        }}</TermTooltip>
      </span>
      <button
        type="button"
        class="btn btn-ghost btn-xs btn-square"
        :title="collapsed ? t('editor.aba.theory.expand') : t('editor.aba.theory.collapse')"
        :aria-expanded="!collapsed"
        @click="collapsed = !collapsed"
      >
        <ChevronDownIcon
          class="size-4 transition-transform"
          :class="{ 'rotate-180': !collapsed }"
        />
      </button>
    </header>

    <div
      v-show="compact || !collapsed"
      class="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 [&>section+section]:border-t [&>section+section]:border-base-300 [&>section+section]:pt-3"
      :class="{ 'p-3': !compact }"
    >
      <!-- TermDefinitionBlock draws its own inset card in the compact layout. -->
      <div
        :class="{ 'rounded-field bg-inset border border-base-300 px-2.5 pb-2 pt-0.5': !compact }"
      >
        <TermDefinitionBlock id="ABAF" />
      </div>

      <section class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <h3 class="section-label flex-1">{{ t('editor.aba.theory.assumptions') }}</h3>
          <button
            type="button"
            class="btn btn-ghost btn-xs btn-square"
            :title="t('editor.aba.theory.addAssumption')"
            @click="addAssumption"
          >
            <PlusIcon class="size-4" />
          </button>
        </div>
        <ul v-if="assumptionRows.length" class="flex flex-col">
          <li
            v-for="s in assumptionRows"
            :key="s.id"
            class="group assm-grid rounded-field hover:bg-base-200"
          >
            <button
              type="button"
              class="btn btn-ghost btn-xs btn-square"
              :title="t('editor.aba.theory.makeAtom')"
              @click="toggleKind(s.id)"
            >
              <StatementGlyph kind="assumption" />
            </button>
            <input
              class="input input-xs input-ghost min-w-0 w-full font-(family-name:--font-graph)"
              type="text"
              :value="s.name"
              :title="s.name"
              :aria-label="t('editor.aba.theory.nameOf', { name: s.name })"
              @change="onRename(s.id, $event)"
            />
            <svg class="contrary-mark" viewBox="0 0 20 10" aria-hidden="true">
              <line x1="18" y1="1" x2="18" y2="9" />
              <line x1="1" y1="5" x2="18" y2="5" stroke-dasharray="3 2.5" />
            </svg>
            <select
              class="select select-xs select-ghost min-w-0 w-full font-(family-name:--font-graph)"
              :class="{ 'text-warning': s.contrary === undefined }"
              :value="s.contrary ?? ''"
              :title="s.contrary !== undefined ? nodeName(s.contrary) : undefined"
              :aria-label="t('editor.aba.theory.contraryOf', { name: s.name })"
              @change="onContraryChange(s.id, $event)"
            >
              <option value="" disabled>{{ t('editor.aba.theory.chooseContrary') }}</option>
              <template v-for="o in statements" :key="o.id">
                <option v-if="o.id !== s.id" :value="o.id">{{ o.name }}</option>
              </template>
            </select>
            <button
              type="button"
              class="btn btn-ghost btn-xs btn-square opacity-60 hover:opacity-100 hover:text-error"
              :class="{
                'lg:opacity-0 lg:group-hover:opacity-60 lg:group-focus-within:opacity-60': !compact,
              }"
              :title="t('editor.aba.theory.delete', { name: s.name })"
              @click="delNode(s.id)"
            >
              <XMarkIcon class="size-3.5" />
            </button>
          </li>
        </ul>
        <p v-else class="text-xs italic text-base-content/60">
          {{ t('editor.aba.theory.noAssumptions') }}
        </p>
      </section>

      <section class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <h3 class="section-label flex-1">{{ t('editor.aba.theory.atoms') }}</h3>
          <button
            type="button"
            class="btn btn-ghost btn-xs btn-square"
            :title="t('editor.aba.theory.addAtom')"
            @click="addAtom"
          >
            <PlusIcon class="size-4" />
          </button>
        </div>
        <ul v-if="atomRows.length" class="flex flex-wrap gap-1">
          <li
            v-for="s in atomRows"
            :key="s.id"
            class="group relative flex max-w-full items-center rounded-field border border-base-300 bg-base-100 hover:bg-base-200"
          >
            <button
              type="button"
              class="btn btn-ghost btn-xs btn-square"
              :title="t('editor.aba.theory.makeAssumption')"
              @click="toggleKind(s.id)"
            >
              <StatementGlyph kind="atom" />
            </button>
            <input
              class="input input-xs input-ghost w-auto min-w-0 px-1 font-(family-name:--font-graph)"
              type="text"
              :value="s.name"
              :size="Math.max(s.name.length, 1)"
              :title="s.name"
              :aria-label="t('editor.aba.theory.nameOf', { name: s.name })"
              @input="fitToText"
              @change="(onRename(s.id, $event), fitToText($event))"
            />
            <button
              type="button"
              class="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-error"
              :class="
                compact
                  ? '-ml-0.5'
                  : 'lg:invisible lg:group-hover:visible lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:bg-base-200'
              "
              :title="t('editor.aba.theory.delete', { name: s.name })"
              @click="delNode(s.id)"
            >
              <XMarkIcon class="size-3.5" />
            </button>
          </li>
        </ul>
        <p v-else class="text-xs italic text-base-content/60">
          {{ t('editor.aba.theory.noAtoms') }}
        </p>
      </section>

      <section class="flex flex-col gap-1.5">
        <h3 class="section-label">{{ t('editor.aba.theory.rules') }}</h3>
        <ul v-if="ruleRows.length" class="flex flex-col gap-0.5">
          <li v-for="r in ruleRows" :key="r.key">
            <RuleBuilder
              v-if="editingRule === r.key"
              editing
              :statements="statements"
              :head="r.headId"
              :body="r.body"
              @commit="(head, body) => saveRule(r, head, body)"
              @cancel="editingRule = null"
            />
            <div
              v-else
              class="group flex items-start gap-1 rounded-field py-0.5 pl-2 pr-1 hover:bg-base-200"
            >
              <button
                type="button"
                class="flex-1 min-w-0 py-0.5 text-left font-(family-name:--font-graph) text-[0.6875rem] [overflow-wrap:anywhere] cursor-pointer"
                :title="t('editor.aba.theory.editRule')"
                @click="editingRule = r.key"
              >
                {{ r.head }} <span class="text-base-content/40">←</span>
                <span class="text-base-content/85">{{ r.fact ? '⊤' : r.body.join(', ') }}</span>
              </button>
              <button
                type="button"
                class="btn btn-ghost btn-xs btn-square opacity-60 hover:opacity-100"
                :class="{ 'lg:opacity-0 lg:group-hover:opacity-60': !compact }"
                :title="t('editor.aba.theory.editRule')"
                @click="editingRule = r.key"
              >
                <PencilIcon class="size-3.5" />
              </button>
              <button
                type="button"
                class="btn btn-ghost btn-xs btn-square opacity-60 hover:opacity-100 hover:text-error"
                :class="{ 'lg:opacity-0 lg:group-hover:opacity-60': !compact }"
                :title="
                  r.fact ? t('editor.aba.theory.deleteFact') : t('editor.aba.theory.deleteRule')
                "
                @click="deleteRuleRow(r)"
              >
                <XMarkIcon class="size-3.5" />
              </button>
            </div>
          </li>
        </ul>
        <p v-else class="text-xs italic text-base-content/60">
          {{ t('editor.aba.theory.noRules') }}
        </p>

        <RuleBuilder v-if="editingRule === null" :statements="statements" @commit="addRule" />
      </section>

      <section class="flex flex-col gap-1.5">
        <h3 class="section-label">{{ t('editor.aba.checks.title') }}</h3>
        <p v-if="!lints.length" class="flex items-center gap-2 text-xs text-success">
          <CheckCircleIcon class="size-4 shrink-0" /> {{ t('editor.aba.checks.ok') }}
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
/* Keeps the name and contrary columns aligned across assumption rows. */
.assm-grid {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 0.25rem;
}
/* The graph's contrary link (dashed, bar head), pointing at the contrary so it can't read as ⊢. */
.contrary-mark {
  width: 20px;
  height: 10px;
  stroke: var(--color-error);
  stroke-width: 1.5;
}
</style>
