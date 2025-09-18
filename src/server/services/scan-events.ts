// Event emitter for scan progress updates
import { EventEmitter, on } from "node:events"

import type { ScanStage } from "~/lib/scan-stages"

export type ScanProgressEvent = {
  scanId: number
  status: "pending" | "running" | "completed" | "failed"
  stage: ScanStage
  progress: number // Calculated from stage
  message: string
  error?: string
}

// Global event emitter for scan updates
export const scanEvents = new EventEmitter()

// Helper functions for emitting events
export const emitScanUpdate = (event: ScanProgressEvent) => {
  scanEvents.emit(`scan-${event.scanId}`, event)
  scanEvents.emit("scan-update", event)
}

// Create async iterable for scan updates
export const createScanUpdateIterator = (
  scanId: number,
  signal?: AbortSignal
) => {
  const eventName = `scan-${scanId}`
  return on(scanEvents, eventName, { signal })
}
