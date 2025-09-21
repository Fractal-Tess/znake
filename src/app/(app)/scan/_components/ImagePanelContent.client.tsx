import type { RegistryType } from "~/stores/image-search-store"
import { Container } from "lucide-react"

import type { Image } from "~/lib/types"

import { EmptyState } from "./EmptyState.client"
import { ImageList } from "./ImageList.client"
import { ImageLoadingSkeleton } from "./ImageLoadingSkeleton.client"

interface ImagePanelContentProps {
  isLoading: boolean
  hasError: boolean
  hasResults: boolean
  query: string
  results: Image[]
  error?: string | null
  registryType: RegistryType
}

export function ImagePanelContent({
  isLoading,
  hasError,
  hasResults,
  query,
  results,
  error,
  registryType,
}: ImagePanelContentProps) {
  const Icon = Container

  if (isLoading) {
    return <ImageLoadingSkeleton />
  }

  if (hasError) {
    return (
      <EmptyState
        icon={Icon}
        title="Error loading results"
        description={error || "Something went wrong. Please try again."}
      />
    )
  }

  if (hasResults) {
    return <ImageList results={results} registryType={registryType} />
  }

  if (query.length > 2) {
    return (
      <EmptyState
        icon={Icon}
        title="No results found"
        description="Try adjusting your search terms or check your connection."
      />
    )
  }

  return (
    <EmptyState
      icon={Icon}
      title="Start searching"
      description="Enter a search term to find container images."
    />
  )
}
