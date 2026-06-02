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
import type { FormulaNode } from '@/modules/dialectical-argumentation/condition/formula'

defineOptions({ name: 'FormulaEditor' })

const props = defineProps<{
  formula: FormulaNode
  availableArguments: { id: number; name: string }[]
}>()

const emit = defineEmits<{
  'update:formula': [FormulaNode]
}>()

const TAUTOLOGY: FormulaNode = { type: 'tautology' }

function onTypeChange(newType: string) {
  const f = props.formula
  switch (newType) {
    case 'tautology':
      emit('update:formula', { type: 'tautology' })
      break
    case 'contradiction':
      emit('update:formula', { type: 'contradiction' })
      break
    case 'atom': {
      const firstArg = props.availableArguments[0]
      emit('update:formula', { type: 'atom', argumentId: firstArg?.id ?? 0 })
      break
    }
    case 'negation':
      // Don't double-wrap if already a negation
      emit('update:formula', f.type === 'negation' ? f : { type: 'negation', child: f })
      break
    case 'conjunction':
      if (f.type === 'disjunction') {
        emit('update:formula', { type: 'conjunction', children: f.children })
      } else if (f.type === 'conjunction') {
        // no-op
      } else {
        emit('update:formula', { type: 'conjunction', children: [f, TAUTOLOGY] })
      }
      break
    case 'disjunction':
      if (f.type === 'conjunction') {
        emit('update:formula', { type: 'disjunction', children: f.children })
      } else if (f.type === 'disjunction') {
        // no-op
      } else {
        emit('update:formula', { type: 'disjunction', children: [f, TAUTOLOGY] })
      }
      break
  }
}

function onAtomArgumentChange(event: Event) {
  const id = parseInt((event.target as HTMLSelectElement).value, 10)
  emit('update:formula', { type: 'atom', argumentId: id })
}

function onNegationChildChange(child: FormulaNode) {
  emit('update:formula', { type: 'negation', child })
}

function onChildChange(index: number, child: FormulaNode) {
  if (props.formula.type !== 'conjunction' && props.formula.type !== 'disjunction') return
  const newChildren = [...props.formula.children]
  newChildren[index] = child
  emit('update:formula', { type: props.formula.type, children: newChildren })
}

function addChild() {
  if (props.formula.type !== 'conjunction' && props.formula.type !== 'disjunction') return
  emit('update:formula', {
    type: props.formula.type,
    children: [...props.formula.children, TAUTOLOGY],
  })
}

function removeChild(index: number) {
  if (props.formula.type !== 'conjunction' && props.formula.type !== 'disjunction') return
  const { children } = props.formula
  if (children.length <= 2) {
    // Collapse to the remaining child
    emit('update:formula', children[index === 0 ? 1 : 0]!)
  } else {
    emit('update:formula', {
      type: props.formula.type,
      children: children.filter((_, i) => i !== index),
    })
  }
}
</script>

<template>
  <div class="formula-node">
    <div class="formula-row">
      <select
        class="select select-xs w-36"
        :value="formula.type"
        @change="onTypeChange(($event.target as HTMLSelectElement).value)"
      >
        <option value="tautology">⊤  Tautology</option>
        <option value="contradiction">⊥  Contradiction</option>
        <option value="atom">Atom</option>
        <option value="negation">¬  Negation</option>
        <option value="conjunction">∧  All of</option>
        <option value="disjunction">∨  Any of</option>
      </select>

      <!-- Atom: argument selector -->
      <select
        v-if="formula.type === 'atom'"
        class="select select-xs"
        :value="formula.argumentId"
        @change="onAtomArgumentChange"
      >
        <option v-for="arg in availableArguments" :key="arg.id" :value="arg.id">
          {{ arg.name }}
        </option>
        <option v-if="availableArguments.length === 0" disabled :value="-1">—</option>
      </select>

      <!-- Conjunction/Disjunction: Add button -->
      <button
        v-if="formula.type === 'conjunction' || formula.type === 'disjunction'"
        class="btn btn-xs btn-ghost"
        type="button"
        @click="addChild"
      >
        + Add
      </button>
    </div>

    <!-- Negation child -->
    <div v-if="formula.type === 'negation'" class="formula-children">
      <FormulaEditor
        :formula="formula.child"
        :available-arguments="availableArguments"
        @update:formula="onNegationChildChange"
      />
    </div>

    <!-- Conjunction / Disjunction children -->
    <div
      v-if="formula.type === 'conjunction' || formula.type === 'disjunction'"
      class="formula-children"
    >
      <div v-for="(child, index) in formula.children" :key="index" class="formula-child-row">
        <FormulaEditor
          :formula="child"
          :available-arguments="availableArguments"
          @update:formula="(f) => onChildChange(index, f)"
        />
        <button
          class="btn btn-xs btn-ghost remove-btn"
          type="button"
          title="Remove"
          @click="removeChild(index)"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.formula-node {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.formula-row {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.formula-children {
  padding-left: 16px;
  border-left: 2px solid oklch(var(--b3));
  margin-left: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 2px;
}

.formula-child-row {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.remove-btn {
  flex-shrink: 0;
  margin-top: 1px;
}
</style>
