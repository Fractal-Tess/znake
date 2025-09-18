// Scanning operations router for tRPC
import { tracked } from "@trpc/server"
import { desc, eq } from "drizzle-orm"
import { z } from "zod"

import { DockerHubClient } from "~/lib/docker-hub"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import type { db as DatabaseType } from "~/server/db"
import { images, scans, vulnerabilities } from "~/server/db/schema"
import {
  createScanUpdateIterator,
  emitScanUpdate,
  type ScanProgressEvent,
} from "~/server/services/scan-events"
import {
  checkTrivyInstalled,
  getCvssScore,
  getVulnerabilityStats,
  parseVulnerabilities,
  scanImage,
} from "~/server/services/scanner"

const CVSS_SCORE_MULTIPLIER = 10
const DEFAULT_LIMIT = 50
const DEFAULT_OFFSET = 0
const MAX_LIMIT = 100

// Helper function to create initial scan event
const createInitialScanEvent = (
  scan: {
    status: string
    progress?: number | null
    errorMessage?: string | null
  },
  scanId: number
): ScanProgressEvent => {
  const getStatusMessage = (status: string, errorMessage?: string | null) => {
    if (status === "completed") return "Scan completed"
    if (status === "failed") return errorMessage || "Scan failed"
    if (status === "running") return "Scanning in progress"
    return "Scan pending"
  }

  return {
    scanId,
    status: scan.status as "pending" | "running" | "completed" | "failed",
    progress: scan.progress || 0,
    message: getStatusMessage(scan.status, scan.errorMessage),
  }
}

export const scansRouter = createTRPCRouter({
  // Start a new scan
  startScan: publicProcedure
    .input(
      z.object({
        imageRef: z.string().min(1, "Image reference is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if Trivy is installed
        const isTrivyInstalled = await checkTrivyInstalled()
        if (!isTrivyInstalled) {
          throw new Error(
            "Trivy is not installed. Please install Trivy to scan images."
          )
        }

        // Parse image reference
        const parsed = DockerHubClient.parseImageReference(input.imageRef)

        // Get image info from Docker Hub (optional for now)
        let tagInfo: {
          full_size?: number
          images?: Array<{
            architecture?: string
            os?: string
            digest?: string
          }>
        } | null = null
        try {
          tagInfo = await DockerHubClient.getTagInfo(
            parsed.repository,
            parsed.tag
          )
        } catch {
          // Continue without Docker Hub metadata if it fails
        }

        // Create or find existing image record
        let imageRecord = await ctx.db.query.images.findFirst({
          where: (imagesSchema, { and, eq: eqOp }) =>
            and(
              eqOp(imagesSchema.registry, parsed.registry),
              eqOp(imagesSchema.repository, parsed.repository),
              eqOp(imagesSchema.tag, parsed.tag)
            ),
        })

        if (!imageRecord) {
          const newImage = await ctx.db
            .insert(images)
            .values({
              registry: parsed.registry,
              repository: parsed.repository,
              tag: parsed.tag,
              size: tagInfo?.full_size || null,
              architecture: tagInfo?.images?.[0]?.architecture || "amd64",
              os: tagInfo?.images?.[0]?.os || "linux",
              digest: tagInfo?.images?.[0]?.digest || null,
            })
            .returning()

          imageRecord = newImage[0]
          if (!imageRecord) {
            throw new Error("Failed to create image record")
          }
        }

        // Create scan record
        const newScan = await ctx.db
          .insert(scans)
          .values({
            imageId: imageRecord.id,
            status: "pending",
            scanner: "trivy",
            progress: 0,
          })
          .returning()

        const scanRecord = newScan[0]
        if (!scanRecord) {
          throw new Error("Failed to create scan record")
        }

        // Start scanning in background
        startBackgroundScan(scanRecord.id, input.imageRef, ctx.db).catch(() => {
          // Handle background scan error
        })

        return {
          success: true,
          data: {
            scanId: scanRecord.id,
            imageId: imageRecord.id,
            status: "pending",
          },
        }
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to start scan",
        }
      }
    }),

  // Subscribe to scan status updates (real-time with SSE)
  subscribeScanStatus: publicProcedure
    .input(
      z.object({
        scanId: z.number(),
        lastEventId: z.string().nullish(),
      })
    )
    .subscription(async function* (opts) {
      const { scanId } = opts.input

      // Get initial scan status if we don't have a lastEventId
      if (!opts.input.lastEventId) {
        try {
          const scan = await opts.ctx.db.query.scans.findFirst({
            where: eq(scans.id, scanId),
            with: { image: true },
          })

          if (scan) {
            const event = createInitialScanEvent(scan, scanId)
            yield tracked(scanId.toString(), event)
          }
        } catch {
          // Handle error silently or emit error event
        }
      }

      // Listen for real-time updates using EventEmitter

      try {
        // Create async iterable for real-time updates
        const events = createScanUpdateIterator(scanId, opts.signal)

        for await (const [event] of events) {
          const scanEvent = event as ScanProgressEvent
          yield tracked(scanEvent.scanId.toString(), scanEvent)
        }
      } catch {
        if (!opts.signal?.aborted) {
          // Handle subscription error
        }
      }
    }),

  // Get scan status and progress (one-time query)
  getScanStatus: publicProcedure
    .input(
      z.object({
        scanId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const scan = await ctx.db.query.scans.findFirst({
          where: eq(scans.id, input.scanId),
          with: {
            image: true,
          },
        })

        if (!scan) {
          return {
            success: false,
            error: "Scan not found",
          }
        }

        return {
          success: true,
          data: scan,
        }
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get scan status",
        }
      }
    }),

  // Get scan results with vulnerabilities
  getScanResults: publicProcedure
    .input(
      z.object({
        scanId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const scan = await ctx.db.query.scans.findFirst({
          where: eq(scans.id, input.scanId),
        })

        if (!scan) {
          return {
            success: false,
            error: "Scan not found",
          }
        }

        if (scan.status !== "completed") {
          return {
            success: true,
            data: {
              scan,
              vulnerabilities: [],
              stats: {
                total: 0,
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
                unknown: 0,
              },
            },
          }
        }

        const vulns = await ctx.db.query.vulnerabilities.findMany({
          where: eq(vulnerabilities.scanId, input.scanId),
          orderBy: [desc(vulnerabilities.severity)],
        })

        const stats = {
          total: vulns.length,
          critical: vulns.filter((v) => v.severity === "CRITICAL").length,
          high: vulns.filter((v) => v.severity === "HIGH").length,
          medium: vulns.filter((v) => v.severity === "MEDIUM").length,
          low: vulns.filter((v) => v.severity === "LOW").length,
          unknown: vulns.filter((v) => v.severity === "UNKNOWN").length,
        }

        return {
          success: true,
          data: {
            scan,
            vulnerabilities: vulns,
            stats,
          },
        }
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get scan results",
        }
      }
    }),

  // List all scans
  listScans: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
        offset: z.number().min(0).default(DEFAULT_OFFSET),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const scansData = await ctx.db.query.scans.findMany({
          limit: input.limit,
          offset: input.offset,
          orderBy: [desc(scans.createdAt)],
        })

        const scansWithImages = await Promise.all(
          scansData.map(async (scan) => {
            const image = await ctx.db.query.images.findFirst({
              where: eq(images.id, scan.imageId),
            })
            return { ...scan, image }
          })
        )

        return {
          success: true,
          data: scansWithImages,
        }
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to list scans",
        }
      }
    }),
})

