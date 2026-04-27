import {
  computed,
  onScopeDispose,
  readonly,
  ref,
  shallowRef,
  unref,
  watch,
  watchEffect,
  type MaybeRef,
  type Ref,
} from 'vue'
import { type IDBPDatabase, type IDBPTransaction } from 'idb'
import {
  OBJECT_STORE_CONTENT_NAME,
  OBJECT_STORE_METADATA_NAME,
  type DocumentId,
  type DocumentMetadata,
  type DocumentsDB,
} from './db'
import type { ModuleConfig } from '@/main'
import { generateUUID } from '@/modules/common/ids'
import type { DocumentState } from '@/modules/common/state'
import type { Objectish } from 'immer'

const CHANNEL_DOCUMENTS_METADATA = 'documents'

function getChannelDocumentContent(id: DocumentId) {
  return `document:${id}`
}

export function useDocumentMetadata(
  db: IDBPDatabase<DocumentsDB>,
  modules: ModuleConfig<Objectish>[],
) {
  const documentsRef: Ref<DocumentMetadata[]> = ref([])

  async function getNewMetadata(
    tx: IDBPTransaction<
      DocumentsDB,
      (typeof OBJECT_STORE_METADATA_NAME | typeof OBJECT_STORE_CONTENT_NAME)[],
      'readonly' | 'readwrite'
    >,
  ): Promise<DocumentMetadata[]> {
    const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
    const nextDocuments = await metadataStore.getAll()
    return nextDocuments
  }

  async function createDocument(content?: Objectish) {
    let rawContent: Objectish = {}
    if (content !== undefined) {
      rawContent = serializeContent(content, modules)
    }
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_CONTENT_NAME], 'readwrite')
    const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
    const contentStore = tx.objectStore(OBJECT_STORE_CONTENT_NAME)

    // @ts-expect-error id will be autogenrated
    const id = await metadataStore.add({
      name: '',
    })
    await contentStore.add(
      {
        stateId: generateUUID(),
        changes: [],
        inverseChanges: [],
        current: {
          changeIdx: -1,
          content: rawContent,
        },
      },
      id,
    )
    const newMetadata = await getNewMetadata(tx)
    await tx.done
    documentsRef.value = newMetadata
    notifyUpdate()
    return id
  }

  async function deleteDocument(id: DocumentId) {
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_CONTENT_NAME], 'readwrite')
    const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
    const contentStore = tx.objectStore(OBJECT_STORE_CONTENT_NAME)

    await metadataStore.delete(id)
    await contentStore.delete(id)

    const newMetadata = await getNewMetadata(tx)
    await tx.done
    documentsRef.value = newMetadata
    notifyUpdate()
  }

  async function renameDocument(id: DocumentId, name: string) {
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_CONTENT_NAME], 'readwrite')
    const documentLoaded = documentsRef.value.find((document) => document.id === id)
    let updated = false
    if (documentLoaded !== undefined) {
      const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
      const metadata = await metadataStore.get(id)
      if (metadata !== undefined) {
        await metadataStore.put({
          id: id,
          name: name,
        })
        updated = true
      }
    }
    const newMetadata = await getNewMetadata(tx)
    await tx.done
    documentsRef.value = newMetadata
    if (updated) {
      notifyUpdate()
    }
  }

  const channel = new BroadcastChannel(CHANNEL_DOCUMENTS_METADATA)

  function notifyUpdate() {
    channel.postMessage(undefined)
  }

  channel.onmessage = async (_event) => {
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_CONTENT_NAME], 'readonly')
    const newMetadata = await getNewMetadata(tx)
    await tx.done
    documentsRef.value = newMetadata
  }

  onScopeDispose(() => {
    try {
      channel.close()
    } catch {
      console.error('Could not close documents channel.')
    }
  })

  async function init() {
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_CONTENT_NAME], 'readonly')
    const newMetadata = await getNewMetadata(tx)
    await tx.done
    documentsRef.value = newMetadata
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

function serializeContent(content: Objectish, modules: ModuleConfig<Objectish>[]) {
  for (const module of modules) {
    const rawContent = module.serialize(content)
    if (rawContent !== undefined) {
      return rawContent
    }
  }
  throw new Error('Could not serialize content: ' + JSON.stringify(content))
}

export function useDocumentContent(
  db: IDBPDatabase<DocumentsDB>,
  modules: ModuleConfig<Objectish>[],
  idRef: Readonly<MaybeRef<DocumentId | undefined>>,
) {
  const documentStateRef: Ref<DocumentState<Objectish> | undefined> = shallowRef(undefined)

  async function updateDocument(state: DocumentState<Objectish>) {
    const id = unref(idRef)
    if (id === undefined) {
      return
    }
    const content = state.current.content
    const rawContent = serializeContent(content, modules)
    const rawState: DocumentState<Objectish> = {
      ...state,
      current: {
        ...state.current,
        content: rawContent,
      },
    }
    const tx = db.transaction([OBJECT_STORE_CONTENT_NAME], 'readwrite')
    const contentStore = tx.objectStore(OBJECT_STORE_CONTENT_NAME)
    await contentStore.put(rawState, id)
    await tx.done
    documentStateRef.value = state
    notifyUpdate(id)
  }

  async function loadState(id: DocumentId) {
    const tx = db.transaction([OBJECT_STORE_CONTENT_NAME], 'readonly')
    const state = await tx.objectStore(OBJECT_STORE_CONTENT_NAME).get(id)
    await tx.done
    if (state !== undefined) {
      const deserializedContent = state.current.content
      for (const module of modules) {
        const content = module.deserialize(deserializedContent)
        if (content !== undefined) {
          state.current.content = content
          documentStateRef.value = state
          return
        }
      }
    }
    documentStateRef.value = undefined
  }

  const channels: Record<DocumentId, BroadcastChannel> = Object.create(null)

  function closeAndDeleteAllChannels() {
    for (const id in channels) {
      channels[id]?.close()
      delete channels[id]
    }
  }

  watchEffect(() => {
    closeAndDeleteAllChannels()
    documentStateRef.value = undefined
    const id = unref(idRef)
    if (id !== undefined) {
      const channel = new BroadcastChannel(getChannelDocumentContent(id))
      channels[id] = channel
      channel.onmessage = (_event) => {
        void loadState(id)
      }
      void loadState(id)
    }
  })

  function notifyUpdate(id: DocumentId) {
    channels[id]?.postMessage(undefined)
  }

  onScopeDispose(() => {
    closeAndDeleteAllChannels()
  })

  return {
    documentState: computed(() => documentStateRef.value),
    updateDocument,
  }
}
