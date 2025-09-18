// Database schema for Znake - Docker Security Scanner
// https://orm.drizzle.team/docs/sql-schema-declaration
import { relations, sql } from "drizzle-orm"
import {
  index,
  integer,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core"

import type { ScanStage } from "~/lib/scan-stages"

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `znake_${name}`)

// Docker images being scanned
export const images = createTable(
  "images",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    registry: text("registry").notNull(), // e.g., "docker.io"
    repository: text("repository").notNull(), // e.g., "library/ubuntu"
    tag: text("tag").notNull(), // e.g., "22.04"
    digest: text("digest"), // SHA256 digest if available
    size: integer("size"), // Image size in bytes
    architecture: text("architecture"), // e.g., "amd64"
    os: text("os"), // e.g., "linux"
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    // Index for unique image identification
    imageIdentityIdx: index("image_identity_idx").on(
      table.registry,
      table.repository,
      table.tag
    ),
    // Index for creation date ordering
    createdAtIdx: index("images_created_at_idx").on(table.createdAt),
  })
)

// Scan executions
export const scans = createTable(
  "scans",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    imageId: integer("image_id")
      .notNull()
      .references(() => images.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["pending", "running", "completed", "failed"],
    }).notNull(),
    stage: text("stage", {
      enum: [
        "initializing",
        "downloading",
        "scanning",
        "analyzing",
        "processing",
        "completed",
        "failed",
      ],
    })
      .notNull()
      .default("initializing"),
    scanner: text("scanner").notNull().default("trivy"), // Scanner used
    startedAt: integer("started_at", { mode: "timestamp" }),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    progress: integer("progress").default(0), // 0-100 (calculated from stage)
    errorMessage: text("error_message"),
    metadata: text("metadata", { mode: "json" }), // JSON metadata
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    // Index for foreign key relationship
    imageIdIdx: index("scans_image_id_idx").on(table.imageId),
    // Index for status filtering
    statusIdx: index("scans_status_idx").on(table.status),
    // Index for stage filtering
    stageIdx: index("scans_stage_idx").on(table.stage),
    // Index for creation date ordering (most common query)
    createdAtIdx: index("scans_created_at_idx").on(table.createdAt),
    // Composite index for status + creation date (common filtering pattern)
    statusCreatedAtIdx: index("scans_status_created_at_idx").on(
      table.status,
      table.createdAt
    ),
  })
)

// Vulnerabilities found in scans
export const vulnerabilities = createTable(
  "vulnerabilities",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    scanId: integer("scan_id")
      .notNull()
      .references(() => scans.id, { onDelete: "cascade" }),
    cveId: text("cve_id"), // e.g., "CVE-2023-1234"
    severity: text("severity", {
      enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"],
    }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    packageName: text("package_name"), // Affected package
    packageVersion: text("package_version"), // Current version
    fixedVersion: text("fixed_version"), // Fixed version if available
    publishedDate: integer("published_date", { mode: "timestamp" }),
    lastModifiedDate: integer("last_modified_date", { mode: "timestamp" }),
    references: text("references", { mode: "json" }), // JSON array of URLs
    cvssScore: integer("cvss_score"), // CVSS score * 10 (to store as integer)
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    // Index for foreign key relationship (most important for queries)
    scanIdIdx: index("vulnerabilities_scan_id_idx").on(table.scanId),
    // Index for severity filtering and ordering
    severityIdx: index("vulnerabilities_severity_idx").on(table.severity),
    // Index for CVE ID lookups
    cveIdIdx: index("vulnerabilities_cve_id_idx").on(table.cveId),
    // Index for package name filtering
    packageNameIdx: index("vulnerabilities_package_name_idx").on(
      table.packageName
    ),
    // Composite index for scan + severity (common query pattern)
    scanIdSeverityIdx: index("vulnerabilities_scan_id_severity_idx").on(
      table.scanId,
      table.severity
    ),
    // Index for CVSS score ordering
    cvssScoreIdx: index("vulnerabilities_cvss_score_idx").on(table.cvssScore),
  })
)

// Define relations
export const imagesRelations = relations(images, ({ many }) => ({
  scans: many(scans),
}))

export const scansRelations = relations(scans, ({ one, many }) => ({
  image: one(images, {
    fields: [scans.imageId],
    references: [images.id],
  }),
  vulnerabilities: many(vulnerabilities),
}))

export const vulnerabilitiesRelations = relations(
  vulnerabilities,
  ({ one }) => ({
    scan: one(scans, {
      fields: [vulnerabilities.scanId],
      references: [scans.id],
    }),
  })
)
