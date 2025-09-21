import Docker from "dockerode"

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

const docker = new Docker()

export const dockerRouter = createTRPCRouter({
  dockerAvailability: publicProcedure.query(async () => {
    try {
      const res = await docker.ping()
      const status = Buffer.from(res).toString("utf-8")

      if (status === "OK") {
        return true
      }
      return false
    } catch {
      return false
    }
  }),
})
