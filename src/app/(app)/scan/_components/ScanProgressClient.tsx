"use client"

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Container,
  XCircle,
} from "lucide-react"

import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"

type ScanProgress = {
  status: string
  progress: number
  message: string
  error?: string
}

type ScanProgressClientProps = {
  imageRef: string
  scanStatus?: {
    success: boolean
    data?: { status: string; progress?: number; errorMessage?: string }
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
  const currentProgress =
    liveProgress?.progress || scanStatus?.data?.progress || 0
  const currentMessage = liveProgress?.message || "Processing..."
  const currentError = liveProgress?.error || scanStatus?.data?.errorMessage

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scanning {imageRef}</h1>
          <p className="text-muted-foreground">
            Security vulnerability scan in progress
          </p>
        </div>
        <Button onClick={onNewScan} variant="outline">
          New Scan
        </Button>
      </div>

      {/* Scan status */}
      {(scanStatus?.success || liveProgress) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getScanStatusIcon(currentStatus)}
              Scan Status:{" "}
              {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStatus === "running" && (
              <div className="space-y-2">
                <Progress className="w-full" value={currentProgress} />
                <p className="text-muted-foreground text-sm">
                  {currentMessage}
                </p>
              </div>
            )}

            {currentStatus === "failed" && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {currentError || "Scan failed"}
                </AlertDescription>
              </Alert>
            )}

            {currentStatus === "completed" && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Scan completed successfully!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
