'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/auth'
import { Button } from '@/components/ui/button'
import { LogoOrbit } from '@/components/auth/LogoOrbit'

// ----------------------------------------------------------------------
// GOOGLE LOGO SVG
// ----------------------------------------------------------------------

const GoogleLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

// ----------------------------------------------------------------------
// SOCIAL LOGIN BUTTONS
// ----------------------------------------------------------------------

interface SocialLoginButtonsProps {
  mode: 'login' | 'register'
  onSocialLogin: (provider: string) => void
  disabled?: boolean
  showMicrosoft?: boolean
}

const MicrosoftLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <path fill="#f25022" d="M0 0h10v10H0z" />
    <path fill="#7fba00" d="M11 0h10v10H11z" />
    <path fill="#00a4ef" d="M0 11h10v10H0z" />
    <path fill="#ffb900" d="M11 11h10v10H11z" />
  </svg>
)

function SocialLoginButtons({ mode, onSocialLogin, disabled, showMicrosoft }: SocialLoginButtonsProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Google Button */}
      <Button
        type="button"
        onClick={() => onSocialLogin('google-oauth2')}
        disabled={disabled}
        className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-lg text-base font-medium transition-all hover:border-gray-300 hover:shadow-sm active:scale-[0.98]"
      >
        <GoogleLogo className="mr-3 h-5 w-5 flex-shrink-0" />
        Continue with Google
      </Button>

      {/* Microsoft Button */}
      {showMicrosoft && (
        <Button
          type="button"
          onClick={() => onSocialLogin('windowslive')}
          disabled={disabled}
          className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-lg text-base font-medium transition-all hover:border-gray-300 hover:shadow-sm active:scale-[0.98]"
        >
          <MicrosoftLogo className="mr-3 h-5 w-5 flex-shrink-0" />
          Continue with Microsoft
        </Button>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------
// MAIN LOGIN FORM
// ----------------------------------------------------------------------

export function LoginForm() {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showMicrosoft, setShowMicrosoft] = useState(false)

  const { loginWithRedirect } = useAuth()

  React.useEffect(() => {
    import('@/lib/api').then(api => {
      api.isToggleEnabled('enableMicrosoftAuth').then(setShowMicrosoft).catch(console.error)
    })
  }, [])

  const handleSocialLogin = async (provider: string) => {
    console.log('🔘 Social login button clicked:', provider)
    setError('')
    setIsLoading(true)

    try {
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
    <div className="flex min-h-screen bg-background">
      {/* ================================================================ */}
      {/* LEFT PANEL — Branding (hidden on mobile)                       */}
      {/* ================================================================ */}
      <div className="hidden md:flex md:w-[45%] lg:w-[48%] flex-col bg-[#0a0a0a] relative overflow-hidden">
        {/* Subtle grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative z-10 flex flex-col h-full p-12 lg:p-16">
          {/* Top: Logo + Wordmark */}
          <div className="flex items-center gap-3">
            <Image
              src="/favicon.svg"
              alt="ConFuse"
              width={32}
              height={32}
              className="opacity-90"
            />
            <span className="text-lg font-semibold tracking-tight text-white/90">
              ConFuse
            </span>
          </div>

          {/* Middle: Content area — pushed down */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1] mb-6">
              Your context,<br />
              finally understood.
            </h1>

            <p className="text-base lg:text-lg text-white/60 leading-relaxed max-w-md">
              ConFuse connects your GitHub, Notion, BitBucket, docs and many more into one
              knowledge layer your AI agents can actually understand. Ask
              questions in natural language from any IDE — no vendor lock-in.
            </p>
          </div>

          {/* Logo Orbit — decorative */}
          <div className="flex justify-center py-8">
            <LogoOrbit />
          </div>

          {/* Bottom footer */}
          <p className="text-xs text-white/30 mt-auto pt-8">
            Building a microservice architecture?{' '}
            <a
              href="/docs"
              className="text-white/50 hover:text-white/70 underline underline-offset-2 transition-colors"
            >
              Read the docs
            </a>
          </p>
        </div>
      </div>

      {/* ================================================================ */}
      {/* RIGHT PANEL — Auth Card                                        */}
      {/* ================================================================ */}
      <div className="w-full md:w-[55%] lg:w-[52%] flex items-center justify-center bg-white p-6 md:p-8">
        <div className="w-full max-w-[420px]">
          {/* Mobile: show compact logo + tagline */}
          <div className="md:hidden mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Image
                src="/favicon.svg"
                alt="ConFuse"
                width={28}
                height={28}
                className="invert opacity-80"
              />
              <span className="text-base font-semibold tracking-tight text-gray-900">
                ConFuse
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Your context, finally understood.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 md:p-10">
            {/* Card header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <Image
                  src="/favicon.svg"
                  alt="ConFuse"
                  width={24}
                  height={24}
                  className="invert opacity-80"
                />
                <span className="text-sm font-semibold tracking-tight text-gray-900">
                  ConFuse
                </span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
                Log In/Create Account
              </h2>
              <p className="text-sm text-gray-500">
                Sign in/up to access your knowledge layer.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {error}
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
                Redirecting to Google...
              </div>
            )}

            {/* Social Login */}
            <SocialLoginButtons
              mode="login"
              onSocialLogin={handleSocialLogin}
              disabled={isLoading}
              showMicrosoft={showMicrosoft}
            />

            {/* Divider text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-gray-600 underline underline-offset-2 hover:text-gray-900 transition-colors">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-gray-600 underline underline-offset-2 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          {/* Copyright */}
          <p className="mt-6 text-center text-xs text-gray-400">
            &copy; 2025 ConFuse. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
