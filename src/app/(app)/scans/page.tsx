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

import { ScansListClient } from "./_components/ScansListClient"

type ScanStatus = "all" | "pending" | "running" | "completed" | "failed"

export default function ScansPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ScanStatus>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

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
                <BreadcrumbPage>All Scans</BreadcrumbPage>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">All Scans</h1>
          <p className="text-muted-foreground">
            View and manage all your Docker image security scans
          </p>
        </div>

        {/* Scans List with Real-time Updates */}
        <ScansListClient
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </>
  )
}
