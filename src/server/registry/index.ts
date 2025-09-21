// Registry services for image search and management
export * as dockerHub from "./dockerhub"
export * as github from "./github"
export * as local from "./local"
export * as privateRegistryModule from "./private"
export * as customRegistryModule from "./custom"

// Re-export individual registries
export { dockerHubRegistry } from "./dockerhub"
export { githubRegistry } from "./github"
export { localRegistry } from "./local"
export { privateRegistry } from "./private"
export { customRegistry } from "./custom"

// Re-export all types and schemas from schema.ts
export * from "./schema"

// Unified registry interface
export interface RegistryService {
  searchImages(query: string, limit?: number): Promise<import("./schema").SearchImageResult[]>
  getRepositoryTags(repository: string, limit?: number): Promise<import("./schema").RepositoryTag[]>
  parseImageReference(imageRef: string): import("./schema").ImageReference
}