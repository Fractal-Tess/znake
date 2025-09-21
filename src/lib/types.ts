// Shared types for Znake Docker Security Scanner

// ============================================================================
// UNIFIED IMAGE TYPES (Newer, preferred)
// ============================================================================

export type RegistryType = "docker.io" | "ghcr.io" | "local" | "private-registry" | "custom-registry"

export type Image = {
  // Core identification
  id: string
  name: string
  repository: string
  tag: string
  registry: RegistryType
}

// ============================================================================
// REGISTRY-SPECIFIC TYPES
// ============================================================================

// Docker Hub specific types
export type DockerHubSearchResult = {
  repo_name: string
  short_description: string
  star_count: number
  pull_count: number
  is_official: boolean
  is_automated: boolean
}

export type DockerHubImage = {
  repo_name: string
  short_description: string
  star_count: number
  pull_count: number
  repo_owner: string
  is_automated: boolean
  is_official: boolean
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

// GitHub Container Registry specific type
export type GitHubImage = {
  id: number
  name: string
  package_type: "container"
  owner: {
    login: string
    id: number
    avatar_url: string
    html_url: string
  }
  version_count: number
  visibility: "public" | "private"
  url: string
  html_url: string
  created_at: string
  updated_at: string
}

// Local Docker image type (from actual docker images output)
export type LocalDockerImage = {
  Repository: string
  Tag: string
  ImageID: string
  CreatedAt: string
  CreatedSince: string
  Size: string
  VirtualSize: string
  Containers: string
  Digest: string
  SharedSize: string
  UniqueSize: string
}

// ============================================================================
// LEGACY TYPES (Kept for backward compatibility)
// ============================================================================

export type DockerImage = {
  registry: string
  repository: string
  tag: string
  digest?: string
  size?: number
  architecture?: string
  os?: string
}

// ============================================================================
// VULNERABILITY SCANNING TYPES
// ============================================================================

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

// ============================================================================
// SCAN MANAGEMENT TYPES
// ============================================================================

export type ScanStatus = "pending" | "running" | "completed" | "failed"

export type ScanProgress = {
  scanId: number
  status: ScanStatus
  progress: number
  message?: string
  error?: string
}

// ============================================================================
// IMAGE TYPE CONVERTER UTILITIES
// ============================================================================

export class ImageTypeConverter {
  static fromDockerHub(dockerHubImage: DockerHubImage | any): Image {
    return {
      id: dockerHubImage.repo_name,
      name: dockerHubImage.repo_name,
      repository: dockerHubImage.repo_name,
      tag: "latest", // Docker Hub search doesn't include specific tags
      registry: "docker.io",
    }
  }

  static fromGitHub(githubImage: GitHubImage): Image {
    return {
      id: githubImage.id.toString(),
      name: githubImage.name,
      repository: `${githubImage.owner.login}/${githubImage.name}`,
      tag: "latest", // GitHub API doesn't include specific tags in search
      registry: "ghcr.io",
    }
  }

  static fromLocalDocker(localImage: any): Image {
    return {
      id: localImage.id || localImage.ImageID || "",
      name: localImage.repository || localImage.Repository || "",
      repository: localImage.repository || localImage.Repository || "",
      tag: localImage.tag || localImage.Tag || "",
      registry: "local",
    }
  }

  static fromSearchResult(searchResult: import("~/server/registry").SearchImageResult): Image {
    const registryMap = {
      dockerhub: "docker.io" as const,
      github: "ghcr.io" as const,
      local: "local" as const,
      private: "private-registry" as const,
      custom: "custom-registry" as const,
    }

    return {
      id: `${searchResult.name}:${searchResult.tag}`,
      name: searchResult.name,
      repository: searchResult.name,
      tag: searchResult.tag,
      registry: registryMap[searchResult.registry] || searchResult.registry as RegistryType,
    }
  }

  // Convert any registry image to unified format
  static toImage(image: any, registry: RegistryType): Image {
    switch (registry) {
      case "docker.io":
        return this.fromDockerHub(image as DockerHubImage)
      case "ghcr.io":
        return this.fromGitHub(image as GitHubImage)
      case "local":
        return this.fromLocalDocker(image as LocalDockerImage)
      default:
        throw new Error(`Unsupported registry type: ${registry}`)
    }
  }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isDockerHubImage(image: any): image is DockerHubImage {
  return (
    image &&
    typeof image.repo_name === "string" &&
    typeof image.star_count === "number" &&
    typeof image.pull_count === "number"
  )
}

export function isGitHubImage(image: any): image is GitHubImage {
  return (
    image &&
    typeof image.id === "number" &&
    typeof image.name === "string" &&
    image.package_type === "container"
  )
}

export function isLocalDockerImage(image: any): image is LocalDockerImage {
  return (
    image &&
    typeof image.Repository === "string" &&
    typeof image.Tag === "string" &&
    typeof image.ImageID === "string"
  )
}

// Utility to detect registry type from image data
export function detectRegistryType(image: any): RegistryType | null {
  if (isDockerHubImage(image)) return "docker.io"
  if (isGitHubImage(image)) return "ghcr.io"
  if (isLocalDockerImage(image)) return "local"
  return null
}
