import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import SWRProvider from "@/components/providers/SWRProvider"
import { HydrationProvider } from "@/components/providers/hydration-provider"
import { StagewiseToolbar } from "@stagewise/toolbar-next"
import { ReactPlugin } from "@stagewise-plugins/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GamutX LMS",
  description: "Learning Management System for VFX and Digital Media",
  generator: "Next.js"
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <HydrationProvider>
            <SWRProvider>
              {children}
            </SWRProvider>
          </HydrationProvider>
          <Toaster />
          <SonnerToaster 
            position="top-right"
            richColors
            closeButton
          />
          {process.env.NODE_ENV === "development" && (
            <StagewiseToolbar
              config={{
                plugins: [ReactPlugin]
              }}
            />
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}
