// Zod schemas and types for registry services
import { z } from "zod"

// ============================================================================
// REGISTRY TYPE SCHEMAS
// ============================================================================

export const registryTypeSchema = z.enum([
  "dockerhub",
  "github",
  "local",
  "private",
  "custom",
])
export type RegistryType = z.infer<typeof registryTypeSchema>

// ============================================================================
// SEARCH RESULT SCHEMAS
// ============================================================================

export const searchImageResultSchema = z.object({
  // Required baseline fields for all registries
  name: z.string(),
  tag: z.string().default("latest"),
  registry: registryTypeSchema,

  // Optional fields that may not be available for all registry types
  description: z.string().optional(),
  stars: z.number().int().min(0).optional(),
  pulls: z.number().int().min(0).optional(),
  isOfficial: z.boolean().optional(),
  isAutomated: z.boolean().optional(),
  lastUpdated: z.string().optional(),
  size: z.number().int().min(0).optional(),
  digest: z.string().optional(),
  architectures: z.array(z.string()).optional(),

  // Registry-specific metadata
  metadata: z.record(z.any(), z.any()).optional(),
})
export type SearchImageResult = z.infer<typeof searchImageResultSchema>

export const searchResultsArraySchema = z.array(searchImageResultSchema)

// ============================================================================
// REPOSITORY TAG SCHEMAS
// ============================================================================

export const repositoryTagSchema = z.object({
  // Required baseline fields
  name: z.string(),

  // Optional fields that may not be available for all registry types
  size: z.number().int().min(0).optional(),
  lastUpdated: z.string().optional(),
  digest: z.string().optional(),
  architectures: z.array(z.string()).optional(),

  // Registry-specific metadata
  metadata: z.record(z.any(), z.any()).optional(),
})
export type RepositoryTag = z.infer<typeof repositoryTagSchema>

export const repositoryTagsArraySchema = z.array(repositoryTagSchema)

// ============================================================================
// IMAGE REFERENCE SCHEMAS
// ============================================================================

export const imageReferenceSchema = z.object({
  registry: z.string(),
  repository: z.string(),
  tag: z.string(),
  fullName: z.string(),
})
export type ImageReference = z.infer<typeof imageReferenceSchema>

// ============================================================================
// EXTERNAL API RESPONSE SCHEMAS
// ============================================================================

// Docker Hub API schemas
export const dockerHubSearchResultSchema = z.object({
  repo_name: z.string(),
  short_description: z.string().optional().default(""),
  star_count: z.number().int().min(0),
  pull_count: z.number().int().min(0),
  is_official: z.boolean(),
  is_automated: z.boolean(),
})
export type DockerHubSearchResult = z.infer<typeof dockerHubSearchResultSchema>

export const dockerHubSearchResponseSchema = z.object({
  results: z.array(dockerHubSearchResultSchema),
})

export const dockerHubTagImageSchema = z.object({
  architecture: z.string(),
  os: z.string(),
  size: z.number().int().min(0),
  digest: z.string(),
})

export const dockerHubTagSchema = z.object({
  name: z.string(),
  full_size: z.number().int().min(0),
  images: z.array(dockerHubTagImageSchema),
  last_updated: z.string(),
})
export type DockerHubTag = z.infer<typeof dockerHubTagSchema>

export const dockerHubTagsResponseSchema = z.object({
  results: z.array(dockerHubTagSchema),
})

// ============================================================================
// REGISTRY SERVICE INTERFACE SCHEMA
// ============================================================================

export const registryServiceInputSchema = z.object({
  searchImages: z.object({
    query: z.string().min(1),
    limit: z.number().int().min(1).max(100).optional(),
  }),
  getRepositoryTags: z.object({
    repository: z.string().min(1),
    limit: z.number().int().min(1).max(100).optional(),
  }),
  parseImageReference: z.object({
    imageRef: z.string().min(1),
  }),
})

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

export const apiSuccessResponseSchema = <T>(dataSchema: z.ZodSchema<T>) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  })

export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
})

export const createApiResponseSchema = <T>(dataSchema: z.ZodSchema<T>) =>
  z.union([apiSuccessResponseSchema(dataSchema), apiErrorResponseSchema])

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function validateSearchResults(data: unknown): SearchImageResult[] {
  return searchResultsArraySchema.parse(data)
}

export function validateRepositoryTags(data: unknown): RepositoryTag[] {
  return repositoryTagsArraySchema.parse(data)
}

export function validateImageReference(data: unknown): ImageReference {
  return imageReferenceSchema.parse(data)
}

// Transform Docker Hub search result to unified format
export function transformDockerHubSearchResult(
  result: DockerHubSearchResult
): SearchImageResult {
  return {
    name: result.repo_name,
    tag: "latest", // DockerHub search doesn't return specific tags
    registry: "dockerhub",
    description: result.short_description,
    stars: result.star_count,
    pulls: result.pull_count,
    isOfficial: result.is_official,
    isAutomated: result.is_automated,
  }
}

// Transform Docker Hub tag to unified format
export function transformDockerHubTag(tag: DockerHubTag): RepositoryTag {
  return {
    name: tag.name,
    size: tag.full_size,
    lastUpdated: tag.last_updated,
    digest: tag.images[0]?.digest,
    architectures: tag.images.map((img) => img.architecture),
  }
}

// Helper functions for creating registry-specific results
export function createLocalImageResult(
  name: string,
  tag: string,
  options: {
    description?: string
    size?: number
    lastUpdated?: string
    digest?: string
  } = {}
): SearchImageResult {
  return {
    name,
    tag,
    registry: "local",
    description: options.description,
    size: options.size,
    lastUpdated: options.lastUpdated,
    digest: options.digest,
  }
}

export function createPrivateImageResult(
  name: string,
  tag: string,
  options: {
    description?: string
    size?: number
    lastUpdated?: string
    digest?: string
    metadata?: Record<string, any>
  } = {}
): SearchImageResult {
  return {
    name,
    tag,
    registry: "private",
    description: options.description,
    size: options.size,
    lastUpdated: options.lastUpdated,
    digest: options.digest,
    metadata: options.metadata,
  }
}

export function createCustomImageResult(
  name: string,
  tag: string,
  options: {
    description?: string
    size?: number
    lastUpdated?: string
    digest?: string
    metadata?: Record<string, any>
  } = {}
): SearchImageResult {
  return {
    name,
    tag,
    registry: "custom",
    description: options.description,
    size: options.size,
    lastUpdated: options.lastUpdated,
    digest: options.digest,
    metadata: options.metadata,
  }
}
