import "@/src/styles/globals.css"

import { Metadata } from "next"
import Head from "next/head"
import Script from "next/script"
import { TailwindIndicator } from "@/src/components/components-global/tailwind-indicator"
import { ThemeProvider } from "@/src/components/components-global/theme-provider"
import { siteConfig } from "@/src/config/site"
import { fontSans } from "@/src/lib/fonts"
import { cn } from "@/src/lib/utils"
import { GeistSans } from "geist/font/sans"

import Providers from "../components/components-global/Providers"
import { Toaster } from "../components/components-ui/Toaster"
import Footer from "../components/Footer"
import NavBar from "../components/NavBar"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${GeistSans.variable}`}
      >
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Bangers&family=Bungee+Inline&family=Chivo+Mono:wght@300&family=Cinzel&family=Cinzel+Decorative&family=Fauna+One&family=Galada&family=Indie+Flower&family=Open+Sans&family=Press+Start+2P&family=Prompt:wght@400;600&family=Rampart+One&family=Sigmar+One&family=Sonsie+One&family=Urbanist:ital,wght@0,400;1,600&display=swap"
            rel="stylesheet"
          />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
          />
        </Head>
        <Script
          data-ad-client="ca-pub-8040318911928921"
          async={true}
          id="adsbygoogle-init"
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8040318911928921"
        />
        <Script src="https://www.payfast.co.za/onsite/engine.js"></Script>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="light">
            <Providers>
              <div className="relative flex min-h-screen flex-col">
                {/* @ts-expect-error Server Component */}
                <NavBar />
                <Footer />
                <div className="flex-1">{children}</div>
              </div>
              <TailwindIndicator />
            </Providers>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}
