"use client"

import { useState } from "react"
import { useParams } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import { Separator } from "~/components/ui/separator"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { api } from "~/trpc/react"

import { ScanProgressClient } from "../../scan/_components/ScanProgressClient"
import { VulnerabilityStatsClient } from "../../scan/_components/VulnerabilityStatsClient"
import { VulnerabilityTableClient } from "../../scan/_components/VulnerabilityTableClient"

export default function ScanDetailsPage() {
  const params = useParams()
  const scanId = parseInt(params.id as string, 10)
  const [liveProgress, setLiveProgress] = useState<{
    status: string
    progress: number
    message: string
    error?: string
  } | null>(null)

  // Subscribe to real-time scan status updates
  api.scans.subscribeScanStatus.useSubscription(
    { scanId },
    {
      enabled: !!scanId && !isNaN(scanId),
      onData: (data) => {
        // Extract the actual data from the tracked envelope
        const scanEvent = Array.isArray(data) ? data[1] : data
        if (
          scanEvent &&
          typeof scanEvent === "object" &&
          "status" in scanEvent
        ) {
          setLiveProgress({
            status: scanEvent.status as string,
            progress: scanEvent.progress as number,
            message: scanEvent.message as string,
            error: scanEvent.error as string | undefined,
          })
        }
      },
      onError: (error) => {
        // Handle subscription error silently or show user-friendly message
        setLiveProgress({
          status: "failed",
          progress: 0,
          message: "Connection error",
          error: error.message,
        })
      },
    }
  )

  // Get initial scan status (one-time query)
  const { data: scanStatus, isLoading: isLoadingStatus } =
    api.scans.getScanStatus.useQuery(
      { scanId },
      {
        enabled: !!scanId && !isNaN(scanId),
      }
    )

  // Get scan results when completed (either from DB status or live progress)
  const isCompleted =
    liveProgress?.status === "completed" ||
    (scanStatus?.success && scanStatus.data?.status === "completed")

  const { data: scanResults } = api.scans.getScanResults.useQuery(
    { scanId },
    {
      enabled: isCompleted,
    }
  )

  const getScanStatusData = () => {
    if (!scanStatus?.success) return
    return {
      success: scanStatus.success,
      data: scanStatus.data
        ? {
            status: scanStatus.data.status,
            progress: scanStatus.data.progress ?? undefined,
            errorMessage: scanStatus.data.errorMessage ?? undefined,
          }
        : undefined,
    }
  }

  // Get image reference from scan data
  const imageRef =
    scanStatus?.success && scanStatus.data?.image
      ? `${scanStatus.data.image.registry}/${scanStatus.data.image.repository}:${scanStatus.data.image.tag}`
      : "Unknown image"

  if (isNaN(scanId)) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/scan">Scan Images</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Invalid Scan ID</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Invalid Scan ID</h1>
            <p className="text-muted-foreground mt-2">
              The scan ID provided is not valid.
            </p>
          </div>
        </div>
      </>
    )
  }

  if (isLoadingStatus) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/scan">Scan Images</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Loading...</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Loading Scan Details</h1>
            <p className="text-muted-foreground mt-2">
              Please wait while we load the scan information...
            </p>
          </div>
        </div>
      </>
    )
  }

  if (!scanStatus?.success || !scanStatus.data) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/scan">Scan Images</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Scan Not Found</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Scan Not Found</h1>
            <p className="text-muted-foreground mt-2">
              The requested scan could not be found.
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator className="mr-2 h-4" orientation="vertical" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/scan">Scan Images</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Scan #{scanId}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <ScanProgressClient
          imageRef={imageRef}
          liveProgress={liveProgress}
          onNewScan={() => (window.location.href = "/scan")}
          scanStatus={getScanStatusData()}
        />

        {/* Show results when scan is completed */}
        {scanResults?.success && scanResults.data && (
          <div className="space-y-6">
            <VulnerabilityStatsClient stats={scanResults.data.stats} />
            <VulnerabilityTableClient
              vulnerabilities={scanResults.data.vulnerabilities}
            />
          </div>
        )}
      </div>
    </>
  )
}
