import { immerable } from 'immer'
import { type ArgumentId } from '../argumentation/model'

export type NodeId = number
export class DirectedGraph<NodeDataT, EdgeDataT> {
  [immerable] = true
  constructor(
    /**
     * By node ID node data
     */
    private v = new Map<NodeId, NodeDataT>(),
    /**
     * By source node ID by target node ID edge data.
     */
    private e = new Map<NodeId, Map<NodeId, EdgeDataT>>(),
  ) {}
  setNode(nodeId: NodeId, data: NodeDataT) {
    this.v.set(nodeId, data)
    this.e.set(nodeId, new Map())
  }

  deleteNode(nodeId: NodeId) {
    this.v.delete(nodeId)
    this.e.delete(nodeId)
    for (const byTargetIdEdgeData of this.e.values()) {
      byTargetIdEdgeData.delete(nodeId)
    }
  }

  setEdge(sourceId: NodeId, targetId: NodeId, data: EdgeDataT) {
    const byTargetIdEdgeData = this.e.get(sourceId)
    if (byTargetIdEdgeData === undefined) {
      throw new Error(`Source node not found: Node with ID '${sourceId}' does not exist.`)
    }
    if (!this.v.has(targetId)) {
      throw new Error(`Target node not found: Node with ID '${targetId}' does not exist.`)
    }
    byTargetIdEdgeData.set(targetId, data)
  }

  deleteEdge(sourceId: NodeId, targetId: NodeId) {
    const byTargetIdEdgeData = this.e.get(sourceId)
    if (byTargetIdEdgeData === undefined) {
      return
    }
    byTargetIdEdgeData.delete(targetId)
  }

  hasEdge(sourceId: NodeId, targetId: NodeId) {
    const byTargetIdEdgeData = this.e.get(sourceId)
    if (byTargetIdEdgeData === undefined) {
      return false
    }
    return byTargetIdEdgeData.has(targetId)
  }

  getEdge(sourceId: NodeId, targetId: NodeId): EdgeDataT {
    const byTargetIdEdgeData = this.e.get(sourceId)
    if (byTargetIdEdgeData === undefined) {
      throw new Error(`Edge not found: Node with ID '${sourceId}' does not exist.`)
    }
    if (byTargetIdEdgeData.has(targetId)) {
      return byTargetIdEdgeData.get(targetId)!
    }
    throw new Error(
      `Edge not found: Edge with source ID '${sourceId}' and target ID '${targetId}' does not exist.`,
    )
  }

  getNode(nodeId: NodeId): NodeDataT {
    if (this.v.has(nodeId)) {
      return this.v.get(nodeId)!
    }
    throw new Error(`Node not found: Node with ID '${nodeId}' does not exist.`)
  }

  nodes(): IterableIterator<[id: ArgumentId, data: NodeDataT]> {
    return this.v.entries()
  }

  *edges(): IterableIterator<[sourceId: NodeId, targetId: NodeId, data: EdgeDataT]> {
    for (const [sourceId, byTargetIdEdgeData] of this.e) {
      for (const [targetId, edgeData] of byTargetIdEdgeData) {
        yield [sourceId, targetId, edgeData]
      }
    }
  }
}
