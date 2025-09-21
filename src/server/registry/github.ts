// GitHub Container Registry service implementation
import type { RegistryService } from "."
import {
  validateSearchResults,
  validateRepositoryTags,
  validateImageReference,
  type SearchImageResult,
  type RepositoryTag,
  type ImageReference,
} from "./schema"

export const githubRegistry: RegistryService = {
  async searchImages(query: string, limit = 25): Promise<SearchImageResult[]> {
    // TODO: Implement GitHub Container Registry search
    // This would require GitHub API integration
    console.warn("GitHub Container Registry search not yet implemented")
    return validateSearchResults([])
  },

  async getRepositoryTags(repository: string, limit = 50): Promise<RepositoryTag[]> {
    // TODO: Implement GitHub Container Registry tags fetching
    // This would require GitHub API integration
    console.warn("GitHub Container Registry tags fetching not yet implemented")
    return validateRepositoryTags([])
  },

  parseImageReference(imageRef: string): ImageReference {
    // Basic parsing for ghcr.io images
    const parts = imageRef.split("/")
    if (parts.length < 2 || !parts[0]?.includes("ghcr.io")) {
      throw new Error("Invalid GitHub Container Registry image reference")
    }

    const repository = parts.slice(1, -1).join("/")
    const lastPart = parts[parts.length - 1]
    const tag = lastPart?.includes(":") ? lastPart.split(":")[1] : "latest"

    const result = {
      registry: "ghcr.io",
      repository,
      tag: tag || "latest",
      fullName: imageRef,
    }

    return validateImageReference(result)
  },
}