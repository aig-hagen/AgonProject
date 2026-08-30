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
  OBJECT_STORE_UI_STATE_NAME,
} from '@/modules/common/documents/db'
import { generateUUID } from '@/modules/common/ids'
import { notifyStorageFailureOnce } from '@/modules/common/notifications/storageFailure'
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
      (
        | typeof OBJECT_STORE_METADATA_NAME
        | typeof OBJECT_STORE_CONTENT_NAME
        | typeof OBJECT_STORE_UI_STATE_NAME
      )[],
      'readonly' | 'readwrite'
    >,
  ): Promise<DocumentMetadata[]> {
    const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
    const nextDocuments = await metadataStore.getAll()
    return nextDocuments
  }

  async function createDocument(name: string, content?: DocumentT) {
    let rawContent: Objectish = {}
    let type: string | undefined
    if (content !== undefined) {
      let module: ModuleConfig<DocumentT>
      ;[rawContent, module] = serializeContent(content, modules)
      type = module.newNamePrefix
    }
    const tx = db.transaction([OBJECT_STORE_METADATA_NAME, OBJECT_STORE_CONTENT_NAME], 'readwrite')
    const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
    const contentStore = tx.objectStore(OBJECT_STORE_CONTENT_NAME)

    // @ts-expect-error id will be autogenrated
    const id = await metadataStore.add({
      name: name,
      lastEdited: Date.now(),
      ...(type !== undefined ? { type } : {}),
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
    const tx = db.transaction(
      [OBJECT_STORE_METADATA_NAME, OBJECT_STORE_CONTENT_NAME, OBJECT_STORE_UI_STATE_NAME],
      'readwrite',
    )
    const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
    const contentStore = tx.objectStore(OBJECT_STORE_CONTENT_NAME)
    const uiStateStore = tx.objectStore(OBJECT_STORE_UI_STATE_NAME)

    await metadataStore.delete(id)
    await contentStore.delete(id)
    await uiStateStore.delete(id)

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
          ...metadata,
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

export const LAST_SELECTED_DOCUMENT_KEY = 'last-selected-document'

export function useSelectedDocumentId(documentsRef: Readonly<Ref<Readonly<DocumentMetadata[]>>>) {
  const selectedDocumentRef = shallowRef<DocumentId | undefined>(undefined)

  let stored: string | null = null
  try {
    stored = localStorage.getItem(LAST_SELECTED_DOCUMENT_KEY)
  } catch (error) {
    notifyStorageFailureOnce(error)
  }
  let pendingId: DocumentId | undefined = stored !== null ? Number(stored) : undefined

  function selectDocument(id: DocumentId | undefined) {
    pendingId = id
    resolve()
  }

  function resolve() {
    const documents = unref(documentsRef)
    let newDocument
    if (pendingId !== undefined) {
      newDocument = documents.find((document) => document.id === pendingId)
    }
    if (newDocument === undefined) {
      newDocument = documents[documents.length - 1]
    }
    selectedDocumentRef.value = newDocument?.id
    if (newDocument?.id !== undefined) {
      try {
        localStorage.setItem(LAST_SELECTED_DOCUMENT_KEY, String(newDocument.id))
      } catch (error) {
        notifyStorageFailureOnce(error)
      }
    }
  }

  watch(documentsRef, resolve)
  resolve()

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

  // Notifies the metadata list so an edit's new `lastEdited`/`type` shows up there.
  const metadataChannel = new BroadcastChannel(CHANNEL_DOCUMENTS_METADATA)

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
    const tx = db.transaction([OBJECT_STORE_CONTENT_NAME, OBJECT_STORE_METADATA_NAME], 'readwrite')
    const contentStore = tx.objectStore(OBJECT_STORE_CONTENT_NAME)
    await contentStore.put(rawState, id)
    const metadataStore = tx.objectStore(OBJECT_STORE_METADATA_NAME)
    const metadata = await metadataStore.get(id)
    if (metadata !== undefined) {
      // Type is set once (blank docs learn it on first write); it never changes afterwards.
      await metadataStore.put({
        ...metadata,
        lastEdited: Date.now(),
        type: metadata.type ?? module.newNamePrefix,
      })
    }
    await tx.done
    documentStateRef.value = state
    moduleRef.value = module

    notifyUpdate(id)
    metadataChannel.postMessage(undefined)
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
    metadataChannel.close()
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
