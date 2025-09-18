"use client"

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Container,
  XCircle,
} from "lucide-react"

import { SCAN_STAGES, type ScanStage } from "~/lib/scan-stages"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"

type ScanProgress = {
  status: string
  stage: ScanStage
  progress: number
  message: string
  error?: string
}

type ScanProgressClientProps = {
  imageRef: string
  scanStatus?: {
    success: boolean
    data?: {
      status: string
      stage?: string
      progress?: number
      errorMessage?: string
    }
  }
  liveProgress?: ScanProgress | null
  onNewScan: () => void
}

export function ScanProgressClient({
  imageRef,
  scanStatus,
  liveProgress,
  onNewScan,
}: ScanProgressClientProps) {
  const getScanStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "running":
        return <Container className="h-4 w-4 animate-spin text-blue-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const currentStatus = liveProgress?.status || scanStatus?.data?.status || ""
  const currentStage = (liveProgress?.stage ||
    scanStatus?.data?.stage ||
    "initializing") as ScanStage
  const currentProgress =
    liveProgress?.progress || scanStatus?.data?.progress || 0
  const currentMessage = liveProgress?.message || "Processing..."
  const currentError = liveProgress?.error || scanStatus?.data?.errorMessage

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "running":
        return "Scanning"
      case "completed":
        return "Completed"
      case "failed":
        return "Failed"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scanning {imageRef}</h1>
          <p className="text-muted-foreground">
            Security vulnerability scan in progress
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Scan Status Indicator */}
          {(scanStatus?.success || liveProgress) && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
              {getScanStatusIcon(currentStatus)}
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {getStatusText(currentStatus)}
                </span>
                {currentStatus === "running" && (
                  <span className="text-muted-foreground text-xs">
                    {SCAN_STAGES[currentStage]?.label || currentStage}
                  </span>
                )}
              </div>
            </div>
          )}
          <Button onClick={onNewScan} variant="outline">
            New Scan
          </Button>
        </div>
      </div>

      {/* Progress bar for running scans */}
      {currentStatus === "running" && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {SCAN_STAGES[currentStage]?.label || currentStage}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {currentProgress}%
                  </span>
                </div>
                <Progress className="w-full" value={currentProgress} />
              </div>
              <p className="text-muted-foreground text-sm">{currentMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error message for failed scans */}
      {currentStatus === "failed" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{currentError || "Scan failed"}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
