'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useAuth } from '@/contexts/auth';
import { DemoModal } from "./DemoModal";

export function HeroSection() {
  const { isAuthenticated } = useAuth();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/auth/login';
    }
  };

  const handleViewDocs = () => {
    window.open("/docs", "_blank");
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 grid grid-cols-[100px_1fr_100px] grid-rows-[100px_1fr_100px] pointer-events-none opacity-20">
        <div className="border-r border-b border-border"></div>
        <div className="border-b border-border"></div>
        <div className="border-l border-b border-border"></div>
        <div className="border-r border-border"></div>
        <div></div>
        <div className="border-l border-border"></div>
        <div className="border-r border-t border-border"></div>
        <div className="border-t border-border"></div>
        <div className="border-l border-t border-border"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10 w-full">
        <div className="space-y-12">
          <div className="inline-block border border-border px-3 py-1 text-sm font-medium uppercase tracking-wider text-muted-foreground bg-background">
            v1.0.0-beta
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              Unify your <br />
              codebase context.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed font-medium">
              Connect repositories, documentation, and external resources. 
              Give your development environment instant, complete understanding of your architecture.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-none font-medium text-base group"
              onClick={handleGetStarted}
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              className="h-12 px-8 border-border hover:bg-muted transition-colors rounded-none font-medium text-base"
              onClick={() => setIsDemoOpen(true)}
            >
              <Play className="w-4 h-4 mr-2" />
              Watch Demo
            </Button>
          </div>

          <DemoModal
            isOpen={isDemoOpen}
            onClose={() => setIsDemoOpen(false)}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 pt-16 border-t border-border">
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight">1k+</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Sources</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight">50+</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Integrations</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight">&lt;10ms</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Latency</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight">99.9%</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
