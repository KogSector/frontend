import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Providers } from './providers'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ConFuse - Unify your repositories with AI for better microservices development',
  description: 'ConFuse unifies your repositories with AI for better microservices development. Connect repositories, documentation, and external resources to give your development environment instant, complete understanding of your architecture.',
  openGraph: {
    title: 'ConFuse - Unify your repositories with AI for better microservices development',
    description: 'ConFuse unifies your repositories with AI for better microservices development. Connect repositories, documentation, and external resources to give your development environment instant, complete understanding of your architecture.',
    type: 'website',
    url: 'https://confuse.site',
    siteName: 'ConFuse',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  metadataBase: new URL('https://confuse.site'),
  alternates: {
    canonical: '/',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={spaceGrotesk.className}>
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "ConFuse",
              "description": "ConFuse unifies your repositories with AI for better microservices development. Connect repositories, documentation, and external resources to give your development environment instant, complete understanding of your architecture.",
              "url": "https://confuse.site",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "ConFuse"
              },
              "featureList": [
                "Multi-Source Connection",
                "Immutable Context",
                "Granular Security",
                "Low-Latency Retrieval"
              ]
            })
          }}
        />
        <Script
          id="faq-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is ConFuse?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "ConFuse is a developer platform that unifies your repositories with AI for better microservices development. It connects repositories, documentation, and external resources to give your development environment instant, complete understanding of your architecture."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How does ConFuse work?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "ConFuse integrates with your existing development tools and repositories, creating a unified knowledge layer that AI agents and developers can query instantly. It uses vector search and graph traversal to provide sub-10ms response times."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What integrations does ConFuse support?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "ConFuse supports 50+ integrations including GitHub, GitLab, Bitbucket, Notion, Slack, Figma, Google Drive, and many more. You can connect repositories, documentation, and external resources."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is ConFuse secure?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, ConFuse implements granular security with row-level security and explicit scoping. Authorized agents only access what they are explicitly permitted to see. Your architecture knowledge is versioned, synced, and immutable."
                  }
                }
              ]
            })
          }}
        />
        <Providers>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  )
}