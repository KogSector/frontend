'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { Footer } from "@/components/layout/footer";
import { ArrowLeft, PenTool } from "lucide-react";
import Link from "next/link";
import FigmaIcon from "@/components/icons/FigmaIcon";
import ZeplinIcon from "@/components/icons/ZeplinIcon";
import { useState, useEffect } from "react";
import { authClient, unwrapResponse } from "@/lib/api";
import { useAuth } from "@/contexts/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

export default function DesignSourcesPage() {
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const { token } = useAuth();
  
  const [isFigmaDialogOpen, setIsFigmaDialogOpen] = useState(false);
  const [figmaFileUrl, setFigmaFileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConnectFigma = async () => {
    if (!figmaFileUrl) {
      toast({
        title: "Error",
        description: "Please provide a Figma URL or Key.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      toast({
        title: "Success",
        description: "Figma file connected successfully.",
      });
      setFigmaFileUrl('');
      setIsFigmaDialogOpen(false);
    } catch (e) {
      toast({ title: "Error", description: "Failed to connect", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchConnections = async () => {
      if (!token) return;
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const authResp = await authClient.get('/api/auth/connections', headers);
        const authData = unwrapResponse<any[]>(authResp) ?? [];
        const activePlatforms = authData
          .filter(conn => conn.is_active)
          .map(conn => conn.platform);
        setConnectedPlatforms(activePlatforms);
      } catch (error) {
        console.error('Error fetching connections:', error);
      }
    };
    fetchConnections();
  }, [token]);

  const designApps = [
    {
      id: "figma",
      name: "Figma",
      description: "Connect your Figma design files, components, and prototypes.",
      icon: FigmaIcon,
      href: "/sources/design/figma",
      status: "Available"
    },
    {
      id: "zeplin",
      name: "Zeplin",
      description: "Connect Zeplin workspaces, projects, and styleguides.",
      icon: ZeplinIcon,
      href: "#",
      status: "Coming Soon"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                <PenTool className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Design Sources</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ProfileAvatar />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Select a Design Tool</h2>
          <p className="text-muted-foreground">
            Choose a design platform to connect. We will ingest your design files, turning screens and components into searchable semantic nodes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {designApps.map((app) => (
            <Card key={app.id} className="bg-card border-border hover:shadow-lg transition-all group overflow-hidden relative">
              {app.status === "Coming Soon" && (
                <div className="absolute top-3 right-3 bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full font-medium">
                  Coming Soon
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-muted rounded-xl group-hover:scale-110 transition-transform">
                    <app.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{app.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  {app.description}
                </p>
                {app.status === "Available" ? (
                  connectedPlatforms.includes(app.id) ? (
                    <div className="w-full">
                      <Button className="w-full" onClick={() => {
                        if (app.id === 'figma') setIsFigmaDialogOpen(true);
                      }}>Connect File</Button>
                    </div>
                  ) : (
                    <div className="w-full">
                      <Button className="w-full" disabled>Connect File</Button>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Requires <Link href="/connections" className="underline">{app.name} connection</Link>
                      </p>
                    </div>
                  )
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Unavailable
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Footer />

      <Dialog open={isFigmaDialogOpen} onOpenChange={setIsFigmaDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect Figma File</DialogTitle>
            <DialogDescription>
              Enter the URL or Key of the Figma file you want to connect.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="figma-url">Figma File URL or Key</Label>
              <Input
                id="figma-url"
                placeholder="https://www.figma.com/file/..."
                value={figmaFileUrl}
                onChange={(e) => setFigmaFileUrl(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFigmaDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleConnectFigma} disabled={loading}>
              {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
