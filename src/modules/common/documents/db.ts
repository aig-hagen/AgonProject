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

import type { DocumentState } from '@/modules/common/state'

const DATABASE_DOCUMENTS_VERSION = 1

export const OBJECT_STORE_METADATA_NAME = 'metadata'
export const OBJECT_STORE_METADATA_KEY_PATH = 'id'
export const OBJECT_STORE_CONTENT_NAME = 'content'

export type DocumentId = number
type DocumentName = string

export interface DocumentMetadata {
  id: DocumentId
  name: DocumentName
}

export interface DocumentsDB extends DBSchema {
  metadata: {
    key: DocumentId
    value: {
      id: DocumentId
      name: DocumentName
    }
    keyPath: typeof OBJECT_STORE_METADATA_KEY_PATH
  }
  content: {
    key: DocumentId
    value: DocumentState<Objectish>
  }
}

export async function openDocumentsDB(dbName: string): Promise<IDBPDatabase<DocumentsDB>> {
  const db = await openDB<DocumentsDB>(dbName, DATABASE_DOCUMENTS_VERSION, {
    upgrade(db, oldVersion, newVersion, _transaction, _event) {
      if (newVersion !== 1) {
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
