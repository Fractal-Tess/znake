// Docker Hub API client for fetching image information
import type { DockerHubSearchResult, DockerHubTagsResult } from "./types"

const DOCKER_HUB_API_BASE = "https://hub.docker.com/v2"

export class DockerHubClient {
  // Search for Docker images
  static async searchImages(
    query: string,
    limit = 25
  ): Promise<DockerHubSearchResult[]> {
    try {
      const url = new URL(`${DOCKER_HUB_API_BASE}/search/repositories/`)
      url.searchParams.set("query", query)
      url.searchParams.set("page_size", limit.toString())

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error(`Docker Hub API error: ${response.status}`)
      }

      const data = (await response.json()) as {
        results: DockerHubSearchResult[]
      }
      return data.results || []
    } catch (_error) {
      throw new Error("Failed to search Docker images")
    }
  }

  // Get tags for a specific repository
  static async getRepositoryTags(
    repository: string,
    limit = 100
  ): Promise<DockerHubTagsResult[]> {
    try {
      const url = new URL(
        `${DOCKER_HUB_API_BASE}/repositories/${repository}/tags/`
      )
      url.searchParams.set("page_size", limit.toString())

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error(`Docker Hub API error: ${response.status}`)
      }

      const data = (await response.json()) as {
        results: DockerHubTagsResult[]
      }
      return data.results || []
    } catch (_error) {
      throw new Error("Failed to fetch repository tags")
    }
  }

  // Get specific tag information
  static async getTagInfo(
    repository: string,
    tag: string
  ): Promise<DockerHubTagsResult | null> {
    try {
      const url = `${DOCKER_HUB_API_BASE}/repositories/${repository}/tags/${tag}/`
      const response = await fetch(url)

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Docker Hub API error: ${response.status}`)
      }

      return (await response.json()) as DockerHubTagsResult
    } catch (_error) {
      throw new Error("Failed to fetch tag information")
    }
  }

  // Parse full image reference (e.g., "ubuntu:22.04" or "nginx:latest")
  static parseImageReference(imageRef: string) {
    const parts = imageRef.split(":")
    const repository = parts[0]
    const tag = parts[1] || "latest"

    if (!repository) {
      throw new Error("Invalid image reference: missing repository")
    }

    // Handle official images (no namespace)
    const isOfficial = !repository.includes("/")
    const fullRepository = isOfficial ? `library/${repository}` : repository

    return {
      registry: "docker.io",
      repository: fullRepository,
      tag,
      original: imageRef,
    }
  }
}
