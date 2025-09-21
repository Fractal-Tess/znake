// Unified image search router for all registries
import { z } from "zod"

import {
  dockerHubRegistry,
  githubRegistry,
  localRegistry,
  privateRegistry,
  customRegistry,
  registryTypeSchema,
  createApiResponseSchema,
  searchResultsArraySchema,
  repositoryTagsArraySchema,
  imageReferenceSchema,
} from "~/server/registry"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

const registryMap = {
  dockerhub: dockerHubRegistry,
  github: githubRegistry,
  local: localRegistry,
  private: privateRegistry,
  custom: customRegistry,
} as const

export const imagesRouter = createTRPCRouter({
  // Search for images in a specific registry
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1, "Search query is required"),
        registry: registryTypeSchema,
        limit: z.number().min(1).max(100).default(25),
      })
    )
    .query(async ({ input }) => {
      try {
        const { query, registry, limit } = input
        const registryService = registryMap[registry]
        const results = await registryService.searchImages(query, limit)

        return {
          success: true,
          data: results,
        }
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to search images",
        }
      }
    }),

  // Get tags for a repository
  getTags: publicProcedure
    .input(
      z.object({
        repository: z.string().min(1, "Repository is required"),
        registry: registryTypeSchema,
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const { repository, registry, limit } = input
        const registryService = registryMap[registry]
        const tags = await registryService.getRepositoryTags(repository, limit)

        return {
          success: true,
          data: tags,
        }
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch tags",
        }
      }
    }),

  // Parse image reference
  parseReference: publicProcedure
    .input(
      z.object({
        imageRef: z.string().min(1, "Image reference is required"),
        registry: registryTypeSchema.default("dockerhub"),
      })
    )
    .query(({ input }) => {
      try {
        const { imageRef, registry } = input
        const registryService = registryMap[registry]
        const parsed = registryService.parseImageReference(imageRef)

        return {
          success: true,
          data: parsed,
        }
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to parse image reference",
        }
      }
    }),

  // List local images (convenience method)
  listLocal: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        // For local images, we can list all without a query
        const results = await localRegistry.searchImages("", input.limit)
        return {
          success: true,
          data: results,
        }
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to list local Docker images. Make sure Docker is running.",
        }
      }
    }),
})