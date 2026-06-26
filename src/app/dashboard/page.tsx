"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import dynamic from 'next/dynamic';

const Footer = dynamic(() => import("@/components/layout/footer").then(mod => mod.Footer));
import { AuthGuard } from "@/app/auth/components/AuthGuard";
import { getSources, deleteUrl, deleteRepository, authClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  Plus,
  Settings,
  Activity,
  Network,
  Shield,
  Users,
  MessageSquare,
  Globe2,
  Trash2,
  GitBranch,
  FileText,
  Link as LinkIcon,
  BookOpen,
  Globe,
  PenTool
} from "lucide-react";

interface SourceItem {
  id: string;
  name: string;
  type: string;
  status: string;
  uri?: string;
  metadata?: any;
}

interface AgentItem {
  id: string;
  name: string;
  provider?: string;
  status: string;
  usage_stats?: {
    total_requests: number;
  };
}

interface DashboardStats {
  repositories: number;
  documents: number;
  urls: number;
  connections: number;
  context_requests: number;
  security_score: number;
  activity: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    repositories: 0,
    documents: 0,
    urls: 0,
    connections: 0,
    context_requests: 0,
    security_score: 98,
    activity: [],
  });
  const [loading, setLoading] = useState(true);
  const [recentSources, setRecentSources] = useState<SourceItem[]>([]);
  const [recentAgents, setRecentAgents] = useState<AgentItem[]>([]);
  const [hideSwitchUse, setHideSwitchUse] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const fetchData = useCallback(async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      }

      // Use the centralized dashboard stats API
      const [dashboardStatsResp, sourcesResp] = await Promise.all([
        import('@/lib/api').then(api => api.getDashboardStats()).catch(() => null),
        getSources().catch(() => null)
      ]);

      if (dashboardStatsResp && dashboardStatsResp.success === false) {
        console.warn('Dashboard stats API returned failure, using fallback calculation');
      }

      const dashboardStats = (dashboardStatsResp as any).data || dashboardStatsResp;

      // Extract sources for the "Connected Sources" list
      let sources: SourceItem[] = [];
      if (sourcesResp && sourcesResp.success) {
        sources = (sourcesResp as any).sources || (sourcesResp as any).data || [];
      }

      // Merge in repositories if needed for the recent list
      const reposResp = await import('@/lib/api').then(api => api.getRepositories()).catch(() => null);
      if (reposResp && (reposResp as any).success) {
        const repos = (reposResp as any).data?.repositories || (reposResp as any).repositories || [];
        const repoSources = repos.map((repo: any) => ({
          id: repo.id,
          name: repo.name || repo.url,
          type: repo.provider || 'repository',
          status: repo.status || 'active',
          uri: repo.url,
        }));

        repoSources.forEach((rs: SourceItem) => {
          if (!sources.some(s => s.id === rs.id)) {
            sources.push(rs);
          }
        });
      }

      setRecentSources(Array.isArray(sources) ? sources.slice(0, 4) : []);

      // Update stats from the dashboard API
      setStats({
        repositories: dashboardStats.repositories || 0,
        documents: dashboardStats.documents || 0,
        urls: dashboardStats.urls || 0,
        connections: dashboardStats.connections || (sources.length),
        context_requests: dashboardStats.context_requests || 0,
        security_score: dashboardStats.security_score || 98,
        activity: dashboardStats.activity || [],
      });

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
      }
    }
  }, []); // Empty dependency array as this function doesn't depend on external props

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl md:text-4xl font-bold font-orbitron bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-primary dark:via-primary-glow dark:to-accent bg-clip-text text-transparent">ConFuse</h1>
              </div>
              <div className="flex items-center gap-4">
                <ProfileAvatar />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-12 mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4 mt-7">
                {[
                  {
                    href: "/sources/repositories",
                    icon: GitBranch,
                    label: "Repository",
                    buttonText: "Connect",
                    gradient: "from-blue-500 to-purple-600",
                    bgIcon: "bg-blue-500/10 text-blue-500",
                    btnColor: "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20"
                  },
                  {
                    href: "/sources/documents",
                    icon: FileText,
                    label: "Documents",
                    buttonText: "Add",
                    gradient: "from-emerald-500 to-teal-600",
                    bgIcon: "bg-emerald-500/10 text-emerald-500",
                    btnColor: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                  },
                  {
                    href: "/sources/urls",
                    icon: LinkIcon,
                    label: "URLs",
                    buttonText: "Add",
                    gradient: "from-orange-500 to-red-600",
                    bgIcon: "bg-orange-500/10 text-orange-500",
                    btnColor: "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20"
                  },
                  {
                    href: "/sources/chats",
                    icon: MessageSquare,
                    label: "Chats",
                    buttonText: "Connect",
                    gradient: "from-pink-500 to-rose-600",
                    bgIcon: "bg-pink-500/10 text-pink-500",
                    btnColor: "bg-pink-500 hover:bg-pink-600 text-white shadow-pink-500/20"
                  },
                  {
                    href: "/sources/design",
                    icon: PenTool,
                    label: "Design",
                    buttonText: "Connect",
                    gradient: "from-fuchsia-500 to-purple-600",
                    bgIcon: "bg-fuchsia-500/10 text-fuchsia-500",
                    btnColor: "bg-fuchsia-500 hover:bg-fuchsia-600 text-white shadow-fuchsia-500/20"
                  },
                  {
                    href: "/connections",
                    icon: Users,
                    label: "Connections",
                    buttonText: "View",
                    gradient: "from-indigo-500 to-purple-600",
                    bgIcon: "bg-indigo-500/10 text-indigo-500",
                    btnColor: "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20"
                  },
                  {
                    href: "/agents/rules",
                    icon: Network,
                    label: "Agent Rules",
                    buttonText: "Configure",
                    gradient: "from-cyan-500 to-blue-600",
                    bgIcon: "bg-cyan-500/10 text-cyan-500",
                    btnColor: "bg-cyan-500 hover:bg-cyan-600 text-white shadow-cyan-500/20"
                  },
                  {
                    href: "/docs",
                    icon: BookOpen,
                    label: "Documentation",
                    buttonText: "View",
                    gradient: "from-indigo-500 to-purple-600",
                    bgIcon: "bg-indigo-500/10 text-indigo-500",
                    btnColor: "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20"
                  }
                ].map((action, idx) => (
                  <Card key={idx} className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card border-border">
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`}></div>
                    <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-lg ${action.bgIcon}`}>
                          <action.icon className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-foreground">{action.label}</span>
                      </div>
                      <Link href={action.href} target={action.href === '/docs' ? '_blank' : undefined} className="w-full">
                        <Button className={`w-full shadow-md transition-all duration-300 ${action.btnColor}`}>
                          {action.buttonText}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Repositories
                    </CardTitle>
                    <GitBranch className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{loading ? '...' : stats.repositories}</div>
                    <p className="text-xs text-muted-foreground">
                      Connected repos
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Documents
                    </CardTitle>
                    <FileText className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{loading ? '...' : stats.documents}</div>
                    <p className="text-xs text-muted-foreground">
                      Indexed documents
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      URLs
                    </CardTitle>
                    <LinkIcon className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{loading ? '...' : stats.urls}</div>
                    <p className="text-xs text-muted-foreground">
                      Connected URLs
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Context Requests
                    </CardTitle>
                    <Activity className="w-4 h-4 text-primary-glow" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{loading ? '...' : (stats.context_requests || 0).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Last 24 hours
                    </p>
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Connected Sources
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4" onClick={(e) => {
                const target = e.target as HTMLElement;
                const deleteBtn = target.closest('button[data-action="delete-source"]');
                if (deleteBtn) {
                  e.preventDefault();
                  e.stopPropagation();
                  const sourceId = deleteBtn.getAttribute('data-id');
                  const sourceType = deleteBtn.getAttribute('data-type');
                  if (sourceId && sourceType) {
                    // handleDeleteSource is not defined so we'll implement the logic here
                    if (confirm('Are you sure you want to delete this source?')) {
                      try {
                        if (sourceType === 'url') {
                          deleteUrl(sourceId);
                        } else {
                          deleteRepository(sourceId);
                        }
                        setRecentSources(prev => prev.filter(s => s.id !== sourceId));
                        fetchData(true);
                        toast({ title: "Source Deleted", description: "The source has been removed." });
                      } catch (error) {
                        toast({ variant: "destructive", title: "Delete Failed", description: "Could not delete source." });
                      }
                    }
                  }
                }
              }}>
                {loading ? (
                  <div className="flex justify-center p-4">
                    <Activity className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : recentSources.length > 0 ? (
                  recentSources.map((source, index) => {
                    const getIcon = (type: string) => {
                      switch (type.toLowerCase()) {
                        case 'github':
                        case 'gitlab':
                        case 'bitbucket':
                        case 'repository':
                          return GitBranch;
                        case 'url':
                        case 'web':
                          return Globe2;
                        case 'document':
                        case 'upload':
                          return FileText;
                        default:
                          return LinkIcon;
                      }
                    };
                    const IconComponent = getIcon(source.type);
                    return (
                      <div key={source.id || index} className="group/item flex flex-col p-3 rounded-lg bg-muted/20 border border-border gap-2 hover:border-primary/50 transition-colors relative">
                        <div className="flex items-center justify-between">
                          <Link href={source.type === 'url' ? '/sources/urls' : '/sources/repositories'} className="flex items-center space-x-3 flex-1 min-w-0">
                            <IconComponent className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="font-medium text-foreground truncate max-w-[150px]">
                              {source.name || source.uri || 'Untitled'}
                            </span>
                          </Link>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs capitalize">{source.type}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              data-action="delete-source"
                              data-id={source.id}
                              data-type={source.type}
                              className="h-8 w-8 p-0 opacity-0 group-hover/item:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${source.status === 'active' || source.status === 'syncing' || source.status === 'pending' || source.status === 'connected' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-400'
                            }`}></div>
                          <div className="text-sm text-muted-foreground">
                            Status: {source.status}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No sources connected yet.
                  </div>
                )}
              </CardContent>
            </Card>



            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(stats.activity && stats.activity.length > 0 ? stats.activity : [
                  { action: "No recent activity", source: "-", time: "Now", type: "system" },
                ]).map((activity, index) => {
                  const getIcon = (type: string) => {
                    switch (type) {
                      case 'document': return FileText;
                      case 'repository': return GitBranch;
                      case 'url': return Globe;
                      case 'agent': return Bot;
                      default: return Activity;
                    }
                  };
                  const IconComponent = getIcon(activity.type);
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20 border border-border">
                      <IconComponent className="w-4 h-4 text-primary" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{activity.action}</div>
                        <div className="text-xs text-muted-foreground">{activity.source} • {activity.time}</div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    </AuthGuard>
  );
}