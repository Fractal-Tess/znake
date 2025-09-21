// Custom registry service implementation
import type { RegistryService } from "."
import {
  validateSearchResults,
  validateRepositoryTags,
  validateImageReference,
  createCustomImageResult,
  type SearchImageResult,
  type RepositoryTag,
  type ImageReference,
} from "./schema"

export const customRegistry: RegistryService = {
  async searchImages(query: string, limit = 25): Promise<SearchImageResult[]> {
    // TODO: Implement custom registry search
    // This would be configurable based on the specific registry type
    console.warn("Custom registry search not yet implemented")
    return validateSearchResults([])
  },

  async getRepositoryTags(repository: string, limit = 50): Promise<RepositoryTag[]> {
    // TODO: Implement custom registry tags fetching
    // This would be configurable based on the specific registry type
    console.warn("Custom registry tags fetching not yet implemented")
    return validateRepositoryTags([])
  },

  parseImageReference(imageRef: string): ImageReference {
    // Generic parsing for custom registry images
    // This is a flexible implementation that can be extended
    const colonIndex = imageRef.lastIndexOf(":")
    const slashIndex = imageRef.indexOf("/")

    let registry = "custom-registry"
    let repository = imageRef
    let tag = "latest"

    if (slashIndex !== -1) {
      // If there's a slash, assume the first part might be a registry
      const firstPart = imageRef.substring(0, slashIndex)
      if (firstPart.includes(".") || firstPart.includes(":")) {
        // Looks like a registry URL
        registry = firstPart
        repository = imageRef.substring(slashIndex + 1)
      }
    }

    if (colonIndex !== -1 && colonIndex > slashIndex) {
      // There's a tag specified
      tag = imageRef.substring(colonIndex + 1)
      repository = repository.substring(0, repository.lastIndexOf(":"))
    }

    if (!repository) {
      throw new Error("Invalid image reference: missing repository")
    }

    const result = {
      registry,
      repository,
      tag,
      fullName: imageRef,
    }

    return validateImageReference(result)
  },
}