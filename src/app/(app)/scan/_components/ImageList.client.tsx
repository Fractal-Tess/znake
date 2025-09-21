import type { RegistryType } from "~/stores/image-search-store"
import { imageStore } from "~/stores/image-search-store"
import { Check, Container } from "lucide-react"

import type { Image } from "~/lib/types"
import { Button } from "~/components/ui/button"

// Image list component
export function ImageList({
  results,
  registryType,
}: {
  results: Image[]
  registryType: RegistryType
}) {
  const selectedImage = imageStore((state) => state.selectedImage)
  const selectImage = imageStore((state) => state.selectImage)

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Container className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground max-w-sm">
          Try adjusting your search terms or check your connection.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {results.map((result, index) => {
        const isSelected = selectedImage?.id === result.id
        return (
          <div
            key={result.id || index}
            className={`flex items-center space-x-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
              isSelected ? "border-primary bg-primary/5" : ""
            }`}
          >
            <Container className="h-8 w-8 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium truncate">
                  {result.name || result.repository}
                </p>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {result.tag}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {result.repository} ({result.registry})
              </p>
            </div>
            <Button
              size="sm"
              variant={isSelected ? "default" : "outline"}
              onClick={(e) => {
                e.stopPropagation()
                selectImage(isSelected ? null : result)
              }}
            >
              {isSelected ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Selected
                </>
              ) : (
                "Select"
              )}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
