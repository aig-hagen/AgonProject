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
import { computed, onMounted, onUnmounted, ref, shallowRef, useTemplateRef, watch } from 'vue'

import { ABAF, type NodeId } from '@/modules/assumption-based-argumentation/model'
import type { HistoryState, SelectionAction } from '@/modules/common/graph-editor/graphEditor'
import SelectionActionBar from '@/modules/common/graph-editor/SelectionActionBar.vue'
import { type DocumentState, modifyDocument } from '@/modules/common/state'

const { state, historyState } = defineProps<{
  state: DocumentState<ABAF>
  historyState: HistoryState
  documentId: number
}>()

const emit = defineEmits<{
  load: []
  new: []
  change: [state: DocumentState<ABAF>]
  undo: []
  redo: []
  save: []
  share: []
}>()

// Node box half-dimensions used for edge clipping and handle placement.
const HW = 38
const HH = 28
// Assumption nodes are circles; this is their radius.
const AR = 24

// Atom nodes are rounded diamonds (a rhombus with vertices HW/HH out on each axis).
type Pt = [number, number]
function roundedDiamond(w: number, h: number, r: number): string {
  const V: Pt[] = [
    [0, -h],
    [w, 0],
    [0, h],
    [-w, 0],
  ]
  const along = (a: Pt, b: Pt): Pt => {
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const t = r / Math.hypot(dx, dy)
    return [a[0] + dx * t, a[1] + dy * t]
  }
  let d = ''
  for (let i = 0; i < 4; i++) {
    const cur = V[i]!
    const [bx, by] = along(cur, V[(i + 3) % 4]!)
    const [ax, ay] = along(cur, V[(i + 1) % 4]!)
    d += `${i === 0 ? 'M' : 'L'}${bx},${by} Q${cur[0]},${cur[1]} ${ax},${ay} `
  }
  return d + 'Z'
}
const ATOM_PATH = roundedDiamond(HW, HH, 12)

const renderedState = shallowRef(state)
watch(
  () => state,
  () => {
    if (state.stateId === renderedState.value.stateId) return
    renderedState.value = state
  },
)
const content = computed(() => renderedState.value.current.content)

function commit(recipe: (draft: ABAF) => void) {
  // Wrap so a model method's return value never leaks back to immer as a replacement state.
  const next = modifyDocument(renderedState.value, (draft) => {
    recipe(draft)
  })
  if (next !== undefined) {
    renderedState.value = next
    emit('change', next)
  }
}

// --- ephemeral UI state (not part of the document) ---
type Selection = { kind: 'node'; id: NodeId } | { kind: 'rule'; id: number } | null
const sel = ref<Selection>(null)
const showAtt = ref(true)
const dragging = ref<{ id: NodeId; x: number; y: number } | null>(null)
type Gesture =
  | { t: 'move'; id: NodeId; dx: number; dy: number }
  | { t: 'rule'; from: NodeId }
  | { t: 'ctr'; from: NodeId }
  | null
let gesture: Gesture = null
const templink = ref<{ x1: number; y1: number; x2: number; y2: number; ctr: boolean } | null>(null)
const toastMsg = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined
function toast(m: string) {
  toastMsg.value = m
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toastMsg.value = ''), 1900)
}

// --- helpers over the current theory ---
function pos(id: NodeId): { x: number; y: number } {
  const d = dragging.value
  if (d && d.id === id) return { x: d.x, y: d.y }
  const n = content.value.getNode(id)
  return { x: n.x, y: n.y }
}
function isAssm(id: NodeId): boolean {
  return content.value.hasNode(id) && content.value.getNode(id).kind === 'assumption'
}
function usedNames(): string[] {
  return [...content.value.nodeEntries()].map(([, d]) => d.name)
}
function genName(): string {
  const used = usedNames()
  let i = 0
  for (;;) {
    const n = i < 26 ? String.fromCharCode(97 + i) : 'a' + (i - 25)
    if (!used.includes(n)) return n
    i++
  }
}
function freshId(): NodeId {
  let max = -1
  for (const [id] of content.value.nodeEntries()) max = Math.max(max, id)
  return max + 1
}
function clip(
  cx: number,
  cy: number,
  px: number,
  py: number,
  assm = false,
): { x: number; y: number } {
  const dx = px - cx
  const dy = py - cy
  if (dx === 0 && dy === 0) return { x: cx, y: cy }
  if (assm) {
    const s = AR / Math.hypot(dx, dy)
    return { x: cx + dx * s, y: cy + dy * s }
  }
  // Atom diamond boundary: |x|/HW + |y|/HH = 1.
  const s = 1 / (Math.abs(dx) / HW + Math.abs(dy) / HH)
  return { x: cx + dx * s, y: cy + dy * s }
}
function hubPos(head: NodeId, body: NodeId[]): { x: number; y: number } {
  let x = 0
  let y = 0
  let c = 0
  for (const b of body) {
    if (content.value.hasNode(b)) {
      const p = pos(b)
      x += p.x
      y += p.y
      c++
    }
  }
  if (content.value.hasNode(head)) {
    const p = pos(head)
    x += p.x
    y += p.y
    c++
  }
  return c ? { x: x / c, y: y / c } : { x: 0, y: 0 }
}

