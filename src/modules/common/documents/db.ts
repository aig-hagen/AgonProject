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
import { type DBSchema, type IDBPDatabase, openDB } from 'idb'
import type { Objectish } from 'immer'
import type { InjectionKey } from 'vue'

import type { DocumentState } from '@/modules/common/state'

const DATABASE_DOCUMENTS_VERSION = 2

export const OBJECT_STORE_METADATA_NAME = 'metadata'
export const OBJECT_STORE_METADATA_KEY_PATH = 'id'
export const OBJECT_STORE_CONTENT_NAME = 'content'
export const OBJECT_STORE_UI_STATE_NAME = 'ui-state'

export type DocumentId = number
type DocumentName = string

export interface DocumentMetadata {
  id: DocumentId
  name: DocumentName
  /** Epoch millis of the last content edit. Absent on documents created before this was tracked. */
  lastEdited?: number
  /** AF-type marker (the module's `newNamePrefix`), set once when content is first written. */
  type?: string
}

export interface DocumentsDB extends DBSchema {
  metadata: {
    key: DocumentId
    value: DocumentMetadata
    keyPath: typeof OBJECT_STORE_METADATA_KEY_PATH
  }
  content: {
    key: DocumentId
    value: DocumentState<Objectish>
  }
  'ui-state': {
    key: DocumentId
    value: Record<string, unknown>
  }
}

/**
 * Provided once (in HomeView.vue) so deeply nested components (e.g. GraphEditor
 * and FloatingWindow) can read/write per-document UI state without prop-threading
 * the database connection through every intermediate component.
 */
export const DOCUMENTS_DB_INJECTION_KEY: InjectionKey<IDBPDatabase<DocumentsDB>> =
  Symbol('documents-db')

const STALE_BUNDLE_RELOAD_FLAG = 'agon-stale-bundle-reloaded'

function isVersionError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'VersionError'
}

export async function openDocumentsDB(dbName: string): Promise<IDBPDatabase<DocumentsDB>> {
  try {
    const db = await openDocumentsDBInternal(dbName)
    sessionStorage.removeItem(STALE_BUNDLE_RELOAD_FLAG)
    return db
  } catch (error) {
    // A VersionError means this (stale) bundle is older than the stored DB;
    // reload once to pick up the current bundle instead of blanking the page.
    if (isVersionError(error) && !sessionStorage.getItem(STALE_BUNDLE_RELOAD_FLAG)) {
      console.warn('Stale bundle detected (database VersionError); reloading once.')
      sessionStorage.setItem(STALE_BUNDLE_RELOAD_FLAG, '1')
      window.location.reload()
      return new Promise<IDBPDatabase<DocumentsDB>>(() => {}) // never resolves; reload navigates away
    }
    throw error
  }
}

async function openDocumentsDBInternal(dbName: string): Promise<IDBPDatabase<DocumentsDB>> {
  const db = await openDB<DocumentsDB>(dbName, DATABASE_DOCUMENTS_VERSION, {
    upgrade(db, oldVersion, newVersion, _transaction, _event) {
      if (newVersion !== 2) {
        // When making breaking changes to data, either migrate or delete old data here.
        throw new Error(`Cannot upgrade database from version ${oldVersion} to ${newVersion}.`)
      }

      if (oldVersion === 0) {
        console.debug('Creating database.')
        db.createObjectStore(OBJECT_STORE_METADATA_NAME, {
          autoIncrement: true,
          keyPath: OBJECT_STORE_METADATA_KEY_PATH,
        })
        db.createObjectStore(OBJECT_STORE_CONTENT_NAME)
      }

      if (oldVersion < 2) {
        console.debug('Adding UI state store.')
        db.createObjectStore(OBJECT_STORE_UI_STATE_NAME)
      }
    },
    blocking(_currentVersion, _blockedVersion, _event) {
      console.debug(
        'Reloading because connection is blocking a future version of the database from opening.',
      )
      window.location.reload()
    },
    terminated() {
      console.debug('Reloading because database connection terminated.')
      window.location.reload()
    },
  })
  console.debug(`Opened database version with version ${db.version}.`)
  return db
}
