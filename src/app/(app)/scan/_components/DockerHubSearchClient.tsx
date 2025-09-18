"use client"

import { Search } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"

const DESCRIPTION_MAX_LENGTH = 100
const MAX_SEARCH_RESULTS = 5

type DockerHubImage = {
  repo_name: string
  short_description: string
  is_official: boolean
  pull_count: number
}

type DockerHubSearchClientProps = {
  searchQuery: string
  setSearchQuery: (value: string) => void
  searchResults: { success: boolean; data: DockerHubImage[] } | undefined
  isLoading: boolean
  onSelectImage: (imageName: string) => void
}

export function DockerHubSearchClient({
  searchQuery,
  setSearchQuery,
  searchResults,
  isLoading,
  onSelectImage,
}: DockerHubSearchClientProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Docker Hub</CardTitle>
        <CardDescription>Find popular Docker images to scan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            className="pl-9"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for Docker images..."
            value={searchQuery}
          />
        </div>

        {isLoading && (
          <p className="text-muted-foreground text-sm">Searching...</p>
        )}

        {searchResults?.success &&
          searchResults.data &&
          searchResults.data.length > 0 && (
            <div className="space-y-2">
              {searchResults.data.slice(0, MAX_SEARCH_RESULTS).map((image) => (
                <div
                  className="flex items-center justify-between rounded-lg border p-3"
                  key={image.repo_name}
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{image.repo_name}</h3>
                    <p className="text-muted-foreground text-sm">
                      {image.short_description
                        ? image.short_description.length >
                          DESCRIPTION_MAX_LENGTH
                          ? `${image.short_description.slice(0, DESCRIPTION_MAX_LENGTH)}...`
                          : image.short_description
                        : "No description available"}
                    </p>
                    <div className="mt-1 flex gap-2">
                      {image.is_official && (
                        <Badge className="text-xs" variant="secondary">
                          Official
                        </Badge>
                      )}
                      <span className="text-muted-foreground text-xs">
                        {image.pull_count.toLocaleString()} pulls
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => onSelectImage(`${image.repo_name}:latest`)}
                    size="sm"
                    variant="outline"
                  >
                    Select
                  </Button>
                </div>
              ))}
            </div>
          )}
      </CardContent>
    </Card>
  )
}
