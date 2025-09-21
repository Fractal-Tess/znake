"use client"

import { imageStore, type RegistryType } from "~/stores/image-search-store"
import {
  Container,
  Github,
  HardDrive,
  Link,
  Lock,
  type LucideIcon,
} from "lucide-react"

import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { api } from "~/trpc/react"

export function RegistryTabs() {
  const { data: dockerAvailability } = api.docker.dockerAvailability.useQuery()

  const activeTab = imageStore((state) => state.activeTab)

  const handleTabChange = imageStore((state) => state.handleTabChange)

  const tabs = [
    {
      value: "dockerhub",
      label: "Docker Hub",
      icon: Container,
    },
    {
      value: "github",
      label: "GitHub",
      icon: Github,
    },
    {
      value: "local",
      label: "Local",
      icon: HardDrive,
      disabled: !dockerAvailability,
    },
    {
      value: "custom",
      label: "Custom",
      icon: Link,
      disabled: true,
    },
    {
      label: "Private",
      value: "private",
      icon: Lock,
      disabled: true,
    },
  ] satisfies {
    value: RegistryType
    label: string
    icon: LucideIcon
    disabled?: boolean
    title?: string
  }[]

  return (
    <Tabs
      value={activeTab}
      onValueChange={(tabValue) => handleTabChange(tabValue as RegistryType)}
    >
      <TabsList className="grid w-full grid-cols-5">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="flex items-center gap-2"
            disabled={tab.disabled}
            title={tab.label}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
