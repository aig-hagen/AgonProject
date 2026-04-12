import { onScopeDispose, readonly, ref, shallowRef, unref, watch, type Ref } from 'vue'
import { type IDBPDatabase, type IDBPTransaction } from 'idb'
import {
  OBJECT_STORE_CONTENT_NAME,
  OBJECT_STORE_METADATA_NAME,
  type DocumentId,
  type DocumentMetadata,
  type DocumentsDB,
} from './db'

const CHANNEL_DOCUMENTS_NAME = 'documents'

export default function useDocuments(db: IDBPDatabase<DocumentsDB>) {
  const documentsRef: Ref<DocumentMetadata[]> = ref([])

  async function updateDocumentRefs(
    tx: IDBPTransaction<
      DocumentsDB,
      (typeof OBJECT_STORE_METADATA_NAME | typeof OBJECT_STORE_CONTENT_NAME)[],
      'readonly' | 'readwrite'
    >,
  ) {
    const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
    const nextDocuments = await metadataStore.getAll()
    documentsRef.value = nextDocuments
  }

  async function createDocument() {
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_CONTENT_NAME], 'readwrite')
    const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
    const contentStore = tx.objectStore(OBJECT_STORE_CONTENT_NAME)

    // @ts-expect-error id will be autogenrated
    const id = await metadataStore.add({
      name: '',
    })
    await contentStore.add(
      {
        type: 'EMPTY',
        content: null,
      },
      id,
    )

    await updateDocumentRefs(tx)
    notifyUpdate()

    await tx.done
  }

  async function deleteDocument(id: DocumentId) {
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_CONTENT_NAME], 'readwrite')
    const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
    const contentStore = tx.objectStore(OBJECT_STORE_CONTENT_NAME)

    await metadataStore.delete(id)
    await contentStore.delete(id)

    await updateDocumentRefs(tx)
    notifyUpdate()

    await tx.done
  }

  async function renameDocument(id: DocumentId, name: string) {
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_CONTENT_NAME], 'readwrite')
    const documentLoaded = documentsRef.value.find((document) => document.id === id)
    let updated = false
    if (documentLoaded !== undefined) {
      const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
      const metadata = await metadataStore.get(id)
      if (metadata !== undefined) {
        metadataStore.put({
          id: id,
          name: name,
        })
        updated = true
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
    channel.postMessage(undefined)
  }

  channel.onmessage = async (_event) => {
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_CONTENT_NAME], 'readonly')
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
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_CONTENT_NAME], 'readonly')
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
