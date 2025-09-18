// Local Docker images router for tRPC
import Docker from "dockerode"
import { z } from "zod"

import type { LocalDockerImage } from "~/lib/types"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

// Initialize Docker client
const docker = new Docker()

export const localRouter = createTRPCRouter({
  // Check if Docker is available
  checkDockerAvailability: publicProcedure.query(async () => {
    try {
      await docker.ping()
      return {
        success: true,
        data: { available: true },
      }
    } catch {
      return {
        success: true,
        data: { available: false },
      }
    }
  }),

  // List local Docker images
  listLocalImages: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        // Use Docker socket API to list local images
        const images = await docker.listImages({ all: false })

        const localImages: LocalDockerImage[] = images
          .map((image) => {
            // Get repository and tag from RepoTags
            const repoTag = image.RepoTags?.[0] || "<none>:<none>"
            const [repository, tag] = repoTag.split(":")

            // Format creation date
            const created = new Date(image.Created * 1000).toISOString()

            // Get size (sum of all layers)
            const size = image.Size || 0

            return {
              id: image.Id?.slice(0, 12) || "",
              repository: repository || "<none>",
              tag: tag || "<none>",
              imageId: image.Id?.slice(0, 12) || "",
              created,
              size,
            }
          })
          .sort(
            (a, b) =>
              new Date(b.created).getTime() - new Date(a.created).getTime()
          )
          .slice(0, input.limit)

        return {
          success: true,
          data: localImages,
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