// --- derived render data ---
const nodes = computed(() =>
  [...content.value.nodeEntries()].map(([id, d]) => {
    const p = pos(id)
    return {
      id,
      name: d.name,
      kind: d.kind,
      fact: d.fact,
      x: p.x,
      y: p.y,
      assm: d.kind === 'assumption',
      selected: sel.value?.kind === 'node' && sel.value.id === id,
    }
  }),
)

const ruleGeometry = computed(() => {
  const bodies: string[] = []
  const heads: string[] = []
  const hubs: { id: number; x: number; y: number; selected: boolean }[] = []
  for (const r of content.value.rules()) {
    if (!content.value.hasNode(r.head)) continue
    const h = hubPos(r.head, r.body)
    for (const b of r.body) {
      if (!content.value.hasNode(b)) continue
      const B = pos(b)
      const s = clip(B.x, B.y, h.x, h.y, isAssm(b))
      bodies.push(`M${s.x},${s.y} L${h.x},${h.y}`)
    }
    const H = pos(r.head)
    const e = clip(H.x, H.y, h.x, h.y, isAssm(r.head))
    heads.push(`M${h.x},${h.y} L${e.x},${e.y}`)
    hubs.push({
      id: r.id,
      x: h.x,
      y: h.y,
      selected: sel.value?.kind === 'rule' && sel.value.id === r.id,
    })
  }
  return { bodies, heads, hubs }
})

const contraryPaths = computed(() => {
  const out: string[] = []
  for (const [k, t] of content.value.contraries()) {
    if (!content.value.hasNode(k) || !content.value.hasNode(t)) continue
    const A = pos(k)
    if (t === k) {
      out.push(
        `M${A.x + AR - 4},${A.y - AR + 2} C${A.x + AR + 42},${A.y - AR - 26} ${A.x + AR + 42},${A.y + AR + 26} ${A.x + AR - 4},${A.y + AR - 2}`,
      )
    } else {
      const B = pos(t)
      const s = clip(A.x, A.y, B.x, B.y, true)
      const e = clip(B.x, B.y, A.x, A.y, isAssm(t))
      out.push(`M${s.x},${s.y} L${e.x},${e.y}`)
    }
  }
  return out
})

// Computed attacks: a rule deriving `~k` yields an attack from its hub onto assumption `k`.
const attackPaths = computed(() => {
  if (!showAtt.value) return []
  const out: string[] = []
  const contraries = content.value.contraries()
  for (const r of content.value.rules()) {
    if (!r.body.length || !content.value.hasNode(r.head)) continue
    const h = hubPos(r.head, r.body)
    for (const [k, t] of contraries) {
      if (t === r.head && content.value.hasNode(k)) {
        const T = pos(k)
        const e = clip(T.x, T.y, h.x, h.y, true)
        out.push(`M${h.x},${h.y} L${e.x},${e.y}`)
      }
    }
  }
  return out
})

const isFlat = computed(() => content.value.isFlat())

