"use client"

import Image from "next/image"
import Link from "next/link"
import SplitText from "~/components/SplitText"
import { Button } from "~/components/ui/button"
import { Github } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image
            alt="Znake Logo"
            className="h-8 w-8 rounded-lg"
            height={32}
            src="/icon-32.png"
            width={32}
          />
          <span className="text-foreground text-xl font-semibold">Znake</span>
        </div>

        {/* GitHub Button */}
        <Button asChild variant={"outline"}>
          <Link
            href="https://github.com/Fractal-Tess/znake"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Github className="h-4 w-4" />
            GitHub
          </Link>
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6">
        <div className="max-w-4xl text-center">
          {/* New Feature Tag */}
          <Button
            className="mb-8 rounded-full px-4 py-2 text-sm font-medium"
            size="sm"
            variant="secondary"
          >
            <span className="text-primary">⚡</span>
            Learning project
          </Button>

          {/* Main Heading */}
          <h1 className="text-foreground mb-6 text-5xl leading-tight font-bold md:text-7xl">
            <SplitText
              className="block"
              delay={100}
              duration={0.6}
              ease="power1.out"
              from={{ opacity: 0, y: 50 }}
              rootMargin="-100px"
              splitType="chars"
              text="Docker Security"
              textAlign="center"
              to={{ opacity: 1, y: 0 }}
            />
            <SplitText
              className="block"
              delay={200}
              duration={0.6}
              ease="power1.out"
              from={{ opacity: 0, y: 50 }}
              rootMargin="-100px"
              splitType="chars"
              text="Made Simple"
              textAlign="center"
              to={{ opacity: 1, y: 0 }}
            />
          </h1>

          {/* Description */}
          <SplitText
            className="text-muted-foreground mx-auto mb-8 !block max-w-2xl text-xl"
            delay={10}
            duration={0.5}
            ease="power3.out"
            from={{ opacity: 0, y: 30 }}
            rootMargin="-100px"
            splitType="chars"
            text="Scan your Docker containers for vulnerabilities with lightning-fast precision. Get detailed security reports and keep your deployments safe."
            textAlign="center"
            threshold={0.1}
            to={{ opacity: 1, y: 0 }}
          />

          {/* Call to Action Button */}
          <Button
            asChild
            className="motion-preset-slide-up motion-delay-2000 motion-duration-1000 px-8 py-4 text-lg font-semibold"
            size="lg"
            variant={"secondary"}
          >
            <Link href="/scan">Start Scanning</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
