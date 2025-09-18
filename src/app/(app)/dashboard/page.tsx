"use client"

import { useState } from "react"
import Link from "next/link"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { api } from "~/trpc/react"

import { RecentScansClient } from "./_components/RecentScansClient"
import { ScanDetailsClient } from "./_components/ScanDetailsClient"
import { StatisticsCardsClient } from "./_components/StatisticsCardsClient"
import { VulnerabilityChartClient } from "./_components/VulnerabilityChartClient"
import { isScanMetadata } from "./types"

export default function DashboardPage() {
  const [selectedScan, setSelectedScan] = useState<number | null>(null)

  // Fetch all scans
  const { data: scansData } = api.scans.listScans.useQuery({ limit: 20 })

  // Fetch detailed results for selected scan
  const { data: scanResults } = api.scans.getScanResults.useQuery(
    { scanId: selectedScan || 0 },
    { enabled: !!selectedScan }
  )

  const scans = scansData?.success ? (scansData.data ?? []) : []

  // Aggregate statistics
  const completedScans = scans.filter((scan) => scan.status === "completed")
  const totalVulns = completedScans.reduce((acc, scan) => {
    if (isScanMetadata(scan.metadata)) {
      return acc + (scan.metadata.vulnerabilityCount || 0)
    }
    return acc
  }, 0)

  // Chart data for vulnerability distribution
  const severityData = completedScans.reduce(
    (acc, scan) => {
      if (isScanMetadata(scan.metadata) && scan.metadata.stats) {
        const stats = scan.metadata.stats
        acc.critical += stats.critical || 0
        acc.high += stats.high || 0
        acc.medium += stats.medium || 0
        acc.low += stats.low || 0
      }
      return acc
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  )

  const chartData = [
    { name: "Critical", value: severityData.critical, color: "#dc2626" },
    { name: "High", value: severityData.high, color: "#ea580c" },
    { name: "Medium", value: severityData.medium, color: "#ca8a04" },
    { name: "Low", value: severityData.low, color: "#2563eb" },
  ].filter((item) => item.value > 0)

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
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4">
          <Link href="/scan">
            <Button>New Scan</Button>
          </Link>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your Docker image security scans
          </p>
        </div>

        <StatisticsCardsClient
          completedScans={completedScans}
          criticalCount={severityData.critical}
          scans={scans}
          totalVulns={totalVulns}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <VulnerabilityChartClient chartData={chartData} />
          <RecentScansClient
            onScanSelect={setSelectedScan}
            scans={scans}
            selectedScan={selectedScan}
          />
        </div>

        {selectedScan && scanResults && (
          <ScanDetailsClient scanResults={scanResults} />
        )}
      </div>
    </>
  )
}
