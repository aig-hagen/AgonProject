import {
  initCustomFormatter,
  onScopeDispose,
  onUnmounted,
  readonly,
  ref,
  shallowRef,
  unref,
  watch,
  type Ref,
} from 'vue'
import { openDB, type IDBPDatabase, type DBSchema, type IDBPTransaction } from 'idb'

const CHANNEL_DOCUMENTS_NAME = 'documents'
const DATABASE_DOCUMENTS_VERSION = 1

const OBJECT_STORE_METADATA_NAME = 'metadata'
const OBJECT_STORE_METADATA_KEY_PATH = 'id'

const OBJECT_STORE_EVENT_NAME = 'events'
const OBJECT_STORE_EVENT_DOCUMENT_ID = 'documentId'
const OBJECT_STORE_EVENT_EVENT_ID = 'id'

const MESSAGE_UPDATE = 'update'

const INITIAL_VERSION = 0

export type DocumentId = number
type DocumentVersion = number
type DocumentName = string
type EventId = number

export interface DocumentMetadata {
  id: DocumentId
  name: DocumentName
  metadataVersion: DocumentVersion
  dataVersion: DocumentVersion
}

export interface Event {
  type: string
  data: unknown
}

export interface DocumentCreated extends Event {
  type: 'DOCUMENT_CREATED'
}

function documentCreatedEvent(): DocumentCreated {
  return {
    type: 'DOCUMENT_CREATED',
    data: {},
  }
}

function isDocumentCreated(event: Event): event is DocumentCreated {
  return event.type === 'DOCUMENT_CREATED'
}

// todo layout
// todo move
// todo rename

export interface DocumentsDB extends DBSchema {
  metadata: {
    key: DocumentId
    value: {
      id: DocumentId
      name: DocumentName
      // TODO name metadata version
      metadataVersion: DocumentVersion
      dataVersion: DocumentVersion
    }
  }
  events: {
    key: [DocumentId, EventId]
    value: {
      documentId: DocumentId
      id: EventId
    } & Event
  }
}

// TODO extract into database file
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
  console.debug(`Opened database version with version ${db.version}.`)
  return db
}

export default function useDocuments(db: IDBPDatabase<DocumentsDB>) {
  const documentsRef: Ref<DocumentMetadata[]> = ref([])

  async function updateDocumentRefs(
    tx: IDBPTransaction<DocumentsDB, ('metadata' | 'events')[], 'readonly' | 'readwrite'>,
  ) {
    const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
    const nextDocuments = await metadataStore.getAll()
    documentsRef.value = nextDocuments
  }

  async function createDocument() {
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_EVENT_NAME], 'readwrite')
    const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
    const eventStore = tx.objectStore(OBJECT_STORE_EVENT_NAME)

    const version = INITIAL_VERSION
    const id = await metadataStore.add({
      name: '',
      metadataVersion: version,
      dataVersion: INITIAL_VERSION,
    })
    await eventStore.add({
      documentId: id,
      id: INITIAL_VERSION,
      ...documentCreatedEvent(),
    })

    await updateDocumentRefs(tx)
    notifyUpdate()

    await tx.done
  }

  async function deleteDocument(id: DocumentId) {
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_EVENT_NAME], 'readwrite')
    const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
    const eventStore = tx.objectStore(OBJECT_STORE_EVENT_NAME)

    metadataStore.delete(id)
    const range = IDBKeyRange.bound([id, INITIAL_VERSION], [id, Number.POSITIVE_INFINITY])
    await eventStore.delete(range)

    await updateDocumentRefs(tx)
    notifyUpdate()

    await tx.done
  }

  async function renameDocument(id: DocumentId, name: string) {
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_EVENT_NAME], 'readwrite')
    const documentLoaded = documentsRef.value.find((document) => document.id === id)
    let updated = false
    if (documentLoaded !== undefined) {
      const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
      const metadata = await metadataStore.get(id)
      if (metadata !== undefined) {
        if (metadata.metadataVersion === documentLoaded.metadataVersion) {
          metadataStore.put({
            ...metadata,
            name: name,
            metadataVersion: metadata.metadataVersion + 1,
          })
          updated = true
        }
      }
    }
    await updateDocumentRefs(tx)
    if (updated) {
      notifyUpdate()
    }

    await tx.done
  }

  const channel = new BroadcastChannel(CHANNEL_DOCUMENTS_NAME)

  function notifyUpdate() {
    channel.postMessage(MESSAGE_UPDATE)
  }

  channel.onmessage = async (_event) => {
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_EVENT_NAME], 'readonly')
    await updateDocumentRefs(tx)
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

  async function init() {
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_EVENT_NAME], 'readonly')
    await updateDocumentRefs(tx)
    tx.commit()
  }

  void init()

  return {
    documents: readonly(documentsRef),
    createDocument,
    deleteDocument,
    renameDocument,
  }
}

export function useSelectedDocumentId(documentsRef: Readonly<Ref<Readonly<DocumentMetadata[]>>>) {
  const selectedDocumentRef = shallowRef<DocumentId | undefined>(undefined)

  function selectDocument(id: DocumentId | undefined) {
    const documents = unref(documentsRef)
    let newDocument
    if (id !== undefined) {
      newDocument = documents.find((document) => document.id === id)
    }
    if (newDocument === undefined) {
      newDocument = documents[documents.length - 1]
    }
    selectedDocumentRef.value = newDocument?.id
  }

  watch(documentsRef, () => {
    selectDocument(selectedDocumentRef.value)
  })

  selectDocument(undefined)

  return {
    selectedDocumentId: readonly(selectedDocumentRef),
    selectDocument,
  }
}
