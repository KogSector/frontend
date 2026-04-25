"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { HeroSection } from "@/components/sections/HeroSection";
import { Navbar } from "@/components/ui/navbar";
import { useAuth } from '@/contexts/auth'

const FeaturesSection = dynamic(() => import("@/components/sections/FeaturesSection").then(mod => mod.FeaturesSection), {
  loading: () => <div className="h-[400px] animate-pulse bg-muted/10" />
});

const Footer = dynamic(() => import("@/components/ui/footer").then(mod => mod.Footer));

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to dashboard in the background
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // Render the landing page content instantly.
  // We prioritize speed and "above-the-fold" visibility.
  return (
    <div className="min-h-screen bg-background">
      <Navbar showUserMenu={false} />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
}