const lints = computed(() => {
  const aba = content.value
  const out: string[] = []
  for (const a of aba.assumptions()) {
    const c = aba.getContrary(a)
    if (c === a) out.push(`“${aba.getNode(a).name}” is its own contrary → self-attacker`)
    else if (c !== undefined && isAssm(c))
      out.push(`contrary of “${aba.getNode(a).name}” is an assumption (“${aba.getNode(c).name}”)`)
  }
  for (const [id, d] of aba.nodeEntries()) {
    if (!d.fact) continue
    for (const [k, t] of aba.contraries()) {
      if (t === id)
        out.push(
          `fact “${d.name}” = ¬${aba.getNode(k).name} → “${aba.getNode(k).name}” attacked unconditionally`,
        )
    }
  }
  for (const r of aba.rules()) {
    if (r.body.includes(r.head))
      out.push(`tautological rule ${aba.getNode(r.head).name} ← …, ${aba.getNode(r.head).name}`)
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

function nodeName(id: NodeId): string {
  return content.value.hasNode(id) ? content.value.getNode(id).name : '?'
}

// --- side-panel list data ---
const statements = computed(() =>
  [...content.value.nodeEntries()].map(([id, d]) => ({
    id,
    name: d.name,
    kind: d.kind,
    fact: d.fact,
    contrary: d.kind === 'assumption' ? content.value.getContrary(id) : undefined,
    selected: sel.value?.kind === 'node' && sel.value.id === id,
  })),
)
const ruleRows = computed(() =>
  content.value.rules().map((r) => ({
    id: r.id,
    head: nodeName(r.head),
    body: r.body.length ? r.body.map(nodeName).join(', ') : '⊤',
    selected: sel.value?.kind === 'rule' && sel.value.id === r.id,
  })),
)

// --- new-rule builder ---
const newHead = ref<NodeId | null>(null)
const newBody = ref<NodeId[]>([])
function toggleBodyMember(id: NodeId) {
  newBody.value = newBody.value.includes(id)
    ? newBody.value.filter((b) => b !== id)
    : [...newBody.value, id]
}
function commitNewRule() {
  if (newHead.value === null || !newBody.value.length) return
  const head = newHead.value
  const body = [...newBody.value]
  if (body.includes(head)) toast(`Tautological rule ${nodeName(head)} ← …, ${nodeName(head)}`)
  commit((d) => {
    d.addRule(head, body)
  })
  newHead.value = null
  newBody.value = []
}

// --- floating action bar (replaces the inspector) ---
function selectNode(id: NodeId) {
  sel.value = { kind: 'node', id }
}
function selectRule(id: number) {
  sel.value = { kind: 'rule', id }
}
const selectionActions = computed<SelectionAction[]>(() => {
  const s = sel.value
  if (!s) return []
  if (s.kind === 'node') {
    if (!content.value.hasNode(s.id)) return []
    const d = content.value.getNode(s.id)
    return [
      {
        key: 'kind',
        label: d.kind === 'assumption' ? '→ atom' : '↑ assumption',
        keepOpen: true,
        run: () => toggleKind(s.id),
      },
      {
        key: 'fact',
        label: d.fact ? 'unset fact' : 'set fact',
        keepOpen: true,
        run: () => setFact(s.id, !d.fact),
      },
      { key: 'del', label: 'delete', danger: true, run: () => delNode(s.id) },
    ]
  }
  return [{ key: 'del', label: 'delete', danger: true, run: () => delRule(s.id) }]
})
function selectionRect(): DOMRect | null {
  const s = sel.value
  if (!s || !svgEl.value) return null
  const q = s.kind === 'node' ? `[data-node="${s.id}"]` : `[data-hub="${s.id}"]`
  return svgEl.value.querySelector(q)?.getBoundingClientRect() ?? null
}

// --- model operations ---
function addAtom(x: number, y: number) {
  const id = freshId()
  commit((d) => d.addNode(id, { name: genName(), kind: 'atom', x, y, fact: false }))
  sel.value = { kind: 'node', id }
}
// Add an assumption plus its auto-named contrary atom in a single step.
function addAssumption(x: number, y: number) {
  const base = freshId()
  const name = genName()
  commit((d) => {
    d.addNode(base, { name, kind: 'assumption', x, y, fact: false })
    d.addNode(base + 1, { name: '¬' + name, kind: 'atom', x: x + 150, y: y - 30, fact: false })
    d.setContrary(base, base + 1)
  })
  sel.value = { kind: 'node', id: base }
}
function addAtomSpawn() {
  addAtom(120 + Math.random() * 160, 120 + Math.random() * 160)
}
function addAssumptionSpawn() {
  addAssumption(120 + Math.random() * 160, 120 + Math.random() * 160)
}
function toggleKind(id: NodeId) {
  if (isAssm(id)) {
    commit((d) => d.setKind(id, 'atom'))
    return
  }
  const n = content.value.getNode(id)
  const cname = '¬' + n.name
  const existing = [...content.value.nodeEntries()].find(([, d]) => d.name === cname)?.[0]
  const newId = existing === undefined ? freshId() : undefined
  commit((d) => {
    d.setKind(id, 'assumption')
    let target = existing
    if (target === undefined) {
      d.addNode(newId!, { name: cname, kind: 'atom', x: n.x + 150, y: n.y - 30, fact: false })
      target = newId
    }
    d.setContrary(id, target!)
  })
}
function setContrary(assm: NodeId, target: NodeId) {
  if (!isAssm(assm)) {
    toast('Only assumptions have a contrary')
    return
  }
  if (target === assm) toast('Self-contrary — now a self-attacker')
  commit((d) => d.setContrary(assm, target))
}
function setFact(id: NodeId, on: boolean) {
  commit((d) => d.setFact(id, on))
}
function rename(id: NodeId, value: string): boolean {
  const val = value.trim()
  if (!val) return false
  if (content.value.getNode(id).name !== val && usedNames().includes(val)) {
    toast('Name already used')
    return false
  }
  commit((d) => d.setName(id, val))
  return true
}
function onListRename(id: NodeId, e: Event) {
  const input = e.target as HTMLInputElement
  if (!rename(id, input.value)) input.value = content.value.getNode(id).name
}
function delNode(id: NodeId) {
  commit((d) => d.deleteNode(id))
  sel.value = null
}
function delRule(id: number) {
  commit((d) => d.deleteRule(id))
  sel.value = null
}
function addRule(body: NodeId, head: NodeId) {
  if (body === head) toast(`Tautological rule ${nodeName(head)} ← ${nodeName(head)}`)
  // Block body: addRule returns the new id; returning it from the immer recipe would make
  // immer reject a "returned a value and mutated the draft" producer.
  commit((d) => {
    d.addRule(head, [body])
  })
}
function addBody(ruleId: number, atom: NodeId) {
  commit((d) => d.addBodyAtom(ruleId, atom))
}

// --- pointer interactions ---
const svgEl = useTemplateRef<SVGSVGElement>('svg')
function toSvg(e: PointerEvent | MouseEvent): { x: number; y: number } {
  const svg = svgEl.value!
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const p = pt.matrixTransform(svg.getScreenCTM()!.inverse())
  return { x: p.x, y: p.y }
}
function attr(target: EventTarget | null, name: string): string | null {
  return target instanceof Element ? target.getAttribute(name) : null
}
function onPointerDown(e: PointerEvent) {
  const rh = attr(e.target, 'data-rh')
  const ch = attr(e.target, 'data-ch')
  const nd = attr(e.target, 'data-node')
  const hb = attr(e.target, 'data-hub')
  if (rh) {
    gesture = { t: 'rule', from: Number(rh) }
    const p = pos(Number(rh))
    templink.value = { x1: p.x, y1: p.y, x2: p.x, y2: p.y, ctr: false }
    svgEl.value!.setPointerCapture(e.pointerId)
    e.preventDefault()
  } else if (ch) {
    gesture = { t: 'ctr', from: Number(ch) }
    const p = pos(Number(ch))
    templink.value = { x1: p.x, y1: p.y, x2: p.x, y2: p.y, ctr: true }
    svgEl.value!.setPointerCapture(e.pointerId)
    e.preventDefault()
  } else if (nd) {
    const id = Number(nd)
    sel.value = { kind: 'node', id }
    const p = toSvg(e)
    const n = content.value.getNode(id)
    gesture = { t: 'move', id, dx: n.x - p.x, dy: n.y - p.y }
    dragging.value = { id, x: n.x, y: n.y }
    svgEl.value!.setPointerCapture(e.pointerId)
    e.preventDefault()
  } else if (hb) {
    sel.value = { kind: 'rule', id: Number(hb) }
  } else {
    sel.value = null
  }
}
function onPointerMove(e: PointerEvent) {
  if (!gesture) return
  const p = toSvg(e)
  if (gesture.t === 'move') {
    dragging.value = { id: gesture.id, x: p.x + gesture.dx, y: p.y + gesture.dy }
  } else if (templink.value) {
    templink.value = { ...templink.value, x2: p.x, y2: p.y }
  }
}
function onPointerUp(e: PointerEvent) {
  if (!gesture) return
  const g = gesture
  gesture = null
  templink.value = null
  if (svgEl.value?.hasPointerCapture(e.pointerId)) svgEl.value.releasePointerCapture(e.pointerId)
  if (g.t === 'move') {
    const d = dragging.value
    dragging.value = null
    if (d) commit((draft) => draft.setPosition(g.id, d.x, d.y))
    return
  }
  const el = document.elementFromPoint(e.clientX, e.clientY)
  // Any of a node's own elements (rect or its handles) identify that node as the drop target.
  const tgtNode = attr(el, 'data-node') ?? attr(el, 'data-rh') ?? attr(el, 'data-ch')
  const tgtHub = attr(el, 'data-hub')
  if (g.t === 'rule') {
    if (tgtHub) addBody(Number(tgtHub), g.from)
    else if (tgtNode) addRule(g.from, Number(tgtNode))
  } else if (g.t === 'ctr' && tgtNode) {
    setContrary(g.from, Number(tgtNode))
  }
}
function onDblClick(e: MouseEvent) {
  if (attr(e.target, 'data-node') || attr(e.target, 'data-hub')) return
  const p = toSvg(e)
  addAtom(p.x, p.y)
}
function onKeyDown(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null
  if (t && /INPUT|TEXTAREA/.test(t.tagName)) return
  if ((e.key === 'Delete' || e.key === 'Backspace') && sel.value) {
    if (sel.value.kind === 'node') delNode(sel.value.id)
    else delRule(sel.value.id)
    e.preventDefault()
  } else if (e.key === 'Escape') {
    sel.value = null
    gesture = null
    templink.value = null
    dragging.value = null
  }
}
onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="aba-editor">
    <aside class="side">
      <div class="tools">
        <button
          class="btn btn-sm"
          type="button"
          :disabled="!historyState.canUndo"
          @click="emit('undo')"
        >
          ↶ undo
        </button>
        <button
          class="btn btn-sm"
          type="button"
          :disabled="!historyState.canRedo"
          @click="emit('redo')"
        >
          redo↷
        </button>
      </div>

      <section class="sect">
        <div class="sect-head">
          <h4>Statements</h4>
          <div class="add-btns">
            <button class="btn btn-xs" type="button" @click="addAtomSpawn">＋ atom</button>
            <button class="btn btn-xs" type="button" @click="addAssumptionSpawn">
              ＋ assumption
            </button>
          </div>
        </div>
        <div v-if="!statements.length" class="muted empty">No statements yet.</div>
        <ul v-else class="stmt-list">
          <li
            v-for="s in statements"
            :key="s.id"
            class="stmt"
            :class="{ sel: s.selected }"
            @click="selectNode(s.id)"
          >
            <span class="glyph" :class="s.kind === 'assumption' ? 'g-assm' : 'g-atom'"></span>
            <input
              class="input input-xs stmt-name"
              type="text"
              :value="s.name"
              @click.stop
              @change="onListRename(s.id, $event)"
            />
            <span v-if="s.fact" class="tagpill" title="fact (empty-body rule)">⊤</span>
            <span v-if="s.kind === 'assumption'" class="ctr-hint">
              ¬{{ s.name }}={{ s.contrary !== undefined ? nodeName(s.contrary) : '—' }}
            </span>
          </li>
        </ul>
      </section>

      <section class="sect">
        <h4>Rules</h4>
        <div class="rule-build">
          <select v-model="newHead" class="select select-xs rb-head">
            <option :value="null" disabled>head…</option>
            <option v-for="s in statements" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
          <span class="rb-arrow">←</span>
          <div class="rb-body">
            <span v-if="!statements.length" class="muted">add statements first</span>
            <button
              v-for="s in statements"
              :key="s.id"
              type="button"
              class="chip"
              :class="{ on: newBody.includes(s.id) }"
              @click="toggleBodyMember(s.id)"
            >
              {{ s.name }}
            </button>
          </div>
          <button
            class="btn btn-xs btn-add"
            type="button"
            :disabled="newHead === null || !newBody.length"
            @click="commitNewRule"
          >
            add rule
          </button>
        </div>
        <div v-if="!ruleRows.length" class="muted empty">No rules yet.</div>
        <ul v-else class="rule-list">
          <li
            v-for="r in ruleRows"
            :key="r.id"
            class="rule-row"
            :class="{ sel: r.selected }"
            @click="selectRule(r.id)"
          >
            <span class="rule-str">{{ r.head }} ← {{ r.body }}</span>
            <button class="x" type="button" title="delete rule" @click.stop="delRule(r.id)">
              ×
            </button>
          </li>
        </ul>
      </section>

      <section class="sect">
        <h4>Checks</h4>
        <div v-if="!lints.length" class="lint ok">✓ No warnings — well-formed theory.</div>
        <div v-for="(m, i) in lints" :key="i" class="lint"><span class="ic">△</span> {{ m }}</div>
      </section>
    </aside>

    <div class="stage">
      <div class="hint">
        Drag the <b>blue</b> handle to another node to add a rule. Drag the <b>red</b> handle
        (assumptions only) onto an atom to set its contrary. Double-click to add an atom.
      </div>
      <div class="canvas-controls">
        <button
          class="btn btn-xs"
          :class="{ 'btn-active': showAtt }"
          type="button"
          @click="showAtt = !showAtt"
        >
          {{ showAtt ? '◉' : '○' }} attacks
        </button>
        <div class="legend">
          <span><span class="box assm"></span> assumption</span>
          <span><span class="box atom"></span> atom</span>
          <span><span class="sw rule"></span> rule</span>
          <span><span class="sw ctr"></span> contrary</span>
          <span><span class="sw att"></span> attack (computed)</span>
        </div>
      </div>
      <div class="flat-badge" :class="isFlat ? 'flat' : 'nonflat'">
        <span class="dot"></span>
        {{ isFlat ? 'flat theory' : 'non-flat theory' }}
      </div>
      <svg
        ref="svg"
        class="canvas"
        viewBox="-360 -260 720 520"
        role="application"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @dblclick="onDblClick"
      >
        <defs>
          <marker
            id="aba-ah"
            viewBox="0 0 10 10"
            refX="8.5"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,1 L9,5 L0,9 Z" fill="context-stroke" />
          </marker>
          <marker
            id="aba-bar"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="9"
            markerHeight="9"
            orient="auto-start-reverse"
          >
            <path d="M7,1 L7,9" stroke="context-stroke" stroke-width="2.2" />
          </marker>
        </defs>

        <g>
          <path
            v-for="(d, i) in contraryPaths"
            :key="'c' + i"
            class="ctr-e"
            :d="d"
            marker-end="url(#aba-bar)"
          />
        </g>
        <g>
          <path v-for="(d, i) in ruleGeometry.bodies" :key="'rb' + i" class="rule-e" :d="d" />
          <path
            v-for="(d, i) in ruleGeometry.heads"
            :key="'rh' + i"
            class="rule-e"
            :d="d"
            marker-end="url(#aba-ah)"
          />
          <circle
            v-for="h in ruleGeometry.hubs"
            :key="'hub' + h.id"
            class="hub"
            :class="{ sel: h.selected }"
            :data-hub="h.id"
            :cx="h.x"
            :cy="h.y"
            r="6"
          />
        </g>
        <g>
          <path
            v-for="(d, i) in attackPaths"
            :key="'a' + i"
            class="att-e"
            :d="d"
            marker-end="url(#aba-ah)"
          />
        </g>
        <g>
          <g
            v-for="n in nodes"
            :key="n.id"
            class="node"
            :class="{ sel: n.selected }"
            :transform="`translate(${n.x},${n.y})`"
          >
            <circle v-if="n.assm" class="n-assm" :data-node="n.id" :r="AR" />
            <path v-else class="n-atom" :data-node="n.id" :d="ATOM_PATH" />
            <text class="nlabel" text-anchor="middle" y="0" dominant-baseline="central">
              {{ n.name }}
            </text>
            <text
              v-if="n.fact"
              class="factbadge"
              text-anchor="middle"
              :y="n.assm ? -AR + 13 : -HH + 12"
            >
              ⊤
            </text>
            <circle class="handle-hit" :data-rh="n.id" :cx="(n.assm ? AR : HW) + 9" cy="0" r="13" />
            <circle
              class="handle rule"
              :data-rh="n.id"
              :cx="(n.assm ? AR : HW) + 9"
              cy="0"
              r="6.5"
            />
            <template v-if="n.assm">
              <circle class="handle-hit" :data-ch="n.id" cx="0" :cy="AR + 9" r="13" />
              <circle class="handle ctr" :data-ch="n.id" cx="0" :cy="AR + 9" r="6.5" />
            </template>
          </g>
        </g>
        <line
          v-if="templink"
          class="templink"
          :class="{ ctr: templink.ctr }"
          :x1="templink.x1"
          :y1="templink.y1"
          :x2="templink.x2"
          :y2="templink.y2"
        />
      </svg>
      <SelectionActionBar
        v-if="selectionActions.length"
        :get-reference-rect="selectionRect"
        :actions="selectionActions"
        @close="sel = null"
      />
      <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>
    </div>
  </div>
</template>

<style scoped>
.aba-editor {
  display: flex;
  height: 100%;
  width: 100%;
  font-size: 14px;
}
.side {
  flex: none;
  width: 264px;
  background: var(--color-base-200);
  border-right: 1px solid var(--color-base-300);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.tools {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 12px;
  border-bottom: 1px solid var(--color-base-300);
}
.sect {
  padding: 12px;
  border-bottom: 1px solid var(--color-base-300);
}
.sect-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.sect h4 {
  margin: 0 0 8px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.6;
}
.sect-head h4 {
  margin: 0;
}
.add-btns {
  display: flex;
  gap: 4px;
}

/* Statements list */
.stmt-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.stmt {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 3px 5px;
  border-radius: 6px;
  cursor: pointer;
}
.stmt:hover {
  background: var(--color-base-300);
}
.stmt.sel {
  background: color-mix(in srgb, var(--color-primary) 16%, transparent);
  outline: 1px solid color-mix(in srgb, var(--color-primary) 45%, transparent);
}
.glyph {
  flex: none;
  width: 12px;
  height: 12px;
  border: 2px solid;
}
.g-assm {
  border-radius: 50%;
  border-color: var(--color-secondary);
  background: color-mix(in srgb, var(--color-secondary) 22%, var(--color-base-100));
}
.g-atom {
  border-radius: 2px;
  transform: rotate(45deg);
  border-color: var(--color-neutral);
  background: var(--color-base-100);
}
.stmt-name {
  flex: 1;
  min-width: 0;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
.tagpill {
  flex: none;
  color: var(--color-primary);
  font-weight: 700;
}
.ctr-hint {
  flex: none;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--color-error);
  opacity: 0.85;
}

/* Rule builder + list */
.rule-build {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}
.rb-arrow {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  opacity: 0.6;
}
.rb-body {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1 1 100%;
}
.chip {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 999px;
  border: 1px solid var(--color-base-300);
  background: var(--color-base-100);
  cursor: pointer;
}
.chip.on {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 18%, var(--color-base-100));
  color: var(--color-primary);
}
.btn-add {
  margin-left: auto;
}
.rule-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.rule-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 5px;
  border-radius: 6px;
  cursor: pointer;
}
.rule-row:hover {
  background: var(--color-base-300);
}
.rule-row.sel {
  background: color-mix(in srgb, var(--color-primary) 16%, transparent);
  outline: 1px solid color-mix(in srgb, var(--color-primary) 45%, transparent);
}
.rule-str {
  flex: 1;
  min-width: 0;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 13px;
}
.rule-row .x {
  flex: none;
  color: var(--color-error);
  font-size: 15px;
  line-height: 1;
  opacity: 0.7;
}
.rule-row .x:hover {
  opacity: 1;
}
.muted {
  font-size: 11.5px;
  opacity: 0.6;
  font-family: system-ui, sans-serif;
}
.empty {
  font-style: italic;
}
.lint {
  display: flex;
  gap: 8px;
  font-size: 12px;
  padding: 5px 0;
}
.lint .ic {
  color: var(--color-warning);
  font-weight: 700;
}
.lint.ok {
  color: var(--color-success);
}

.stage {
  flex: 1;
  min-width: 0;
  position: relative;
  background: var(--color-base-100);
  background-image: radial-gradient(circle at 1px 1px, var(--color-base-300) 1px, transparent 0);
  background-size: 22px 22px;
}
.hint {
  position: absolute;
  top: 10px;
  left: 12px;
  z-index: 5;
  font-size: 11px;
  background: color-mix(in srgb, var(--color-base-100) 85%, transparent);
  border: 1px solid var(--color-base-300);
  border-radius: 8px;
  padding: 6px 9px;
  max-width: min(58%, 400px);
  opacity: 0.75;
  pointer-events: none;
}
.canvas-controls {
  position: absolute;
  top: 10px;
  right: 12px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}
.legend {
  font-size: 11px;
  background: color-mix(in srgb, var(--color-base-100) 85%, transparent);
  border: 1px solid var(--color-base-300);
  border-radius: 8px;
  padding: 6px 9px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.flat-badge {
  position: absolute;
  bottom: 12px;
  left: 12px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  background: color-mix(in srgb, var(--color-base-100) 85%, transparent);
  border: 1px solid var(--color-base-300);
  border-radius: 999px;
}
.flat-badge .dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.flat-badge.flat .dot {
  background: var(--color-success);
}
.flat-badge.nonflat .dot {
  background: var(--color-warning);
}
.legend span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.box {
  width: 13px;
  height: 13px;
  flex: none;
  border: 2px solid;
  border-radius: 3px;
}
.box.assm {
  border-radius: 50%;
  border-color: var(--color-secondary);
  background: color-mix(in srgb, var(--color-secondary) 22%, var(--color-base-100));
}
.box.atom {
  border-color: var(--color-neutral);
  background: var(--color-base-100);
  border-radius: 3px;
  transform: rotate(45deg);
}
.sw {
  width: 20px;
  border-top: 2px solid;
  flex: none;
}
.sw.rule {
  border-color: color-mix(in srgb, var(--color-primary) 78%, var(--color-base-content));
}
.sw.ctr {
  border-color: var(--color-error);
  border-top-style: dashed;
}
.sw.att {
  border-color: var(--color-error);
  border-top-width: 3px;
}

.canvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
}
.canvas text {
  pointer-events: none;
  user-select: none;
}
.n-assm {
  fill: color-mix(in srgb, var(--color-secondary) 22%, var(--color-base-100));
  stroke: var(--color-secondary);
  stroke-width: 2;
  cursor: grab;
}
.n-atom {
  fill: var(--color-base-100);
  stroke: var(--color-neutral);
  stroke-width: 2;
  cursor: grab;
}
.node.sel .n-assm,
.node.sel .n-atom {
  stroke: var(--color-primary);
  stroke-width: 3.4;
}
.nlabel {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 15px;
  font-weight: 700;
  fill: var(--color-base-content);
}
.factbadge {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12px;
  font-weight: 700;
  fill: var(--color-primary);
}
.rule-e {
  stroke: color-mix(in srgb, var(--color-primary) 78%, var(--color-base-content));
  stroke-width: 2;
  fill: none;
}
.hub {
  fill: color-mix(in srgb, var(--color-primary) 78%, var(--color-base-content));
  cursor: pointer;
  stroke: var(--color-base-100);
  stroke-width: 1.5;
}
.hub.sel {
  fill: var(--color-primary);
  stroke: var(--color-primary);
}
.ctr-e {
  stroke: var(--color-error);
  stroke-width: 2;
  fill: none;
  stroke-dasharray: 5 4;
}
.att-e {
  stroke: var(--color-error);
  stroke-width: 3;
  fill: none;
  opacity: 0.9;
}
.handle {
  stroke: var(--color-base-100);
  stroke-width: 1.5;
  opacity: 0;
  cursor: crosshair;
  pointer-events: none;
  transition: opacity 0.1s;
}
.handle-hit {
  fill: transparent;
  cursor: crosshair;
  pointer-events: none;
}
.node:hover .handle,
.node.sel .handle {
  opacity: 1;
}
.node:hover .handle-hit,
.node.sel .handle-hit {
  pointer-events: all;
}
.handle.rule {
  fill: var(--color-primary);
}
.handle.ctr {
  fill: var(--color-error);
}
.templink {
  stroke: var(--color-primary);
  stroke-width: 2;
  stroke-dasharray: 4 4;
  fill: none;
  pointer-events: none;
}
.templink.ctr {
  stroke: var(--color-error);
}
.toast {
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  background: var(--color-neutral);
  color: var(--color-neutral-content);
  font-size: 12.5px;
  padding: 8px 14px;
  border-radius: 9px;
  z-index: 40;
}
</style>
