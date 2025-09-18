import Link from "next/link"
import { Home } from "lucide-react"

import { Button } from "~/components/ui/button"
import FuzzyText from "~/components/FuzzyText"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <div className="mb-8">
          <FuzzyText
            baseIntensity={0.2}
            enableHover={true}
            hoverIntensity={0.4}
          >
            404
          </FuzzyText>
        </div>

        <h1 className="text-foreground mb-4 text-4xl font-bold md:text-6xl">
          Page Not Found
        </h1>

        <p className="text-muted-foreground mx-auto mb-8 max-w-md text-lg">
          The page you're looking for doesn't exist or has been moved to a
          different location.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline">
            <Link href="/scan">Start Scanning</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
