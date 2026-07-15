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
import { onScopeDispose, type Ref, ref, watch } from 'vue'

import {
  type DocumentId,
  type DocumentsDB,
  OBJECT_STORE_UI_STATE_NAME,
} from '@/modules/common/documents/db'
import { notifyStorageFailureOnce } from '@/modules/common/notifications/storageFailure'

export async function getUIStateValue<T>(
  db: IDBPDatabase<DocumentsDB>,
  documentId: DocumentId,
  key: string,
): Promise<T | undefined> {
  try {
    const row = await db.get(OBJECT_STORE_UI_STATE_NAME, documentId)
    return row?.[key] as T | undefined
  } catch (error) {
    notifyStorageFailureOnce(error)
    return undefined
  }
}

export async function setUIStateValue<T>(
  db: IDBPDatabase<DocumentsDB>,
  documentId: DocumentId,
  key: string,
  value: T,
): Promise<void> {
  // Vue refs/reactive() wrap object and array values in Proxies, which IndexedDB's
  // structured clone algorithm cannot clone (DataCloneError). Strip that via a JSON
  // round-trip — safe since all UI state stored here is plain JSON-serializable data.
  const plainValue = JSON.parse(JSON.stringify(value)) as T
  try {
    const tx = db.transaction(OBJECT_STORE_UI_STATE_NAME, 'readwrite')
    const store = tx.objectStore(OBJECT_STORE_UI_STATE_NAME)
    const row = (await store.get(documentId)) ?? {}
    await store.put({ ...row, [key]: plainValue }, documentId)
    await tx.done
  } catch (error) {
    notifyStorageFailureOnce(error)
  }
}

function getUIStateChannelName(documentId: DocumentId) {
  return `document-ui-state:${documentId}`
}

/**
 * Reactive ref for a single piece of per-document UI state (e.g. the list of
 * open evaluation windows), backed by IndexedDB instead of localStorage.
 *
 * Cross-tab updates are broadcast so multiple tabs editing the same document
 * stay in sync, matching the behavior VueUse's useLocalStorage gave us for free.
 */
export function useDocumentUIState<T>(
  db: IDBPDatabase<DocumentsDB>,
  documentId: DocumentId,
  key: string,
  defaultValue: T,
): Ref<T> {
  const state = ref(defaultValue) as Ref<T>
  // Guards the initial load against a write that happens to land before it resolves
  // (e.g. a user action fired immediately on mount) — the local write wins in that race.
  let hasWrittenLocally = false
  let skipNextPersist = false

  async function applyStored(guardAgainstLocalWrite: boolean) {
    const stored = await getUIStateValue<T>(db, documentId, key)
    if (stored === undefined) return
    if (guardAgainstLocalWrite && hasWrittenLocally) return
    skipNextPersist = true
    state.value = stored
  }

  const channel = new BroadcastChannel(getUIStateChannelName(documentId))
  channel.onmessage = (event) => {
    if ((event.data as { key: string } | undefined)?.key === key) {
      void applyStored(false)
    }
  }

  watch(state, (value) => {
    if (skipNextPersist) {
      skipNextPersist = false
      return
    }
    hasWrittenLocally = true
    void setUIStateValue(db, documentId, key, value).then(() => channel.postMessage({ key }))
  })

  void applyStored(true)

  onScopeDispose(() => {
    channel.close()
  })

  return state
}
