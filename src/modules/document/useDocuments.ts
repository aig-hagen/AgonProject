import { onScopeDispose, readonly, ref, type Ref } from 'vue'
import { openDB, type IDBPDatabase, type DBSchema, type IDBPTransaction } from 'idb'

const CHANNEL_DOCUMENTS_NAME = 'documents'
const DATABASE_DOCUMENTS_VERSION = 1

const OBJECT_STORE_METADATA_NAME = 'metadata'
const OBJECT_STORE_METADATA_KEY_PATH = 'id'

const OBJECT_STORE_EVENT_NAME = 'events'
const OBJECT_STORE_EVENT_DOCUMENT_ID = 'documentId'
const OBJECT_STORE_EVENT_EVENT_ID = 'eventId'

const MESSAGE_UPDATE = 'update'

const INITIAL_VERSION = 0

function getRandomInt() {
  return Math.floor(Math.random() * 999_999_999_999)
}

export type DocumentId = number
type DocumentVersion = number
type DocumentName = string
type EventId = number

export interface DocumentMetadata {
  id: DocumentId
  name: DocumentName
  version: DocumentVersion
}

interface Document<DocumentT> {
  metadata: DocumentMetadata
  content: DocumentT
}

interface DocumentsDB<DocumentT> extends DBSchema {
  metadata: {
    key: DocumentId
    value: {
      id: DocumentId
      name: DocumentName
      version: DocumentVersion
    }
  }
  events: {
    key: [DocumentId, EventId]
    value: {
      documentId: DocumentId
      eventId: EventId
      event: DocumentT
    }
  }
}

async function setupDb<DocumentT>(dbName: string): Promise<IDBPDatabase<DocumentsDB<DocumentT>>> {
  const db = await openDB<DocumentsDB<DocumentT>>(dbName, DATABASE_DOCUMENTS_VERSION, {
    upgrade(db, oldVersion, newVersion, _transaction, _event) {
      if (newVersion !== 1) {
        throw new Error(`Cannot upgrade database from version ${oldVersion} to ${newVersion}.`)
      }

      if (oldVersion === 0) {
        console.debug('Creating database.')
        db.createObjectStore(OBJECT_STORE_METADATA_NAME, {
          keyPath: OBJECT_STORE_METADATA_KEY_PATH,
          autoIncrement: true,
        })

        db.createObjectStore(OBJECT_STORE_EVENT_NAME, {
          keyPath: [OBJECT_STORE_EVENT_DOCUMENT_ID, OBJECT_STORE_EVENT_EVENT_ID],
        })
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
  console.log(`Opened database version with version ${db.version}.`)
  return db
}

export function useDocumentsDb<DocumentT>(dbName: string) {
  return {
    db: setupDb<DocumentT>(dbName),
  }
}

export default function useDocuments<DocumentT>(
  dbAsync: Promise<IDBPDatabase<DocumentsDB<DocumentT>>>,
) {
  const selectedDocumentRef: Ref<Document<DocumentT> | null> = ref(null)
  const documentsRef: Ref<DocumentMetadata[]> = ref([])

  async function updateDocumentRefs(
    tx: IDBPTransaction<
      DocumentsDB<DocumentT>,
      ('metadata' | 'events')[],
      'readonly' | 'readwrite'
    >,
    documentIdToSelect?: DocumentId,
  ) {
    const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
    const nextDocuments = await metadataStore.getAll()
    let nextSelectedDocumentMetadata

    if (documentIdToSelect !== undefined) {
      nextSelectedDocumentMetadata = await metadataStore.get(documentIdToSelect)
    }

    if (nextSelectedDocumentMetadata === undefined) {
      nextSelectedDocumentMetadata = nextDocuments[nextDocuments.length - 1]
    }

    documentsRef.value = nextDocuments
    if (nextSelectedDocumentMetadata !== undefined) {
      selectedDocumentRef.value = {
        metadata: nextSelectedDocumentMetadata,
        content: 'TODO',
      }
    } else {
      selectedDocumentRef.value = null
    }
  }

  async function createDocument(initValue: DocumentT) {
    const db = (await setupPromise).db
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_EVENT_NAME], 'readwrite')
    const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
    const eventStore = tx.objectStore(OBJECT_STORE_EVENT_NAME)

    const version = INITIAL_VERSION
    const name = 'myName'
    const id = await metadataStore.add({
      name: name,
      version: version,
    })
    await eventStore.add({
      documentId: id,
      eventId: getRandomInt(),
      event: initValue,
    })

    await updateDocumentRefs(tx, id)
    notifyUpdate()

    await tx.done
  }

  async function deleteDocument(id: DocumentId) {
    const db = (await setupPromise).db
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_EVENT_NAME], 'readwrite')
    const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
    const eventStore = tx.objectStore(OBJECT_STORE_EVENT_NAME)

    metadataStore.delete(id)
    const range = IDBKeyRange.bound([id, 1], [id, Number.POSITIVE_INFINITY])
    await eventStore.delete(range)

    await updateDocumentRefs(tx, selectedDocumentRef.value?.metadata.id)
    notifyUpdate()

    await tx.done
  }

  async function renameDocument(id: DocumentId, name: string) {
    const db = (await setupPromise).db
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_EVENT_NAME], 'readwrite')
    const documentLoaded = documentsRef.value.find((document) => document.id === id)
    let updated = false
    if (documentLoaded !== undefined) {
      const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
      const metadata = await metadataStore.get(id)
      if (metadata !== undefined) {
        if (metadata.version === documentLoaded.version) {
          metadataStore.put({
            ...metadata,
            name: name,
            version: metadata.version + 1,
          })
          updated = true
        }
      }
    }
    await updateDocumentRefs(tx, selectedDocumentRef.value?.metadata.id)
    if (updated) {
      notifyUpdate()
    }

    await tx.done
  }

  async function selectDocument(id: DocumentId) {
    const db = (await setupPromise).db
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_EVENT_NAME], 'readonly')
    await updateDocumentRefs(tx, id)
    tx.commit()
  }

  let db: IDBPDatabase<DocumentsDB<DocumentT>> | undefined
  const channel = new BroadcastChannel(CHANNEL_DOCUMENTS_NAME)

  function notifyUpdate() {
    channel.postMessage(MESSAGE_UPDATE)
  }

  async function setup() {
    db = await dbAsync

    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_EVENT_NAME], 'readonly')
    await updateDocumentRefs(tx)
    tx.commit()

    return {
      db: db,
    }
  }

  const setupPromise = setup()

  channel.onmessage = async (_event) => {
    const db = (await setupPromise).db
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_EVENT_NAME], 'readonly')
    await updateDocumentRefs(tx, selectedDocumentRef.value?.metadata.id)
    tx.commit()
  }

  onScopeDispose(() => {
    try {
      channel.close()
    } catch {
      console.error('Could not close documents channel.')
    }
    try {
      db?.close()
    } catch {
      console.error('Could not close documents database.')
    }
  })

  return {
    selectedDocument: readonly(selectedDocumentRef),
    documents: readonly(documentsRef),
    createDocument,
    deleteDocument,
    renameDocument,
    selectDocument,
  }
}
