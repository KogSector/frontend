"use client";

import { useState } from "react";
import { AuthGuard } from "@/app/auth/components/AuthGuard";
import { Footer } from "@/components/layout/footer";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bot, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function AgentsPage() {
  const [copied, setCopied] = useState(false);

  const mcpConfig = `{
  "mcpServers": {
    "confuse-connector": {
      "command": "python",
      "args": ["-m", "app.mcp_main"]
    }
  }
}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mcpConfig);
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
                Use the Model Context Protocol (MCP) configuration below to connect your favorite coding agent (like Claude Desktop or Cursor) to ConFuse.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="flex justify-between items-center px-4 py-3 bg-muted/50 border-b border-border">
                <span className="text-sm font-medium text-muted-foreground">mcp_config.json</span>
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
                <pre className="text-sm text-foreground font-mono">
                  <code>{mcpConfig}</code>
                </pre>
              </div>
            </div>

            <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-500 font-semibold mb-2">How to use this</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>For <strong>Claude Desktop</strong>, add this to your <code>claude_desktop_config.json</code> file.</li>
                <li>For <strong>Cursor</strong>, add this under the MCP Servers section in settings.</li>
                <li>Ensure the `client-connector` service is running so the Python command works correctly.</li>
              </ul>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </AuthGuard>
  );
}
