"use client"

import { useState } from "react"
import {
  AlertTriangle,
  Container,
  Github,
  HardDrive,
  Link,
  Lock,
  Search,
} from "lucide-react"

import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"

type ScanInitiationClientProps = {
  imageRef: string
  setImageRef: (value: string) => void
  onStartScan: () => void
  isStarting: boolean
  error?: string
}

export function ScanInitiationClient({
  imageRef,
  setImageRef,
  onStartScan,
  isStarting,
  error,
}: ScanInitiationClientProps) {
  const [activeTab, setActiveTab] = useState("docker-hub")

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Security Scan</h1>
        <p className="text-muted-foreground">
          Choose an image to scan for security vulnerabilities and
          misconfigurations.
        </p>
      </div>

      {/* Content */}
      <div className="bg-background rounded-lg border p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">Scan New Image</h2>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="docker-hub" className="flex items-center gap-2">
              <Container className="h-4 w-4" />
              Docker Hub
            </TabsTrigger>
            <TabsTrigger value="github" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </TabsTrigger>
            <TabsTrigger value="local" className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Local
            </TabsTrigger>
            <TabsTrigger
              value="custom"
              className="flex items-center gap-2"
              disabled
              title="Coming soon - Under development"
            >
              <Link className="h-4 w-4" />
              Custom
            </TabsTrigger>
            <TabsTrigger
              value="private"
              className="flex items-center gap-2"
              disabled
              title="Coming soon - Under development"
            >
              <Lock className="h-4 w-4" />
              Private
            </TabsTrigger>
          </TabsList>

          <TabsContent value="docker-hub" className="mt-6 space-y-4">
            <div>
              <label htmlFor="docker-hub-input" className="text-sm font-medium">
                Docker Hub Image
              </label>
              <div className="relative mt-2">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="docker-hub-input"
                  className="pl-9"
                  placeholder="e.g., nginx:latest or library/ubuntu:20.04"
                  value={imageRef}
                  onChange={(e) => setImageRef(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onStartScan()}
                />
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Start typing to search Docker Hub images. Official images don't
                need 'library/' prefix.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="github" className="mt-6 space-y-4">
            <div>
              <label htmlFor="github-input" className="text-sm font-medium">
                GitHub Container Registry Image
              </label>
              <div className="relative mt-2">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="github-input"
                  className="pl-9"
                  placeholder="e.g., ghcr.io/username/repo:tag"
                  value={imageRef}
                  onChange={(e) => setImageRef(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onStartScan()}
                />
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Enter a GitHub Container Registry image reference.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="local" className="mt-6 space-y-4">
            <div>
              <label htmlFor="local-input" className="text-sm font-medium">
                Local Docker Image
              </label>
              <div className="relative mt-2">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="local-input"
                  className="pl-9"
                  placeholder="e.g., my-app:latest or localhost:5000/my-app:1.0"
                  value={imageRef}
                  onChange={(e) => setImageRef(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onStartScan()}
                />
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Enter a local Docker image name or local registry reference.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-6 space-y-4">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="bg-muted mb-4 rounded-full p-3">
                <Link className="text-muted-foreground h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Coming Soon</h3>
              <p className="text-muted-foreground text-sm">
                Custom registry support is currently under development.
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                This feature will allow you to scan images from custom Docker
                registries.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="private" className="mt-6 space-y-4">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="bg-muted mb-4 rounded-full p-3">
                <Lock className="text-muted-foreground h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Coming Soon</h3>
              <p className="text-muted-foreground text-sm">
                Private registry support is currently under development.
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                This feature will allow you to scan images from private Docker
                registries with authentication.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3 border-t pt-6">
          <Button
            disabled={!imageRef.trim() || isStarting}
            onClick={onStartScan}
          >
            {isStarting ? "Starting..." : "Start Scan"}
          </Button>
        </div>
      </div>
    </div>
  )
}
