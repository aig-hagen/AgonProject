import { type IDBPDatabase, type IDBPTransaction } from 'idb'
import type { Objectish } from 'immer'
import {
  computed,
  type MaybeRef,
  onScopeDispose,
  readonly,
  type Ref,
  ref,
  type ShallowRef,
  shallowRef,
  unref,
  watch,
  watchEffect,
} from 'vue'

import type { ModuleConfig } from '@/app/home/moduleConfig'
import {
  type DocumentId,
  type DocumentMetadata,
  type DocumentsDB,
  OBJECT_STORE_CONTENT_NAME,
  OBJECT_STORE_METADATA_NAME,
} from '@/modules/common/documents/db'
import { generateUUID } from '@/modules/common/ids'
import type { DocumentState } from '@/modules/common/state'

const CHANNEL_DOCUMENTS_METADATA = 'documents'

function getChannelDocumentContent(id: DocumentId) {
  return `document:${id}`
}

export function useDocumentMetadata<DocumentT extends Objectish>(
  db: IDBPDatabase<DocumentsDB>,
  modules: ModuleConfig<DocumentT>[],
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

  async function createDocument(name: string, content?: DocumentT) {
    let rawContent: Objectish = {}
    if (content !== undefined) {
      ;[rawContent] = serializeContent(content, modules)
    }
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_CONTENT_NAME], 'readwrite')
    const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
    const contentStore = tx.objectStore(OBJECT_STORE_CONTENT_NAME)

    // @ts-expect-error id will be autogenrated
    const id = await metadataStore.add({
      name: name,
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

function serializeContent<DocumentT extends Objectish>(
  content: DocumentT,
  modules: ModuleConfig<DocumentT>[],
): [Objectish, ModuleConfig<DocumentT>] {
  for (const module of modules) {
    const rawContent = module.serialize(content)
    if (rawContent !== undefined) {
      return [rawContent, module]
    }
  }
  throw new Error('Could not serialize content: ' + JSON.stringify(content))
}

export function useDocumentContent<DocumentT extends Objectish>(
  db: IDBPDatabase<DocumentsDB>,
  modules: ModuleConfig<DocumentT>[],
  idRef: Readonly<MaybeRef<DocumentId | undefined>>,
) {
  const documentLoadingRef: Ref<boolean> = ref(false)
  const documentId: Ref<number | undefined> = ref(undefined)
  const documentStateRef: ShallowRef<DocumentState<DocumentT> | undefined> = shallowRef(undefined)
  const moduleRef: ShallowRef<ModuleConfig<DocumentT> | undefined> = shallowRef(undefined)

  async function updateDocument(state: DocumentState<DocumentT>) {
    const id = unref(idRef)
    if (id === undefined) {
      return
    }
    const content = state.current.content
    const [rawContent, module] = serializeContent(content, modules)
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
    moduleRef.value = module

    notifyUpdate(id)
  }

  async function loadState(id: DocumentId) {
    const [documentState, module] = await loadDocumentState(db, modules, id)
    documentLoadingRef.value = false
    documentId.value = id
    documentStateRef.value = documentState
    moduleRef.value = module
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
    documentLoadingRef.value = true
    documentId.value = undefined
    documentStateRef.value = undefined
    moduleRef.value = undefined
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
    documentLoading: computed(() => documentLoadingRef.value),
    documentId: computed(() => documentId.value),
    documentState: computed(() => documentStateRef.value),
    documentModule: computed(() => moduleRef.value),
    updateDocument,
  }
}

export async function loadDocumentState<DocumentT extends Objectish>(
  db: IDBPDatabase<DocumentsDB>,
  modules: ModuleConfig<DocumentT>[],
  id: DocumentId,
): Promise<[DocumentState<DocumentT>, ModuleConfig<DocumentT>] | [undefined, undefined]> {
  const tx = db.transaction([OBJECT_STORE_CONTENT_NAME], 'readonly')
  const state = await tx.objectStore(OBJECT_STORE_CONTENT_NAME).get(id)
  await tx.done
  if (state !== undefined) {
    const deserializedContent = state.current.content
    for (const module of modules) {
      const content = module.deserialize(deserializedContent)
      if (content !== undefined) {
        return [
          {
            ...state,
            current: {
              ...state.current,
              content: content,
            },
          },
          module,
        ]
      }
    }
  }
  return [undefined, undefined]
}
