"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { CheckCircle, Clock, Container, Search, XCircle } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { api } from "~/trpc/react"

import { isScanMetadata } from "../../dashboard/types"

type ScanStatus = "all" | "pending" | "running" | "completed" | "failed"

type ScansListClientProps = {
  searchQuery: string
  setSearchQuery: (query: string) => void
  statusFilter: ScanStatus
  setStatusFilter: (status: ScanStatus) => void
  currentPage: number
  setCurrentPage: (page: number) => void
  itemsPerPage: number
}

export function ScansListClient({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  currentPage,
  setCurrentPage,
  itemsPerPage,
}: ScansListClientProps) {
  const [runningScanIds, setRunningScanIds] = useState<Set<number>>(new Set())
  const prevRunningIdsRef = useRef<string>("")

  // Fetch scans with pagination
  const {
    data: scansData,
    isLoading,
    refetch,
  } = api.scans.listScans.useQuery({
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  })

  // Memoize scans to prevent unnecessary re-renders
  const scans = useMemo(() => {
    return scansData?.success ? (scansData.data ?? []) : []
  }, [scansData])

  // Track running scans for real-time updates
  useEffect(() => {
    const runningIds = new Set(
      scans.filter((scan) => scan.status === "running").map((scan) => scan.id)
    )

    // Only update if the running scan IDs have actually changed
    const newRunningIdsString = Array.from(runningIds).sort().join(",")

    if (prevRunningIdsRef.current !== newRunningIdsString) {
      setRunningScanIds(runningIds)
      prevRunningIdsRef.current = newRunningIdsString
    }
  }, [scans])

  // Subscribe to real-time updates for running scans
  const runningScansArray = Array.from(runningScanIds)
  api.scans.subscribeScanStatus.useSubscription(
    { scanId: runningScansArray[0] || 0 },
    {
      enabled: runningScansArray.length > 0,
      onData: () => {
        // Refetch data when any running scan updates
        refetch()
      },
    }
  )

  // Filter scans based on search query and status
  const filteredScans = scans.filter((scan) => {
    // Status filter
    if (statusFilter !== "all" && scan.status !== statusFilter) {
      return false
    }

    // Search filter
    if (searchQuery.trim()) {
      const imageName =
        `${scan.image?.repository?.replace("library/", "")}:${scan.image?.tag}`.toLowerCase()
      const query = searchQuery.toLowerCase()
      return imageName.includes(query)
    }

    return true
  })

  const getScanStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "running":
        return <Container className="h-4 w-4 text-blue-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "failed":
        return "destructive"
      case "pending":
      case "running":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const getVulnerabilityCount = (scan: any) => {
    if (
      isScanMetadata(scan.metadata) &&
      scan.metadata.vulnerabilityCount !== undefined
    ) {
      return scan.metadata.vulnerabilityCount
    }
    return null
  }

  const getProgressPercentage = (scan: any) => {
    if (scan.status === "completed") return 100
    if (scan.status === "failed") return 0
    return scan.progress || 0
  }

  return (
    <>
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter scans by status and search by image name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                className="pl-9"
                placeholder="Search by image name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: ScanStatus) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scans List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Scans ({filteredScans.length})
            {searchQuery && ` matching "${searchQuery}"`}
            {statusFilter !== "all" && ` - ${statusFilter}`}
            {runningScanIds.size > 0 && (
              <Badge variant="secondary" className="ml-2">
                {runningScanIds.size} running
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Click on any scan to view detailed results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredScans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Container className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-medium">No scans found</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "No scans match your current filters. Try adjusting your search criteria."
                  : "You haven't run any scans yet. Start by scanning your first Docker image."}
              </p>
              <Link href="/scan">
                <Button>Start Your First Scan</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredScans.map((scan) => {
                const vulnCount = getVulnerabilityCount(scan)
                const progress = getProgressPercentage(scan)
                const isRunning = scan.status === "running"

                return (
                  <Link
                    key={scan.id}
                    href={`/scans/${scan.id}`}
                    className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          {getScanStatusIcon(scan.status)}
                          <span className="font-medium">
                            {scan.image?.repository?.replace("library/", "")}:
                            {scan.image?.tag}
                          </span>
                          <Badge variant={getBadgeVariant(scan.status)}>
                            {scan.status}
                          </Badge>
                          {isRunning && (
                            <Badge variant="outline" className="animate-pulse">
                              Live
                            </Badge>
                          )}
                        </div>
                        <div className="text-muted-foreground flex items-center gap-3 text-sm">
                          <span>{formatDate(scan.createdAt)}</span>
                          {vulnCount !== null && (
                            <>
                              <span>•</span>
                              <span>{vulnCount} vulnerabilities</span>
                            </>
                          )}
                          {isRunning && (
                            <>
                              <span>•</span>
                              <span>{progress}% complete</span>
                            </>
                          )}
                          {scan.errorMessage && (
                            <>
                              <span>•</span>
                              <span className="text-red-500 truncate max-w-xs">
                                {scan.errorMessage}
                              </span>
                            </>
                          )}
                        </div>
                        {isRunning && (
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        #{scan.id}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredScans.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Showing {filteredScans.length} scans
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={filteredScans.length < itemsPerPage}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
