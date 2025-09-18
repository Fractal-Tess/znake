"use client"

import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"
import { AppSidebar } from "~/components/AppSidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
