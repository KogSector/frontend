"use client";

import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { Footer } from "@/components/layout/footer";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { AgentsDashboard } from "@/features/agents/components/AgentsDashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bot } from "lucide-react";
import Link from "next/link";

export default function AgentsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <div className="flex items-center space-x-3">
                  <Bot className="w-6 h-6 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">Agents</h1>
                </div>
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
