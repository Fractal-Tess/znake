import { create } from "zustand"
import { devtools } from "zustand/middleware"

import type { Image, RegistryType as UnifiedRegistryType } from "~/lib/types"
import { ImageTypeConverter } from "~/lib/types"
import type { SearchImageResult } from "~/server/registry"
import { apiProxy } from "~/trpc/react"

export type RegistryType =
  | "dockerhub"
  | "github"
  | "local"
  | "private"
  | "custom"

type GitHubImage = {
  name: string
  description: string
  stars: number
  updated_at: string
}

type LocalImage = {
  id: string
  repository: string
  tag: string
  imageId: string
  size: number
  created: string
}

type CustomImage = {}

type PrivateImage = {}

type RegistryResults = {
  dockerhub: Image[]
  github: Image[]
  local: Image[]
  private: Image[]
  custom: Image[]
}

type RegistryState<T extends RegistryType> = {
  query: string
  results: RegistryResults[T] | null
  loading: boolean
  error: string | null
}

type ImageSearchStore = {
  // Current state
  activeTab: RegistryType
  currentQuery: string
  selectedImage: Image | null

  // Per-registry state
  dockerhub: RegistryState<"dockerhub">
  github: RegistryState<"github">
  local: RegistryState<"local">
  private: RegistryState<"private">
  custom: RegistryState<"custom">

  // Actions
  setActiveTab: (tab: RegistryType) => void
  setQuery: (query: string) => void
  searchImages: () => Promise<void>
  clearCache: (registry?: RegistryType) => void
  selectImage: (image: Image | null) => void

  // Tab management utilities
  handleTabChange: (tabValue: RegistryType) => void
}

const initialRegistryState = {
  query: "",
  results: null,
  loading: false,
  error: null,
} satisfies RegistryState<RegistryType>

export const imageStore = create<ImageSearchStore>()(
  devtools(
    (set, get) =>
      ({
        // Initial state
        activeTab: "dockerhub",
        currentQuery: "",
        selectedImage: null,
        dockerhub: { ...initialRegistryState },
        github: { ...initialRegistryState },
        local: { ...initialRegistryState },
        private: { ...initialRegistryState },
        custom: { ...initialRegistryState },

        setActiveTab: (tab: RegistryType) => {
          set({ activeTab: tab }, false, "setActiveTab")
          // Note: Auto-search logic is handled in useImageSearch hook
        },

        setQuery: (query: string) => {
          const { searchImages, activeTab } = get()

          set({ currentQuery: query }, false, "setQuery")

          if (query.length > 2) {
            searchImages()
          } else {
            set(
              { [activeTab]: { results: null, loading: false, query } },
              false,
              "setQuery"
            )
          }
        },

        searchImages: async () => {
          const activeTab = get().activeTab
          const query = get().currentQuery

          set({ [activeTab]: { loading: true, query } }, false, "searchImages")

          try {
            let imageResults: Image[] = []

            if (activeTab === "local" && !query) {
              // For local images without query, list all local images
              const res = await apiProxy.images.listLocal.query({
                limit: 50,
              })
              if (res.success && res.data) {
                imageResults = res.data.map((image: SearchImageResult) =>
                  ImageTypeConverter.fromSearchResult(image)
                )
              }
            } else {
              // Use the unified search endpoint
              const res = await apiProxy.images.search.query({
                query,
                registry: activeTab,
                limit: activeTab === "local" ? 50 : 25,
              })
              if (res.success && res.data) {
                imageResults = res.data.map((image: SearchImageResult) =>
                  ImageTypeConverter.fromSearchResult(image)
                )
              }
            }

            console.log("Setting image results", imageResults)

            set(
              {
                [activeTab]: { results: imageResults, loading: false, query },
              },
              false,
              "searchImages"
            )
          } catch (error) {
            console.error("Search error:", error)
            set(
              {
                [activeTab]: {
                  results: null,
                  loading: false,
                  query,
                  error:
                    error instanceof Error ? error.message : "Search failed",
                },
              },
              false,
              "searchImages"
            )
          }
        },

        clearCache: (registry?: RegistryType) => {
          if (registry) {
            set(
              {
                [registry]: { ...initialRegistryState },
              },
              false,
              `clearCache-${registry}`
            )
          } else {
            set(
              {
                dockerhub: { ...initialRegistryState },
                github: { ...initialRegistryState },
                local: { ...initialRegistryState },
                private: { ...initialRegistryState },
                custom: { ...initialRegistryState },
              },
              false,
              "clearCache-all"
            )
          }
        },

        selectImage: (image: Image | null) => {
          set({ selectedImage: image }, false, "selectImage")
        },

        handleTabChange: (registry: RegistryType) => {
          const { setActiveTab } = get()
          setActiveTab(registry)
        },
      }) satisfies ImageSearchStore,
    {
      name: "image-search-store",
    }
  )
)
