import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { DocumentState } from '@/modules/common/state'
import type { Objectish } from 'immer'

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
