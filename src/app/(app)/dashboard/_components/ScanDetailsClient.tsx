"use client"

import { Badge } from "~/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import type { RouterOutputs } from "~/trpc/react"

import type { VulnerabilitySeverity } from "../types"
import { isVulnerabilitySeverity } from "../types"

type ScanDetailsClientProps = {
  scanResults: RouterOutputs["scans"]["getScanResults"]
}

export function ScanDetailsClient({ scanResults }: ScanDetailsClientProps) {
  const getSeverityColor = (severity: VulnerabilitySeverity) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200"
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "LOW":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "UNKNOWN":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (!scanResults?.success) {
    return null
  }

  if (!scanResults.data) {
    return null
  }

  const { scan, stats, vulnerabilities } = scanResults.data

  if (scan.status !== "completed") {
    return null
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Scan Details</CardTitle>
        <CardDescription>
          Detailed results for the selected scan
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Vulnerability stats */}
        <div className="mb-6 grid grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.critical}
            </div>
            <div className="text-sm text-red-600">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.high}
            </div>
            <div className="text-sm text-orange-600">High</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.medium}
            </div>
            <div className="text-sm text-yellow-600">Medium</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.low}</div>
            <div className="text-sm text-blue-600">Low</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-muted-foreground text-sm">Total</div>
          </div>
        </div>

        {/* Top vulnerabilities */}
        {vulnerabilities.length > 0 && (
          <div>
            <h3 className="mb-4 font-semibold">Top Vulnerabilities</h3>
            <div className="max-h-80 space-y-3 overflow-y-auto">
              {vulnerabilities
                .filter((vuln) => ["CRITICAL", "HIGH"].includes(vuln.severity))
                .slice(0, 10)
                .map((vuln) => (
                  <div className="border-b pb-3" key={vuln.id}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Badge
                            className={getSeverityColor(
                              isVulnerabilitySeverity(vuln.severity)
                                ? vuln.severity
                                : "UNKNOWN"
                            )}
                          >
                            {vuln.severity}
                          </Badge>
                          {vuln.cveId && (
                            <code className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
                              {vuln.cveId}
                            </code>
                          )}
                        </div>
                        <h4 className="text-sm font-medium">{vuln.title}</h4>
                        <p className="text-muted-foreground mt-1 text-xs">
                          Package: {vuln.packageName} ({vuln.packageVersion})
                          {vuln.fixedVersion && ` → Fix: ${vuln.fixedVersion}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
