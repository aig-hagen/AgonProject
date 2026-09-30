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
import type { IDBPDatabase } from 'idb'
import { describe, expect, test } from 'vitest'
import { effectScope, nextTick } from 'vue'

import type { DocumentsDB } from '@/modules/common/documents/db'
import { useDocumentUIStateWithLoaded } from '@/modules/common/documents/uiState'

// Just enough of IndexedDB for the UI-state helpers: row reads and a read-modify-write transaction.
function memoryDb(rows: Record<number, Record<string, unknown>>) {
  const log = { writes: 0 }
  const store = {
    get: async (id: number) => rows[id],
    put: async (row: Record<string, unknown>, id: number) => {
      log.writes++
      rows[id] = row
    },
  }
  const db = {
    get: async (_name: string, id: number) => rows[id],
    transaction: () => ({ objectStore: () => store, done: Promise.resolve() }),
  }
  return { db: db as unknown as IDBPDatabase<DocumentsDB>, rows, log }
}

const flush = async () => {
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

function mount<T>(db: IDBPDatabase<DocumentsDB>, defaultValue: T) {
  const scope = effectScope()
  const result = scope.run(() => useDocumentUIStateWithLoaded(db, 1, 'view', defaultValue))!
  return { ...result, stop: () => scope.stop() }
}

describe('useDocumentUIStateWithLoaded', () => {
  test('persists the first change after loading a value equal to the default', async () => {
    const { db, rows } = memoryDb({ 1: { view: 'theory' } })
    const { state, loaded, stop } = mount(db, 'theory')
    await flush()
    expect(loaded.value).toBe(true)

    state.value = 'setaf'
    await flush()
    expect(rows[1]!.view).toBe('setaf')
    stop()
  })

  test('applies a stored value without writing it back', async () => {
    const { db, log } = memoryDb({ 1: { view: 'af' } })
    const { state, stop } = mount(db, 'theory')
    await flush()
    expect(state.value).toBe('af')
    expect(log.writes).toBe(0)
    stop()
  })
})
