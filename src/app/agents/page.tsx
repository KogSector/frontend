"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { AuthGuard } from "@/app/auth/components/AuthGuard";
import { Footer } from "@/components/layout/footer";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bot, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function AgentsPage() {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const mcpUrl = `https://client-connector.onrender.com/api/v1/mcp/sse${user?.id ? `?userId=${user.id}` : ''}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mcpUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
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

        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">Connect Your AI Agent</h2>
              <p className="text-muted-foreground text-lg">
                ConFuse provides a remote Model Context Protocol (MCP) server. Provide the URL below to your AI agent or IDE (like Cursor or Windsurf) to connect.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm mb-8">
              <div className="flex justify-between items-center px-4 py-3 bg-muted/50 border-b border-border">
                <span className="text-sm font-medium text-muted-foreground">Your Secure Connection URL</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopy}
                  className="h-8 flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-green-500 text-xs">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </Button>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm text-foreground font-mono text-center py-2">
                  <code>{mcpUrl}</code>
                </pre>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Native HTTP Card */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-5 flex flex-col">
                <h4 className="text-blue-500 font-semibold mb-3">Native (type: http)</h4>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  Commonly used by <strong>VS Code</strong> native settings for remote connections.
                </p>
                <pre className="bg-background/80 p-3 rounded-md text-xs font-mono overflow-x-auto border border-border/50">
{`{
  "servers": {
    "ConFuse": {
      "url": "${mcpUrl}",
      "type": "http"
    }
  }
}`}
                </pre>
              </div>

              {/* Native SSE Card */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-5 flex flex-col">
                <h4 className="text-emerald-500 font-semibold mb-3">Native (type: sse)</h4>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  Commonly used by <strong>Windsurf</strong> or <strong>Antigravity</strong> in their config files.
                </p>
                <pre className="bg-background/80 p-3 rounded-md text-xs font-mono overflow-x-auto border border-border/50">
{`{
  "mcpServers": {
    "ConFuse": {
      "url": "${mcpUrl}",
      "type": "sse"
    }
  }
}`}
                </pre>
              </div>

              {/* Stdio Proxy Card */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-5 flex flex-col">
                <h4 className="text-purple-500 font-semibold mb-3">Stdio Proxy (CLI)</h4>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  Required for <strong>Cursor</strong> or <strong>Claude Desktop</strong> which only support local scripts.
                </p>
                <pre className="bg-background/80 p-3 rounded-md text-xs font-mono overflow-x-auto border border-border/50">
{`{
  "mcpServers": {
    "ConFuse": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${mcpUrl}"]
    }
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </AuthGuard>
  );
}
