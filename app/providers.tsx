'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { LoggingProvider } from "@/components/providers/LoggingProvider"
import { Auth0Provider as CustomAuth0Provider } from "@/contexts/auth0-context"

function Auth0LoggingWrapper({ children }: { children: React.ReactNode }) {
  // Uses the npm @auth0/auth0-react hook (provided by Auth0ProviderWithNavigate in layout.tsx)
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
      <CustomAuth0Provider>
        <Auth0LoggingWrapper>
          {children}
        </Auth0LoggingWrapper>
      </CustomAuth0Provider>
    </QueryClientProvider>
  )
}