// Background scanning function
async function startBackgroundScan(
  scanId: number,
  imageRef: string,
  db: typeof DatabaseType
) {
  try {
    // Update scan status to running
    await db
      .update(scans)
      .set({
        status: "running",
        startedAt: new Date(),
        progress: 0,
      })
      .where(eq(scans.id, scanId))

    // Emit running status
    emitScanUpdate({
      scanId,
      status: "running",
      progress: 0,
      message: "Starting scan...",
    })

    // Run Trivy scan with progress updates
    const trivyOutput = await scanImage(imageRef, (progress, message) => {
      emitScanUpdate({
        scanId,
        status: "running",
        progress,
        message,
      })
    })

    // Parse vulnerabilities
    const vulns = parseVulnerabilities(trivyOutput)

    // Store vulnerabilities in database
    if (vulns.length > 0) {
      const vulnRecords = vulns.map((vuln) => ({
        scanId,
        cveId: vuln.VulnerabilityID,
        severity: vuln.Severity,
        title: vuln.Title,
        description: vuln.Description,
        packageName: vuln.PkgName,
        packageVersion: vuln.InstalledVersion,
        fixedVersion: vuln.FixedVersion,
        publishedDate: vuln.PublishedDate ? new Date(vuln.PublishedDate) : null,
        lastModifiedDate: vuln.LastModifiedDate
          ? new Date(vuln.LastModifiedDate)
          : null,
        references: vuln.References ? JSON.stringify(vuln.References) : null,
        cvssScore: (() => {
          const score = getCvssScore(vuln)
          return score ? Math.round(score * CVSS_SCORE_MULTIPLIER) : null
        })(),
      }))

      await db.insert(vulnerabilities).values(vulnRecords)
    }

    // Update scan status to completed
    await db
      .update(scans)
      .set({
        status: "completed",
        completedAt: new Date(),
        progress: 100,
        metadata: JSON.stringify({
          vulnerabilityCount: vulns.length,
          stats: getVulnerabilityStats(vulns),
        }),
      })
      .where(eq(scans.id, scanId))

    // Emit completed status
    emitScanUpdate({
      scanId,
      status: "completed",
      progress: 100,
      message: "Scan completed successfully",
    })
  } catch (error) {
    // Handle background scan error

    await db
      .update(scans)
      .set({
        status: "failed",
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(scans.id, scanId))

    // Emit failed status
    emitScanUpdate({
      scanId,
      status: "failed",
      progress: 0,
      message: `Scan failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
