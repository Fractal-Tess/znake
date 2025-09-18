import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import PixelBlast from "~/components/PixelBlast";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Znake - Docker Security Scanner",
  description:
    "Scan your Docker containers for vulnerabilities with lightning-fast precision. Get detailed security reports and keep your deployments safe.",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "icon", url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    { rel: "icon", url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    { rel: "icon", url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
  ],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${geist.variable} dark`} lang="en">
      <body>
        <PixelBlast
          className="!fixed -z-10 inset-0 h-screen w-screen"
          color="#4ade80"
          edgeFade={1}
          enableRipples
          liquidRadius={1.2}
          liquidStrength={0.12}
          liquidWobbleSpeed={5}
          patternDensity={1.2}
          patternScale={3}
          pixelSize={6}
          pixelSizeJitter={0.5}
          rippleIntensityScale={1.5}
          rippleSpeed={0.4}
          rippleThickness={0.12}
          speed={0.6}
          transparent
          variant="circle"
        />
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
