"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

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

export default function ScanPage() {
  const [imageRef, setImageRef] = useState("")
  const router = useRouter()

  // Start scan mutation
  const startScanMutation = api.scans.startScan.useMutation()

  const handleStartScan = async () => {
    if (!imageRef.trim()) return
    const result = await startScanMutation.mutateAsync({
      imageRef: imageRef.trim(),
    })
    if (result?.success && result.data) {
      // Redirect to the scan details page
      router.push(`/scans/${result.data.scanId}`)
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
        <ScanInitiationClient
          error={startScanMutation.error?.message}
          imageRef={imageRef}
          isStarting={startScanMutation.isPending}
          onStartScan={handleStartScan}
          setImageRef={setImageRef}
        />
      </div>
    </>
  )
}
