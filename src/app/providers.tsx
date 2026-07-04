'use client'

import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { LoggingProvider } from "@/components/providers/LoggingProvider"
import { AuthProvider } from "@/contexts/auth"
import { ToggleProvider } from "@/contexts/toggle"
import Auth0ProviderWithNavigate from "@/components/Auth0ProviderWithNavigate"

function AuthLoggingWrapper({ children }: { children: React.ReactNode }) {
  // Use Auth0 SDK for logging provider
  const { user } = useAuth0()

  return (
    <LoggingProvider userId={user?.sub}>
      {children}
    </LoggingProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Auth0ProviderWithNavigate>
          <AuthProvider>
            <ToggleProvider>
              <AuthLoggingWrapper>
                {children}
              </AuthLoggingWrapper>
            </ToggleProvider>
          </AuthProvider>
        </Auth0ProviderWithNavigate>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
