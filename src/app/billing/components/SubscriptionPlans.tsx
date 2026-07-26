'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Zap, Building, Crown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  tier: string
  price_monthly: number
  formatted_price?: string
  features: string[] | Record<string, any>
  limits: Record<string, any>
}

export function SubscriptionPlans() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [currentSubData, setCurrentSubData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    fetchPlans()
    fetchCurrentSubscription()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/billing/plans')
      if (response.ok) {
        const plansData = await response.json()
        setPlans(plansData)
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error)
    }
  }

  const fetchCurrentSubscription = async () => {
    try {
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      const response = await fetch('/api/billing/subscription', { headers })
      if (response.ok) {
        const result = await response.json()
        setCurrentSubData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (tier: string) => {
    if (tier === 'free') return
    setSubscribing(tier)
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      })

      if (response.ok) {
        const resData = await response.json()
        const checkoutUrl = resData?.data?.checkoutUrl
        if (checkoutUrl) {
          toast({
            title: 'Redirecting to LemonSqueezy Checkout',
            description: 'Please complete your subscription payment.',
          })
          window.location.href = checkoutUrl
          return
        }
      }

      toast({
        title: 'Checkout Failed',
        description: 'Could not generate checkout link. Please try again.',
        variant: 'destructive',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setSubscribing(null)
    }
  }

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const resData = await response.json()
        const portalUrl = resData?.data?.portalUrl
        if (portalUrl) {
          window.location.href = portalUrl
          return
        }
      }
      window.location.href = 'https://tryconfuse.lemonsqueezy.com/billing'
    } catch {
      window.location.href = 'https://tryconfuse.lemonsqueezy.com/billing'
    } finally {
      setPortalLoading(false)
    }
  }

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Star className="h-6 w-6 text-blue-400" />
      case 'pro':
        return <Zap className="h-6 w-6 text-amber-500" />
      case 'team':
        return <Building className="h-6 w-6 text-emerald-500" />
      case 'enterprise':
        return <Crown className="h-6 w-6 text-purple-500" />
      default:
        return <Star className="h-6 w-6 text-blue-400" />
    }
  }

  const userTier = currentSubData?.subscription?.tier || user?.subscription_tier || 'free'

  const isCurrentPlan = (tier: string) => {
    return userTier === tier
  }

  const renderFeatureList = (plan: SubscriptionPlan) => {
    if (Array.isArray(plan.features)) {
      return plan.features
    }
    const featureList: string[] = []
    if (plan.features?.repositories) featureList.push(plan.features.repositories)
    if (plan.features?.documents) featureList.push(plan.features.documents)
    if (plan.features?.storage) featureList.push(plan.features.storage)
    if (plan.features?.requests) featureList.push(plan.features.requests)
    if (plan.features?.connected_users) featureList.push(plan.features.connected_users)
    if (plan.features?.security) featureList.push(plan.features.security)
    return featureList
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-6 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="space-y-2">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-4 bg-muted rounded"></div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground mt-2">
          Connect LemonSqueezy for seamless payments and scaled access
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative flex flex-col justify-between ${
              plan.tier === 'pro' ? 'border-primary shadow-lg ring-1 ring-primary' : ''
            } ${isCurrentPlan(plan.tier) ? 'ring-2 ring-emerald-500 border-emerald-500' : ''}`}
          >
            {plan.tier === 'pro' && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                Most Popular
              </Badge>
            )}
            {isCurrentPlan(plan.tier) && (
              <Badge className="absolute -top-3 right-4 bg-emerald-500 text-white">
                Active Plan
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {getPlanIcon(plan.tier)}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription className="min-h-[40px] text-xs mt-1">{plan.description}</CardDescription>
              <div className="text-3xl font-bold mt-2">
                {plan.formatted_price || (plan.price_monthly === 0 ? '₹0/month' : `₹${plan.price_monthly.toLocaleString()}/month`)}
              </div>
            </CardHeader>

            <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
              <ul className="space-y-2 text-left">
                {renderFeatureList(plan).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground text-xs leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full mt-4"
                variant={isCurrentPlan(plan.tier) ? 'secondary' : plan.tier === 'pro' ? 'default' : 'outline'}
                disabled={isCurrentPlan(plan.tier) || subscribing === plan.tier}
                onClick={() => handleSubscribe(plan.tier)}
              >
                {subscribing === plan.tier ? (
                  'Processing...'
                ) : isCurrentPlan(plan.tier) ? (
                  'Current Plan'
                ) : plan.tier === 'free' ? (
                  'Free Tier'
                ) : (
                  `Subscribe (${plan.name})`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {currentSubData && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg">Subscription Overview</CardTitle>
            <CardDescription>
              Current Active Plan: <span className="font-semibold text-foreground uppercase">{userTier}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Status: <span className="text-emerald-500 capitalize">{currentSubData?.subscription?.status || 'Active'}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Storage Used: {currentSubData?.usage?.storageUsedMb || 0} MB / {currentSubData?.limits?.maxStorageMb || 256} MB
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                disabled={portalLoading}
                onClick={handleManageSubscription}
              >
                {portalLoading ? 'Loading Portal...' : 'Manage Subscription'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}