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
import { immerable } from 'immer'

export type NodeId = number
export type NodeKind = 'atom' | 'assumption'

export interface ABANodeData {
  name: string
  kind: NodeKind
  x: number
  y: number
  // A node marked as a fact stands for an empty-body rule (`h ←`). Facts are a node flag
  // rather than a zero-length rule so that emptying a rule's body by deleting atoms can be
  // treated as removing the rule, not as declaring a fact.
  fact: boolean
}

export interface ABARule {
  id: number
  head: NodeId
  body: NodeId[]
}

// An assumption-based argumentation framework as an authoring model: every node lives in the
// language `L`; assumptions are the flagged subset with a contrary. Rules derive their head from
// a (possibly collective) body. Attacks are not stored — they are `derive ∘ is-a-contrary`.
export class ABAF {
  [immerable] = true

  private nodes = new Map<NodeId, ABANodeData>()
  private ruleList: ABARule[] = []
  private contraryMap = new Map<NodeId, NodeId>()
  private nextRuleId = 0

  addNode(id: NodeId, data: ABANodeData) {
    this.nodes.set(id, data)
  }

  deleteNode(id: NodeId) {
    this.nodes.delete(id)
    this.contraryMap.delete(id)
    this.ruleList = this.ruleList
      .filter((r) => r.head !== id)
      .map((r) => ({ ...r, body: r.body.filter((b) => b !== id) }))
      .filter((r) => r.body.length > 0)
    // Any assumption whose contrary pointed here loses it and falls back to an atom.
    for (const [assm, target] of this.contraryMap) {
      if (target === id) {
        this.contraryMap.delete(assm)
        const data = this.nodes.get(assm)
        if (data) data.kind = 'atom'
      }
    }
  }

  getNode(id: NodeId): ABANodeData {
    return this.nodes.get(id)!
  }

  hasNode(id: NodeId): boolean {
    return this.nodes.has(id)
  }

  nodeEntries(): IterableIterator<[NodeId, ABANodeData]> {
    return this.nodes.entries()
  }

  assumptions(): NodeId[] {
    return [...this.nodes].filter(([, d]) => d.kind === 'assumption').map(([id]) => id)
  }

  setName(id: NodeId, name: string) {
    const data = this.nodes.get(id)
    if (data) data.name = name
  }

  setPosition(id: NodeId, x: number, y: number) {
    const data = this.nodes.get(id)
    if (data) {
      data.x = x
      data.y = y
    }
  }

  setKind(id: NodeId, kind: NodeKind) {
    const data = this.nodes.get(id)
    if (!data) return
    data.kind = kind
    if (kind === 'atom') this.contraryMap.delete(id)
  }

  setFact(id: NodeId, fact: boolean) {
    const data = this.nodes.get(id)
    if (data) data.fact = fact
  }

  setContrary(assumption: NodeId, target: NodeId) {
    this.contraryMap.set(assumption, target)
  }

  deleteContrary(assumption: NodeId) {
    this.contraryMap.delete(assumption)
  }

  getContrary(assumption: NodeId): NodeId | undefined {
    return this.contraryMap.get(assumption)
  }

  contraries(): [NodeId, NodeId][] {
    return [...this.contraryMap]
  }

  addRule(head: NodeId, body: NodeId[]): number {
    const id = this.nextRuleId++
    this.ruleList.push({ id, head, body: [...body] })
    return id
  }

  deleteRule(id: number) {
    this.ruleList = this.ruleList.filter((r) => r.id !== id)
  }

  addBodyAtom(ruleId: number, atom: NodeId) {
    const rule = this.ruleList.find((r) => r.id === ruleId)
    if (rule && !rule.body.includes(atom)) rule.body.push(atom)
  }

  removeBodyAtom(ruleId: number, atom: NodeId) {
    const rule = this.ruleList.find((r) => r.id === ruleId)
    if (!rule) return
    rule.body = rule.body.filter((b) => b !== atom)
    if (rule.body.length === 0) this.deleteRule(ruleId)
  }

  rules(): ABARule[] {
    return this.ruleList.map((r) => ({ ...r, body: [...r.body] }))
  }

  // Flat iff no assumption is ever derivable: no assumption is a rule head, nor marked a fact.
  isFlat(): boolean {
    return !this.assumptions().some(
      (a) => this.nodes.get(a)!.fact || this.ruleList.some((r) => r.head === a),
    )
  }
}
