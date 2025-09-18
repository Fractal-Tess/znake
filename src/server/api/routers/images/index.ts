// Main images router that combines all image-related functionality
import { createTRPCRouter } from "~/server/api/trpc"

import { dockerRouter } from "./docker"
import { githubRouter } from "./github"
import { localRouter } from "./local"

export const imagesRouter = createTRPCRouter({
  docker: dockerRouter,
  local: localRouter,
  github: githubRouter,
})
