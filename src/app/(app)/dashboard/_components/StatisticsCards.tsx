import { AlertTriangle, CheckCircle, Container, XCircle } from "lucide-react"

import { Card, CardContent } from "~/components/ui/card"

import type { ScanData } from "../types"

type StatisticsCardsProps = {
  scans: ScanData[]
  completedScans: ScanData[]
  totalVulns: number
  criticalCount: number
}

export function StatisticsCards({
  scans,
  completedScans,
  totalVulns,
  criticalCount,
}: StatisticsCardsProps) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Scans</p>
              <p className="text-2xl font-bold">{scans.length}</p>
            </div>
            <Container className="text-primary h-8 w-8" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Completed</p>
              <p className="text-2xl font-bold">{completedScans.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Vulnerabilities</p>
              <p className="text-2xl font-bold">{totalVulns}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
