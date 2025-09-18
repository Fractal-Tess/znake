// Trivy scanner service for vulnerability scanning
import { spawn } from "node:child_process"
import { randomUUID } from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"

import type { ScanStage } from "~/lib/scan-stages"
import type { TrivyScanOutput, TrivyVulnerability } from "~/lib/types"

const TEMP_DIR = "/tmp/znake"
const MAX_SCAN_TIME = 300_000 // 5 minutes

// Ensure temp directory exists
async function ensureTempDir(): Promise<void> {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true })
  } catch (_error) {}
}

// Check if Trivy is installed
export function checkTrivyInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn("trivy", ["--version"], { stdio: "ignore" })
    child.on("close", (code) => {
      resolve(code === 0)
    })
    child.on("error", () => {
      resolve(false)
    })
  })
}

// Scan a Docker image for vulnerabilities
export async function scanImage(
  imageRef: string,
  onProgress?: (stage: ScanStage, message: string) => void
): Promise<TrivyScanOutput> {
  await ensureTempDir()

  const scanId = randomUUID()
  const outputFile = path.join(TEMP_DIR, `scan-${scanId}.json`)

  onProgress?.("initializing", "Initializing Trivy scan...")

  return new Promise((resolve, reject) => {
    const args = [
      "image",
      "--format",
      "json",
      "--output",
      outputFile,
      "--quiet",
      imageRef,
    ]

    onProgress?.(
      "downloading",
      "Downloading image and vulnerability database..."
    )

    const child = spawn("trivy", args, {
      stdio: ["ignore", "pipe", "pipe"],
    })

    let stderr = ""

    child.stderr?.on("data", (data) => {
      stderr += data.toString()

      // Parse progress from stderr if possible
      const output = data.toString()
      if (output.includes("Analyzing")) {
        onProgress?.("analyzing", "Analyzing discovered vulnerabilities...")
      }
      if (output.includes("Scanning")) {
        onProgress?.("scanning", "Scanning packages for vulnerabilities...")
      }
    })

    child.on("close", async (code) => {
      if (code !== 0) {
        reject(new Error(`Trivy scan failed with code ${code}: ${stderr}`))
        return
      }

      try {
        onProgress?.("processing", "Processing scan results...")

        const output = await fs.readFile(outputFile, "utf-8")
        await fs.unlink(outputFile).catch(() => {}) // Clean up

        const result: TrivyScanOutput = JSON.parse(output)

        onProgress?.("completed", "Scan completed successfully")
        resolve(result)
      } catch (error) {
        reject(new Error(`Failed to parse Trivy output: ${error}`))
      }
    })

    child.on("error", (error) => {
      reject(new Error(`Failed to start Trivy: ${error.message}`))
    })

    // Set timeout
    setTimeout(() => {
      child.kill()
      reject(new Error("Scan timeout - took longer than 5 minutes"))
    }, MAX_SCAN_TIME)
  })
}

// Parse Trivy output and extract vulnerabilities
export function parseVulnerabilities(
  trivyOutput: TrivyScanOutput
): TrivyVulnerability[] {
  const vulnerabilities: TrivyVulnerability[] = []

  if (!trivyOutput.Results) {
    return vulnerabilities
  }

  for (const result of trivyOutput.Results) {
    if (!result.Vulnerabilities) {
      continue
    }

    for (const vuln of result.Vulnerabilities) {
      vulnerabilities.push(vuln)
    }
  }

  return vulnerabilities
}

// Get CVSS score from vulnerability
export function getCvssScore(vulnerability: TrivyVulnerability): number | null {
  if (!vulnerability.CVSS) {
    return null
  }

  // Try to get the highest CVSS v3 score
  for (const [, cvss] of Object.entries(vulnerability.CVSS)) {
    if (cvss.V3Score) {
      return cvss.V3Score
    }
  }

  return null
}

// Get vulnerability statistics
export function getVulnerabilityStats(vulnerabilities: TrivyVulnerability[]) {
  const stats = {
    total: vulnerabilities.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    unknown: 0,
  }

  for (const vuln of vulnerabilities) {
    switch (vuln.Severity) {
      case "CRITICAL":
        stats.critical++
        break
      case "HIGH":
        stats.high++
        break
      case "MEDIUM":
        stats.medium++
        break
      case "LOW":
        stats.low++
        break
      default:
        stats.unknown++
        break
    }
  }

  return stats
}
