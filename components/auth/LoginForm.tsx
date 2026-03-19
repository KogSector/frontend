'use client'

import React, { useState } from 'react'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth'

// Restore your actual project UI components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// ----------------------------------------------------------------------
// BRAND LOGOS
// ----------------------------------------------------------------------

const GoogleLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

const MicrosoftLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <path fill="#f25022" d="M0 0h10v10H0z" />
    <path fill="#7fba00" d="M11 0h10v10H11z" />
    <path fill="#00a4ef" d="M0 11h10v10H0z" />
    <path fill="#ffb900" d="M11 11h10v10H11z" />
  </svg>
)

// --- Internal Component: SocialLoginButtons ---
interface SocialLoginButtonsProps {
  mode: 'login' | 'register'
  onSocialLogin: (provider: string) => void
  disabled?: boolean
}

function SocialLoginButtons({ mode, onSocialLogin, disabled }: SocialLoginButtonsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Google Button - Top */}
      <Button
        type="button"
        onClick={() => onSocialLogin('google-oauth2')}
        disabled={disabled}
        className="w-full bg-white text-black hover:bg-gray-200 border-none h-11 text-base font-normal transition-transform transform hover:scale-[1.02] shadow-lg"
      >
        <GoogleLogo className="mr-3 h-6 w-6" />
        Continue with Google
      </Button>

      {/* Microsoft Button */}
      <Button
        type="button"
        onClick={() => onSocialLogin('windowslive')}
        disabled={disabled}
        className="w-full h-11 bg-white text-black hover:bg-gray-200 border-none text-base font-normal transition-transform transform hover:scale-[1.02] shadow-lg"
      >
        <MicrosoftLogo className="mr-3 h-6 w-6" />
        Continue with Microsoft
      </Button>
    </div>
  )
}

// Named Export (helps if you import as { LoginForm })
export function LoginForm() {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Use our custom Auth0 hook
  const { loginWithRedirect } = useAuth()

  const handleSocialLogin = async (provider: string) => {
    console.log('🔘 Social login button clicked:', provider)
    setError('')
    setIsLoading(true)

    try {
      // Use provider name directly as connection
      console.log('🔄 Calling loginWithRedirect with provider:', provider)
      await loginWithRedirect(provider)
      console.log('✅ loginWithRedirect completed')
    } catch (err) {
      console.error('❌ Social login error:', err)
      setIsLoading(false)
      setError(`Failed to sign in with ${provider}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-8 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-12">
            <CardTitle className="text-3xl font-bold text-white">Welcome</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {error && (
              <div className="p-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Loading State Spinner */}
            {isLoading && (
              <div className="flex justify-center mb-4">
                <div className="w-6 h-6 border-2 border-white/30 border-t-purple-400 rounded-full animate-spin"></div>
              </div>
            )}

            {/* Social Login Buttons - Now the main focus */}
            <SocialLoginButtons
              mode="login"
              onSocialLogin={handleSocialLogin}
              disabled={isLoading}
            />

          </CardContent>
        </Card>

        <div className="mt-4 flex justify-center">
          <Button asChild className="bg-purple-600 text-white hover:bg-purple-500 px-8">
            <Link href="/">Back</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

// Default Export (helps if you import as LoginForm)
export default LoginForm
