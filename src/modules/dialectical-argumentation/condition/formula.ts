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

export type FormulaNode =
  | { type: 'tautology' }
  | { type: 'contradiction' }
  | { type: 'atom'; argumentId: number }
  | { type: 'negation'; child: FormulaNode }
  | { type: 'conjunction'; children: FormulaNode[] }
  | { type: 'disjunction'; children: FormulaNode[] }

// Precedence levels: higher number = binds tighter
const PREC_DISJUNCTION = 1
const PREC_CONJUNCTION = 2
const PREC_NEGATION = 3
const PREC_ATOM = 4

function nodePrec(node: FormulaNode): number {
  switch (node.type) {
    case 'tautology':
    case 'contradiction':
    case 'atom':
      return PREC_ATOM
    case 'negation':
      return PREC_NEGATION
    case 'conjunction':
      return PREC_CONJUNCTION
    case 'disjunction':
      return PREC_DISJUNCTION
  }
}

function toStringInner(node: FormulaNode, argNames: Map<number, string>, parentPrec: number): string {
  const s = toStringRaw(node, argNames)
  const myPrec = nodePrec(node)
  return myPrec < parentPrec ? `(${s})` : s
}

function toStringRaw(node: FormulaNode, argNames: Map<number, string>): string {
  switch (node.type) {
    case 'tautology':
      return '⊤'
    case 'contradiction':
      return '⊥'
    case 'atom':
      return argNames.get(node.argumentId) ?? '?'
    case 'negation':
      return `¬${toStringInner(node.child, argNames, PREC_NEGATION)}`
    case 'conjunction':
      return node.children
        .map((c) => toStringInner(c, argNames, PREC_CONJUNCTION))
        .join(' ∧ ')
    case 'disjunction':
      return node.children
        .map((c) => toStringInner(c, argNames, PREC_DISJUNCTION + 1))
        .join(' ∨ ')
  }
}

export function formulaToString(node: FormulaNode, argNames: Map<number, string>): string {
  return toStringRaw(node, argNames)
}

export function getReferencedArgumentIds(node: FormulaNode): Set<number> {
  const ids = new Set<number>()
  collectAtoms(node, ids)
  return ids
}

function collectAtoms(node: FormulaNode, out: Set<number>): void {
  switch (node.type) {
    case 'tautology':
    case 'contradiction':
      break
    case 'atom':
      out.add(node.argumentId)
      break
    case 'negation':
      collectAtoms(node.child, out)
      break
    case 'conjunction':
    case 'disjunction':
      for (const child of node.children) {
        collectAtoms(child, out)
      }
      break
  }
}

export function cleanupAfterArgumentDeletion(node: FormulaNode, deletedId: number): FormulaNode {
  switch (node.type) {
    case 'tautology':
    case 'contradiction':
      return node
    case 'atom':
      return node.argumentId === deletedId ? { type: 'tautology' } : node
    case 'negation':
      return { type: 'negation', child: cleanupAfterArgumentDeletion(node.child, deletedId) }
    case 'conjunction':
    case 'disjunction': {
      const newChildren = node.children.map((c) => cleanupAfterArgumentDeletion(c, deletedId))
      return { type: node.type, children: newChildren }
    }
  }
}
