"use client"

import { useEffect, useRef, useState } from "react"
import { imageStore } from "~/stores/image-search-store"
import { Search } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"

export function SearchForm() {
  const setQuery = imageStore((state) => state.setQuery)
  const activeTab = imageStore((state) => state.activeTab)
  const [inputValue, setInputValue] = useState("")
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce for non-local tabs
  const isLocalTab = activeTab === "local"
  const debounceDelay = 500

  useEffect(() => {
    if (isLocalTab) {
      setQuery(inputValue)
      return
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setQuery(inputValue)
    }, debounceDelay)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [inputValue, setQuery, isLocalTab])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div>
      <label htmlFor="docker-hub-input" className="text-sm font-medium">
        Docker Hub Image
      </label>
      <div className="mt-2 flex gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            id="docker-hub-input"
            className="pl-9"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g., nginx:latest or library/ubuntu:20.04"
          />
        </div>
        <Button>Scan</Button>
      </div>
    </div>
  )
}
