"use client"

import { imageStore, type RegistryType } from "~/stores/image-search-store"
import {
  Container,
  Github,
  HardDrive,
  RefreshCw,
  type LucideIcon,
} from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

import { ImagePanelContent } from "./ImagePanelContent.client"

// Registry configuration
const MAP = {
  dockerhub: {
    icon: Container,
    title: "Popular Docker Hub Images",
    description: "Browse and select from popular Docker images",
  },
  github: {
    icon: Github,
    title: "GitHub Container Registry",
    description: "Browse container images from GitHub repositories",
  },
  local: {
    icon: HardDrive,
    title: "Local Docker Images",
    description: "Images available on your local Docker daemon",
  },
  custom: {
    icon: Container,
    title: "Custom Registry",
    description: "Connect to a custom container registry",
  },
  private: {
    icon: Container,
    title: "Private Registry",
    description: "Access private container registries",
  },
} satisfies Record<
  RegistryType,
  { icon: LucideIcon; title: string; description: string }
>

export function ImagePanel() {
  const activeTab = imageStore((state) => state.activeTab)
  const currentRegistry = imageStore((state) => state[activeTab])
  const searchImages = imageStore((state) => state.searchImages)

  const config = MAP[activeTab as keyof typeof MAP]
  const Icon = config.icon

  const isLoading = currentRegistry.loading
  const hasError = !!currentRegistry.error
  const hasResults = !!(
    currentRegistry.results && currentRegistry.results.length > 0
  )
  const query = currentRegistry.query

  const handleRefresh = () => {
    searchImages()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {config.title}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ImagePanelContent
          isLoading={isLoading}
          hasError={hasError}
          hasResults={hasResults}
          query={query}
          results={currentRegistry.results || []}
          error={currentRegistry.error}
          registryType={activeTab}
        />
      </CardContent>
    </Card>
  )
}
