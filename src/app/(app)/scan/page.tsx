import { ImagePanel } from "./_components/ImagePanel.client"
import { SearchForm } from "./_components/SearchForm.client"
import { RegistryTabs } from "./_components/TabList.client"

export default function ScanPage() {
  return (
    <div className="flex-1 flex-col flex gap-4 mx-auto w-full max-w-5xl">
      <RegistryTabs />
      <SearchForm />
      <ImagePanel />
    </div>
  )
}
