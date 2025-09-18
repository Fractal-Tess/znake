// Docker Hub API router for tRPC
import { DockerHubClient } from "~/lib/docker-hub"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { z } from "zod"

export const dockerRouter = createTRPCRouter({
  // Search for Docker images on Docker Hub
  searchImages: publicProcedure
    .input(
      z.object({
        query: z.string().min(1, "Search query is required"),
        limit: z.number().min(1).max(100).default(25),
      })
    )
    .query(async ({ input }) => {
      try {
        const results = await DockerHubClient.searchImages(
          input.query,
          input.limit
        )
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
  getRepositoryTags: publicProcedure
    .input(
      z.object({
        repository: z.string().min(1, "Repository is required"),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const tags = await DockerHubClient.getRepositoryTags(
          input.repository,
          input.limit
        )
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

  // Get specific tag information
  getTagInfo: publicProcedure
    .input(
      z.object({
        repository: z.string().min(1, "Repository is required"),
        tag: z.string().min(1, "Tag is required"),
      })
    )
    .query(async ({ input }) => {
      try {
        const tagInfo = await DockerHubClient.getTagInfo(
          input.repository,
          input.tag
        )
        return {
          success: true,
          data: tagInfo,
        }
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch tag info",
        }
      }
    }),

  // Parse image reference
  parseImageReference: publicProcedure
    .input(
      z.object({
        imageRef: z.string().min(1, "Image reference is required"),
      })
    )
    .query(({ input }) => {
      try {
        const parsed = DockerHubClient.parseImageReference(input.imageRef)
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
})
