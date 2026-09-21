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
import type { HistoryState } from '@/modules/common/graph-editor/graphEditor'
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
const HH = 22

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
function clip(cx: number, cy: number, px: number, py: number): { x: number; y: number } {
  const dx = px - cx
  const dy = py - cy
  if (dx === 0 && dy === 0) return { x: cx, y: cy }
  const sx = dx ? HW / Math.abs(dx) : Infinity
  const sy = dy ? HH / Math.abs(dy) : Infinity
  const s = Math.min(sx, sy)
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
      const s = clip(B.x, B.y, h.x, h.y)
      bodies.push(`M${s.x},${s.y} L${h.x},${h.y}`)
    }
    const H = pos(r.head)
    const e = clip(H.x, H.y, h.x, h.y)
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
        `M${A.x + HW - 6},${A.y - HH + 2} C${A.x + HW + 40},${A.y - HH - 26} ${A.x + HW + 40},${A.y + HH + 26} ${A.x + HW - 6},${A.y + HH - 2}`,
      )
    } else {
      const B = pos(t)
      const s = clip(A.x, A.y, B.x, B.y)
      const e = clip(B.x, B.y, A.x, A.y)
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
        const e = clip(T.x, T.y, h.x, h.y)
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

const selectedNode = computed(() =>
  sel.value?.kind === 'node' && content.value.hasNode(sel.value.id)
    ? { id: sel.value.id, data: content.value.getNode(sel.value.id) }
    : null,
)
const selectedRule = computed(() =>
  sel.value?.kind === 'rule'
    ? (content.value.rules().find((r) => r.id === sel.value!.id) ?? null)
    : null,
)
function nodeName(id: NodeId): string {
  return content.value.hasNode(id) ? content.value.getNode(id).name : '?'
}

// --- model operations ---
function addAtom(x: number, y: number) {
  const id = freshId()
  commit((d) => d.addNode(id, { name: genName(), kind: 'atom', x, y, fact: false }))
  sel.value = { kind: 'node', id }
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
function onRenameInput(e: Event) {
  const input = e.target as HTMLInputElement
  if (!selectedNode.value) return
  if (!rename(selectedNode.value.id, input.value)) input.value = selectedNode.value.data.name
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
          @click="addAtom(120 + Math.random() * 160, 120 + Math.random() * 160)"
        >
          ＋ atom
        </button>
        <button
          class="btn btn-sm"
          :class="{ 'btn-active': showAtt }"
          type="button"
          @click="showAtt = !showAtt"
        >
          attacks
        </button>
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

      <div class="flat-badge" :class="isFlat ? 'flat' : 'nonflat'">
        <span class="dot"></span>
        {{ isFlat ? 'flat theory' : 'non-flat theory' }}
        <span class="muted">{{
          isFlat ? 'no assumption is derived' : 'an assumption is a rule head / fact'
        }}</span>
      </div>

      <section class="sect">
        <h4>Inspector</h4>
        <template v-if="selectedNode">
          <div class="field">
            <label>name</label>
            <input
              class="input input-sm"
              type="text"
              :value="selectedNode.data.name"
              @change="onRenameInput"
            />
          </div>
          <div class="rowbtns">
            <button class="btn btn-sm" type="button" @click="toggleKind(selectedNode.id)">
              {{ selectedNode.data.kind === 'assumption' ? '→ make atom' : '↑ make assumption' }}
            </button>
          </div>
          <label class="cbrow">
            <input
              type="checkbox"
              class="checkbox checkbox-sm"
              :checked="selectedNode.data.fact"
              @change="setFact(selectedNode.id, ($event.target as HTMLInputElement).checked)"
            />
            fact (⊤ ← , empty body)
          </label>
          <div v-if="selectedNode.data.kind === 'assumption'" class="ctr-info">
            ¬{{ selectedNode.data.name }} =
            {{
              content.getContrary(selectedNode.id) !== undefined
                ? nodeName(content.getContrary(selectedNode.id)!)
                : '—'
            }}
            <div class="muted">Drag the red handle onto an atom to re-point (single-valued).</div>
          </div>
          <div class="rowbtns">
            <button class="btn btn-sm btn-del" type="button" @click="delNode(selectedNode.id)">
              delete node
            </button>
          </div>
        </template>
        <template v-else-if="selectedRule">
          <div class="rule-str">
            {{ nodeName(selectedRule.head) }} ←
            {{ selectedRule.body.length ? selectedRule.body.map(nodeName).join(', ') : '⊤' }}
          </div>
          <div class="muted">Drag a node’s blue handle onto this hub to add a body atom.</div>
          <div class="rowbtns">
            <button class="btn btn-sm btn-del" type="button" @click="delRule(selectedRule.id)">
              delete rule
            </button>
          </div>
        </template>
        <div v-else class="muted empty">
          Select a node or rule hub. Double-click the canvas to add an atom.
        </div>
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
      <div class="legend">
        <span><span class="box assm"></span> assumption</span>
        <span><span class="box atom"></span> atom</span>
        <span><span class="sw rule"></span> rule</span>
        <span><span class="sw ctr"></span> contrary</span>
        <span><span class="sw att"></span> attack (computed)</span>
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
            <rect
              :class="n.assm ? 'n-assm' : 'n-atom'"
              :data-node="n.id"
              :x="-HW"
              :y="-HH"
              :width="HW * 2"
              :height="HH * 2"
              :rx="n.assm ? HH : 9"
            />
            <text class="nlabel" text-anchor="middle" y="1">{{ n.name }}</text>
            <text class="ntag" text-anchor="middle" y="15">{{ n.assm ? 'assm' : 'atom' }}</text>
            <text v-if="n.fact" class="factbadge" :x="-HW + 6" :y="-HH + 13">⊤</text>
            <circle class="handle-hit" :data-rh="n.id" :cx="HW + 9" cy="0" r="13" />
            <circle class="handle rule" :data-rh="n.id" :cx="HW + 9" cy="0" r="6.5" />
            <template v-if="n.assm">
              <circle class="handle-hit" :data-ch="n.id" cx="0" :cy="HH + 9" r="13" />
              <circle class="handle ctr" :data-ch="n.id" cx="0" :cy="HH + 9" r="6.5" />
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
.flat-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 600;
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-base-300);
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
.flat-badge .muted {
  font-weight: 400;
}
.sect {
  padding: 12px;
  border-bottom: 1px solid var(--color-base-300);
}
.sect h4 {
  margin: 0 0 8px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.6;
}
.field {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.field label {
  flex: none;
  width: 48px;
  opacity: 0.6;
}
.field .input {
  flex: 1;
  min-width: 0;
  font-family: ui-monospace, monospace;
}
.rowbtns {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.cbrow {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  margin-bottom: 8px;
  cursor: pointer;
}
.ctr-info {
  font-family: ui-monospace, monospace;
  color: var(--color-error);
  font-size: 13px;
  margin-bottom: 8px;
}
.rule-str {
  font-family: ui-monospace, monospace;
  font-size: 13px;
  margin-bottom: 8px;
}
.muted {
  font-size: 11.5px;
  opacity: 0.6;
  font-family: system-ui, sans-serif;
}
.empty {
  font-style: italic;
}
.btn-del {
  color: var(--color-error);
  border-color: color-mix(in srgb, var(--color-error) 45%, var(--color-base-300));
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
.hint,
.legend {
  position: absolute;
  top: 10px;
  z-index: 5;
  font-size: 11px;
  background: color-mix(in srgb, var(--color-base-100) 85%, transparent);
  border: 1px solid var(--color-base-300);
  border-radius: 8px;
  padding: 6px 9px;
}
.hint {
  left: 12px;
  max-width: min(58%, 400px);
  opacity: 0.75;
  pointer-events: none;
}
.legend {
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
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
  font-family: ui-monospace, monospace;
  font-size: 15px;
  font-weight: 700;
  fill: var(--color-base-content);
}
.ntag {
  font-family: system-ui, sans-serif;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  fill: color-mix(in srgb, var(--color-base-content) 50%, transparent);
}
.factbadge {
  font-family: ui-monospace, monospace;
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
