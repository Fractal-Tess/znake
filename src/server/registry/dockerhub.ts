// Docker Hub API client for fetching image information
import type { RegistryService } from "."
import {
  dockerHubSearchResponseSchema,
  dockerHubTagsResponseSchema,
  transformDockerHubSearchResult,
  transformDockerHubTag,
  validateSearchResults,
  validateRepositoryTags,
  validateImageReference,
  type SearchImageResult,
  type RepositoryTag,
  type ImageReference,
} from "./schema"

const DOCKER_HUB_API_BASE = "https://hub.docker.com/v2"

export const dockerHubRegistry: RegistryService = {
  async searchImages(query: string, limit = 25): Promise<SearchImageResult[]> {
    try {
      const url = new URL(`${DOCKER_HUB_API_BASE}/search/repositories/`)
      url.searchParams.set("query", query)
      url.searchParams.set("page_size", limit.toString())

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error(`Docker Hub API error: ${response.status}`)
      }

      const rawData = await response.json()
      const validatedData = dockerHubSearchResponseSchema.parse(rawData)

      const results = validatedData.results.map(transformDockerHubSearchResult)
      return validateSearchResults(results)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Failed to search Docker images")
    }
  },

  async getRepositoryTags(repository: string, limit = 100): Promise<RepositoryTag[]> {
    try {
      const url = new URL(
        `${DOCKER_HUB_API_BASE}/repositories/${repository}/tags/`
      )
      url.searchParams.set("page_size", limit.toString())

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error(`Docker Hub API error: ${response.status}`)
      }

      const rawData = await response.json()
      const validatedData = dockerHubTagsResponseSchema.parse(rawData)

      const results = validatedData.results.map(transformDockerHubTag)
      return validateRepositoryTags(results)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Failed to fetch repository tags")
    }
  },

  parseImageReference(imageRef: string): ImageReference {
    const parts = imageRef.split(":")
    const repository = parts[0]
    const tag = parts[1] || "latest"

    if (!repository) {
      throw new Error("Invalid image reference: missing repository")
    }

    // Handle official images (no namespace)
    const isOfficial = !repository.includes("/")
    const fullRepository = isOfficial ? `library/${repository}` : repository

    const result = {
      registry: "docker.io",
      repository: fullRepository,
      tag,
      fullName: imageRef,
    }

    return validateImageReference(result)
  },
}
