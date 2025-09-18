import type { RouterOutputs } from "~/trpc/react"

// Infer types from tRPC router outputs
type ListScansOutput = RouterOutputs["scans"]["listScans"]
type GetScanResultsOutput = RouterOutputs["scans"]["getScanResults"]

// Extract the scan data type from the successful response
export type ScanData = NonNullable<ListScansOutput["data"]>[0]

// Extract the scan results data type
export type ScanResultsData = NonNullable<GetScanResultsOutput["data"]>

// Extract vulnerability data type
export type VulnerabilityData = ScanResultsData["vulnerabilities"][0]

// Extract statistics data type
export type VulnerabilityStats = ScanResultsData["stats"]

// Chart data type for vulnerability distribution
export type ChartDataItem = {
  name: string
  value: number
  color: string
}

// Scan status enum
export type ScanStatus = "pending" | "running" | "completed" | "failed"

// Vulnerability severity enum
export type VulnerabilitySeverity =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "UNKNOWN"

// Scan metadata type (from JSON field)
export type ScanMetadata = {
  vulnerabilityCount?: number
  stats?: {
    critical: number
    high: number
    medium: number
    low: number
    unknown?: number
  }
}

// Type guard for scan metadata
export const isScanMetadata = (metadata: unknown): metadata is ScanMetadata => {
  return (
    metadata !== null &&
    typeof metadata === "object" &&
    "vulnerabilityCount" in metadata
  )
}

// Type guard for vulnerability severity
export const isVulnerabilitySeverity = (
  severity: string
): severity is VulnerabilitySeverity => {
  return ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"].includes(severity)
}
