"use client"

import Link from "next/link"
import { CheckCircle, Clock, Container, XCircle } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

import type { ScanData, ScanStatus } from "../types"
import { isScanMetadata } from "../types"

type RecentScansClientProps = {
  scans: ScanData[]
  selectedScan: number | null
  onScanSelect: (scanId: number) => void
}

export function RecentScansClient({
  scans,
  selectedScan,
  onScanSelect,
}: RecentScansClientProps) {
  const getScanStatusIcon = (status: ScanStatus) => {
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

  const getBadgeVariant = (status: ScanStatus) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Scans</CardTitle>
        <CardDescription>Your most recent security scans</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scans.length === 0 ? (
            <div className="py-8 text-center">
              <Container className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground">No scans found</p>
              <Link href="/scan">
                <Button className="mt-4">Start Your First Scan</Button>
              </Link>
            </div>
          ) : (
            scans.slice(0, 10).map((scan) => (
              <Link
                key={scan.id}
                href={`/scans/${scan.id}`}
                className={`block w-full rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selectedScan === scan.id ? "ring-primary ring-2" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      {getScanStatusIcon(scan.status)}
                      <span className="font-medium">
                        {scan.image?.repository?.replace("library/", "")}:
                        {scan.image?.tag}
                      </span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-3 text-sm">
                      <span>Status: {scan.status}</span>
                      <span>•</span>
                      <span>
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </span>
                      {isScanMetadata(scan.metadata) &&
                      scan.metadata.vulnerabilityCount !== undefined ? (
                        <>
                          <span>•</span>
                          <span>
                            {scan.metadata.vulnerabilityCount} vulnerabilities
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <Badge variant={getBadgeVariant(scan.status)}>
                    {scan.status}
                  </Badge>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
