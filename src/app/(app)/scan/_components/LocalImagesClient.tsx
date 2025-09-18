"use client"

import { useMemo } from "react"
import { HardDrive, RefreshCw } from "lucide-react"

import type { LocalDockerImage } from "~/lib/types"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"
import { api } from "~/trpc/react"

const MAX_LOCAL_IMAGES_DISPLAY = 4

type LocalImagesClientProps = {
  onSelectImage: (imageName: string) => void
  searchQuery?: string
}

export function LocalImagesClient({
  onSelectImage,
  searchQuery = "",
}: LocalImagesClientProps) {
  const { data: dockerAvailability, isLoading: isCheckingAvailability } =
    api.images.local.checkDockerAvailability.useQuery(undefined, {
      refetchOnWindowFocus: false,
      retry: 1,
    })

  const {
    data: localImages,
    isLoading,
    error,
    refetch,
  } = api.images.local.listLocalImages.useQuery(
    { limit: 50 }, // Get more images for filtering
    {
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: dockerAvailability?.data?.available === true,
    }
  )

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return "Today"
      if (diffDays === 1) return "Yesterday"
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      return date.toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const getImageDisplayName = (image: LocalDockerImage): string => {
    const repo = image.repository === "<none>" ? "untagged" : image.repository
    const tag = image.tag === "<none>" ? "latest" : image.tag
    return `${repo}:${tag}`
  }

  // Simple fuzzy search function
  const fuzzyMatch = (text: string, query: string): boolean => {
    if (!query) return true
    const textLower = text.toLowerCase()
    const queryLower = query.toLowerCase()

    // Check if all characters in query appear in order in text
    let queryIndex = 0
    for (
      let i = 0;
      i < textLower.length && queryIndex < queryLower.length;
      i++
    ) {
      if (textLower[i] === queryLower[queryIndex]) {
        queryIndex++
      }
    }
    return queryIndex === queryLower.length
  }

  // Filter and sort images based on search query
  const filteredImages = useMemo(() => {
    if (!localImages?.success || !localImages.data) return []

    let filtered = localImages.data

    // Apply fuzzy search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((image) => {
        const displayName = getImageDisplayName(image)
        return (
          fuzzyMatch(displayName, searchQuery) ||
          fuzzyMatch(image.repository, searchQuery) ||
          fuzzyMatch(image.tag, searchQuery)
        )
      })
    }

    // Sort by creation time (newest first)
    filtered.sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
    )

    // Limit to MAX_LOCAL_IMAGES_DISPLAY
    return filtered.slice(0, MAX_LOCAL_IMAGES_DISPLAY)
  }, [localImages, searchQuery])

  // Show Docker unavailable message
  if (dockerAvailability?.data?.available === false) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Local Docker Images
          </CardTitle>
          <CardDescription>
            Images available on your local Docker daemon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-muted mb-4 rounded-full p-3">
              <HardDrive className="text-muted-foreground h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Docker Not Available</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Docker daemon is not accessible. This may happen when running in a
              container without Docker socket access.
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Local Docker Images
          </CardTitle>
          <CardDescription>
            Images available on your local Docker daemon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-muted mb-4 rounded-full p-3">
              <HardDrive className="text-muted-foreground h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Unable to load images</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {error.message || "Failed to connect to Docker daemon"}
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Local Docker Images
          </div>
          <Button
            onClick={() => refetch()}
            variant="ghost"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </CardTitle>
        <CardDescription>
          Images available on your local Docker daemon
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isCheckingAvailability || isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={`skeleton-${Date.now()}-${i}`}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : filteredImages.length > 0 ? (
          <div className="space-y-2">
            {filteredImages.map((image) => (
              <div
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                key={image.id}
              >
                <div className="flex-1">
                  <h3 className="font-medium">{getImageDisplayName(image)}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {image.imageId.slice(0, 12)}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {formatSize(image.size)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(image.created)}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => onSelectImage(getImageDisplayName(image))}
                  size="sm"
                  variant="outline"
                >
                  Select
                </Button>
              </div>
            ))}
            {searchQuery &&
              localImages?.data &&
              localImages.data.length > filteredImages.length && (
                <p className="text-muted-foreground text-center text-sm">
                  Showing {filteredImages.length} of {localImages.data.length}{" "}
                  images matching "{searchQuery}"
                </p>
              )}
            {!searchQuery &&
              localImages?.data &&
              localImages.data.length > MAX_LOCAL_IMAGES_DISPLAY && (
                <p className="text-muted-foreground text-center text-sm">
                  Showing {MAX_LOCAL_IMAGES_DISPLAY} most recent images
                </p>
              )}
          </div>
        ) : searchQuery ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-muted mb-4 rounded-full p-3">
              <HardDrive className="text-muted-foreground h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No images found</h3>
            <p className="text-muted-foreground text-sm">
              No images match "{searchQuery}". Try a different search term.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-muted mb-4 rounded-full p-3">
              <HardDrive className="text-muted-foreground h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No local images found</h3>
            <p className="text-muted-foreground text-sm">
              Pull some Docker images to see them here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
