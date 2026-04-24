"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

const HeroSection = dynamic(() => import("@/components/sections/HeroSection").then(mod => mod.HeroSection), {
  loading: () => <div className="h-[600px] animate-pulse bg-muted/20" />
});

const FeaturesSection = dynamic(() => import("@/components/sections/FeaturesSection").then(mod => mod.FeaturesSection), {
  loading: () => <div className="h-[400px] animate-pulse bg-muted/10" />
});

const Footer = dynamic(() => import("@/components/ui/footer").then(mod => mod.Footer));
const Navbar = dynamic(() => import("@/components/ui/navbar").then(mod => mod.Navbar));
import { useAuth } from '@/contexts/auth'

const LOADING_TIMEOUT_MS = 1500; // Max 1.5 seconds for loading

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // Fallback: show landing page after timeout even if still loading
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        console.log("Auth loading timeout - showing landing page");
        setShowLanding(true);
      }, LOADING_TIMEOUT_MS);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  // Show landing page if timeout reached or loading finished
  if (showLanding || (!isLoading && !isAuthenticated)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar showUserMenu={false} />
        <HeroSection />
        <FeaturesSection />
        <Footer />
      </div>
    );
  }

  // If authenticated, redirect happens via useEffect
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading spinner while checking auth (max 3 seconds)
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
