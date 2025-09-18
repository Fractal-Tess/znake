// GitHub Container Registry router for tRPC
import { z } from "zod"

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

export const githubRouter = createTRPCRouter({
  // Search for images in GitHub Container Registry
  searchImages: publicProcedure
    .input(
      z.object({
        query: z.string().min(1, "Search query is required"),
        limit: z.number().min(1).max(100).default(25),
      })
    )
    .query(async ({ input }) => {
      try {
        // TODO: Implement GitHub Container Registry search
        // This would require GitHub API integration
        return {
          success: true,
          data: [],
        }
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to search images",
        }
      }
    }),

  // Get tags for a GitHub Container Registry repository
  getRepositoryTags: publicProcedure
    .input(
      z.object({
        repository: z.string().min(1, "Repository is required"),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        // TODO: Implement GitHub Container Registry tags fetching
        // This would require GitHub API integration
        return {
          success: true,
          data: [],
        }
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch tags",
        }
      }
    }),

  // Parse GitHub Container Registry image reference
  parseImageReference: publicProcedure
    .input(
      z.object({
        imageRef: z.string().min(1, "Image reference is required"),
      })
    )
    .query(({ input }) => {
      try {
        // Basic parsing for ghcr.io images
        const parts = input.imageRef.split("/")
        if (parts.length < 2 || !parts[0]?.includes("ghcr.io")) {
          throw new Error("Invalid GitHub Container Registry image reference")
        }

        const repository = parts.slice(1, -1).join("/")
        const lastPart = parts[parts.length - 1]
        const tag = lastPart?.includes(":") ? lastPart.split(":")[1] : "latest"

        return {
          success: true,
          data: {
            registry: "ghcr.io",
            repository,
            tag,
            fullName: input.imageRef,
          },
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
})
