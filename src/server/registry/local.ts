// Local Docker registry service implementation
import Docker from "dockerode"
import type { RegistryService } from "."
import {
  validateSearchResults,
  validateRepositoryTags,
  validateImageReference,
  createLocalImageResult,
  type SearchImageResult,
  type RepositoryTag,
  type ImageReference,
} from "./schema"

const docker = new Docker()

// Helper functions
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} days ago`
  if (hours > 0) return `${hours} hours ago`
  if (minutes > 0) return `${minutes} minutes ago`
  return `${seconds} seconds ago`
}

export const localRegistry: RegistryService = {
  async searchImages(query: string, limit = 25): Promise<SearchImageResult[]> {
    try {
      const images = await docker.listImages({ all: false })

      const filteredImages = images
        .filter((image) => {
          const repoTag = image.RepoTags?.[0] || "<none>:<none>"
          return repoTag.toLowerCase().includes(query.toLowerCase())
        })
        .map((image) => {
          const repoTag = image.RepoTags?.[0] || "<none>:<none>"
          const [repository, tag] = repoTag.split(":")

          return createLocalImageResult(
            repository || "<none>",
            tag || "latest",
            {
              description: `Local Docker image (${formatBytes(image.Size || 0)})`,
              size: image.Size || 0,
              lastUpdated: new Date(image.Created * 1000).toISOString(),
              digest: image.RepoDigests?.[0]?.split("@")[1],
            }
          )
        })
        .slice(0, limit)

      return validateSearchResults(filteredImages)
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to list local Docker images. Make sure Docker is running."
      )
    }
  },

  async getRepositoryTags(repository: string, limit = 50): Promise<RepositoryTag[]> {
    try {
      const images = await docker.listImages({ all: false })

      const tags = images
        .filter((image) => {
          const repoTag = image.RepoTags?.[0] || "<none>:<none>"
          const [repo] = repoTag.split(":")
          return repo === repository
        })
        .map((image) => {
          const repoTag = image.RepoTags?.[0] || "<none>:<none>"
          const [, tag] = repoTag.split(":")

          return {
            name: tag || "latest",
            size: image.Size || 0,
            lastUpdated: new Date(image.Created * 1000).toISOString(),
            digest: image.RepoDigests?.[0]?.split("@")[1],
            architectures: ["amd64"], // Docker doesn't provide this info easily
          }
        })
        .slice(0, limit)

      return validateRepositoryTags(tags)
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to list local Docker image tags. Make sure Docker is running."
      )
    }
  },

  parseImageReference(imageRef: string): ImageReference {
    const parts = imageRef.split(":")
    const repository = parts[0]
    const tag = parts[1] || "latest"

    if (!repository) {
      throw new Error("Invalid image reference: missing repository")
    }

    const result = {
      registry: "local",
      repository,
      tag,
      fullName: imageRef,
    }

    return validateImageReference(result)
  },
}