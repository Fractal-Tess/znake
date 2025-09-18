"use client"

import { useState } from "react"

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

import { ScanInitiationClient } from "./_components/ScanInitiationClient"
import { ScanProgressClient } from "./_components/ScanProgressClient"
import { VulnerabilityListClient } from "./_components/VulnerabilityListClient"
import { VulnerabilityStatsClient } from "./_components/VulnerabilityStatsClient"

export default function ScanPage() {
  const [imageRef, setImageRef] = useState("")
  const [currentScan, setCurrentScan] = useState<{
    scanId: number
    imageRef: string
  } | null>(null)
  const [liveProgress, setLiveProgress] = useState<{
    status: string
    progress: number
    message: string
    error?: string
  } | null>(null)

  // Start scan mutation
  const startScanMutation = api.scans.startScan.useMutation()

  // Subscribe to real-time scan status updates
  api.scans.subscribeScanStatus.useSubscription(
    { scanId: currentScan?.scanId || 0 },
    {
      enabled: !!currentScan?.scanId,
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
  const { data: scanStatus } = api.scans.getScanStatus.useQuery(
    { scanId: currentScan?.scanId || 0 },
    {
      enabled: !!currentScan?.scanId,
    }
  )

  // Get scan results when completed (either from DB status or live progress)
  const isCompleted =
    liveProgress?.status === "completed" ||
    (scanStatus?.success && scanStatus.data?.status === "completed")

  const { data: scanResults } = api.scans.getScanResults.useQuery(
    { scanId: currentScan?.scanId || 0 },
    {
      enabled: isCompleted,
    }
  )

  const handleStartScan = async () => {
    if (!imageRef.trim()) return
    const result = await startScanMutation.mutateAsync({
      imageRef: imageRef.trim(),
    })
    if (result?.success && result.data) {
      setCurrentScan({ scanId: result.data.scanId, imageRef: imageRef.trim() })
      setImageRef("")
    }
  }

  const handleCompleteScan = () => {
    setCurrentScan(null)
    setLiveProgress(null)
  }

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
                <BreadcrumbPage>Scan Images</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        {currentScan ? (
          // Scanning progress and results
          <>
            <ScanProgressClient
              imageRef={currentScan.imageRef}
              liveProgress={liveProgress}
              onNewScan={handleCompleteScan}
              scanStatus={getScanStatusData()}
            />

            {/* Show results when scan is completed */}
            {scanResults?.success && scanResults.data && (
              <div className="space-y-6">
                <VulnerabilityStatsClient stats={scanResults.data.stats} />
                <VulnerabilityListClient
                  vulnerabilities={scanResults.data.vulnerabilities}
                />
              </div>
            )}
          </>
        ) : (
          // Scan initiation interface
          <ScanInitiationClient
            error={startScanMutation.error?.message}
            imageRef={imageRef}
            isStarting={startScanMutation.isPending}
            onStartScan={handleStartScan}
            setImageRef={setImageRef}
          />
        )}
      </div>
    </>
  )
}
