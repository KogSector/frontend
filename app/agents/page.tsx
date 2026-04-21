"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Footer } from "@/components/ui/footer";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { AgentsDashboard } from "@/components/agents/AgentsDashboard";

export default function AgentsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl md:text-4xl font-bold font-orbitron bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                  ConFuse
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <ProfileAvatar />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AgentsDashboard />
        </div>

        <Footer />
      </div>
    </AuthGuard>
  );
}
