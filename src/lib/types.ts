// Shared types for Znake Docker Security Scanner

export type DockerImage = {
  registry: string
  repository: string
  tag: string
  digest?: string
  size?: number
  architecture?: string
  os?: string
}

export type DockerHubSearchResult = {
  repo_name: string
  short_description: string
  star_count: number
  pull_count: number
  is_official: boolean
  is_automated: boolean
}

export type DockerHubTagsResult = {
  name: string
  full_size: number
  images: Array<{
    architecture: string
    os: string
    size: number
    digest: string
  }>
  last_updated: string
}

export type TrivyVulnerability = {
  VulnerabilityID: string
  Severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN"
  Title: string
  Description: string
  PkgName: string
  InstalledVersion: string
  FixedVersion?: string
  PublishedDate?: string
  LastModifiedDate?: string
  References?: string[]
  CVSS?: {
    [key: string]: {
      V3Score?: number
    }
  }
}

export type TrivyResult = {
  Target: string
  Class: string
  Type: string
  Vulnerabilities?: TrivyVulnerability[]
}

export type TrivyScanOutput = {
  SchemaVersion: number
  ArtifactName: string
  ArtifactType: string
  Results?: TrivyResult[]
}

export type ScanStatus = "pending" | "running" | "completed" | "failed"

export type ScanProgress = {
  scanId: number
  status: ScanStatus
  progress: number
  message?: string
  error?: string
}

export type LocalDockerImage = {
  id: string
  repository: string
  tag: string
  imageId: string
  created: string
  size: number
  labels?: Record<string, string>
}
