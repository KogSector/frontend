"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { Footer } from "@/components/ui/footer";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { apiClient, getSources, getAgents } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
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
  Globe
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
  provider: string;
  status: string;
  usage_stats?: {
    total_requests: number;
  };
}

interface DashboardStats {
  repositories: number;
  documents: number;
  urls: number;
  agents: number;
  connections: number;
  context_requests: number;
  security_score: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    repositories: 0,
    documents: 0,
    urls: 0,
    agents: 0,
    connections: 0,
    context_requests: 0,
    security_score: 98,
  });
  const [loading, setLoading] = useState(true);
  const [recentSources, setRecentSources] = useState<SourceItem[]>([]);
  const [recentAgents, setRecentAgents] = useState<AgentItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats using our frontend API route
        const statsResp = await fetch('/api/dashboard/stats');
        if (statsResp.ok) {
          const data = await statsResp.json();
          setStats(data);
        }

        // Fetch recent sources
        const sourcesResp = await getSources();
        if (sourcesResp.success && sourcesResp.data) {
          const sources = (sourcesResp.data as any).sources || [];
          setRecentSources(sources.slice(0, 4));
        }

        // Fetch recent agents
        const agentsResp = await getAgents();
        if (agentsResp.success && agentsResp.data) {
          setRecentAgents(agentsResp.data.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl md:text-4xl font-bold font-orbitron bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">ConFuse</h1>
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
              <div className="grid grid-cols-2 gap-6 mt-7">
                <Link href="/sources/repositories" className="group">
                  <div className="relative transform transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl p-6 shadow-2xl border border-blue-400/20 backdrop-blur-sm transition-all duration-300">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                          <GitBranch className="w-7 h-7" />
                        </div>
                        <span className="font-semibold text-center leading-tight">Connect Repository</span>
                      </div>

                    </div>
                  </div>
                </Link>

                <Link href="/sources/documents" className="group">
                  <div className="relative transform transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl p-6 shadow-2xl border border-emerald-400/20 backdrop-blur-sm transition-all duration-300">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                          <FileText className="w-7 h-7" />
                        </div>
                        <span className="font-semibold text-center leading-tight">Add Documents</span>
                      </div>

                    </div>
                  </div>
                </Link>

                <Link href="/sources/urls" className="group">
                  <div className="relative transform transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl p-6 shadow-2xl border border-orange-400/20 backdrop-blur-sm transition-all duration-300">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                          <LinkIcon className="w-7 h-7" />
                        </div>
                        <span className="font-semibold text-center leading-tight">Add URLs</span>
                      </div>

                    </div>
                  </div>
                </Link>

                <Link href="/sources/chats" className="group">
                  <div className="relative transform transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl p-6 shadow-2xl border border-pink-400/20 backdrop-blur-sm transition-all duration-300">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                          <MessageSquare className="w-7 h-7" />
                        </div>
                        <span className="font-semibold text-center leading-tight">Connect Chats</span>
                      </div>

                    </div>
                  </div>
                </Link>

                <Link href="/connections" className="group">
                  <div className="relative transform transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl p-6 shadow-2xl border border-indigo-400/20 backdrop-blur-sm transition-all duration-300">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                          <Users className="w-7 h-7" />
                        </div>
                        <span className="font-semibold text-center leading-tight">Connections</span>
                      </div>

                    </div>
                  </div>
                </Link>

                <Link href="/agents" className="group">
                  <div className="relative transform transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl p-6 shadow-2xl border border-purple-400/20 backdrop-blur-sm transition-all duration-300">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                          <Bot className="w-7 h-7" />
                        </div>
                        <span className="font-semibold text-center leading-tight">Manage AI Agents</span>
                      </div>

                    </div>
                  </div>
                </Link>

                <Link href="/agents/rules" className="group">
                  <div className="relative transform transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-blue-600 text-white rounded-2xl p-6 shadow-2xl border border-cyan-400/20 backdrop-blur-sm transition-all duration-300">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                          <Network className="w-7 h-7" />
                        </div>
                        <span className="font-semibold text-center leading-tight">Agent Rules</span>
                      </div>

                    </div>
                  </div>
                </Link>

                <Link href="/docs" className="group">
                  <div className="relative transform transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl p-6 shadow-2xl border border-indigo-400/20 backdrop-blur-sm transition-all duration-300">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                          <BookOpen className="w-7 h-7" />
                        </div>
                        <span className="font-semibold text-center leading-tight">View Documentation</span>
                      </div>

                    </div>
                  </div>
                </Link>
              </div>
            </div>

                <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Connections
                    </CardTitle>
                    <Activity className="w-4 h-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{loading ? '...' : stats.connections}</div>
                    <p className="text-xs text-muted-foreground">
                      Sources + Agents
                    </p>
                  </CardContent>
                </Card>
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
                      AI Agents
                    </CardTitle>
                    <Bot className="w-4 h-4 text-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{loading ? '...' : stats.agents}</div>
                    <p className="text-xs text-muted-foreground">
                      Active agents
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

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Security Score
                    </CardTitle>
                    <Shield className="w-4 h-4 text-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{loading ? '...' : `${stats.security_score}%`}</div>
                    <p className="text-xs text-muted-foreground">
                      Excellent
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
                <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Connected Sources
                  </CardTitle>
                  <Link href="/sources/urls">
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add URL
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                              className="h-8 w-8 p-0 opacity-0 group-hover/item:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this source?')) {
                                  try {
                                    if (source.type === 'url') {
                                      await fetch(`${process.env.NEXT_PUBLIC_DATA_CONNECTOR_URL || 'http://localhost:8081'}/api/v1/external/urls/${source.id}`, { method: 'DELETE' });
                                    } else {
                                      await fetch(`${process.env.NEXT_PUBLIC_DATA_CONNECTOR_URL || 'http://localhost:8081'}/api/repositories/${source.id}`, { method: 'DELETE' });
                                    }
                                    setRecentSources(prev => prev.filter(s => s.id !== source.id));
                                    toast({ title: "Source Deleted", description: "The source has been removed." });
                                  } catch (error) {
                                    toast({ variant: "destructive", title: "Delete Failed", description: "Could not delete source." });
                                  }
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${source.status === 'active' || source.status === 'syncing' || source.status === 'pending' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-400'
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
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    AI Agents
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Connect Agent
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex justify-center p-4">
                    <Activity className="w-6 h-6 animate-spin text-accent" />
                  </div>
                ) : recentAgents.length > 0 ? (
                  recentAgents.map((agent, index) => (
                    <div key={agent.id || index} className="group/item flex flex-col p-3 rounded-lg bg-muted/20 border border-border gap-2 hover:border-accent/50 transition-colors relative">
                      <div className="flex items-center justify-between">
                        <Link href="/agents" className="flex items-center space-x-3 flex-1 min-w-0">
                          <Bot className="w-5 h-5 text-accent flex-shrink-0" />
                          <span className="font-medium text-foreground truncate">{agent.name}</span>
                        </Link>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${agent.status === 'Connected' || agent.status === 'active' ? 'bg-blue-500 shadow-lg shadow-blue-500/50' : 'bg-gray-400'
                            }`}></div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 opacity-0 group-hover/item:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this agent?')) {
                                try {
                                  await fetch(`${process.env.NEXT_PUBLIC_CLIENT_CONNECTOR_URL || 'http://localhost:8095'}/api/agents/${agent.id}`, { method: 'DELETE' });
                                  setRecentAgents(prev => prev.filter(a => a.id !== agent.id));
                                  toast({ title: "Agent Deleted", description: "The agent has been removed." });
                                } catch (error) {
                                  toast({ variant: "destructive", title: "Delete Failed", description: "Could not delete agent." });
                                }
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        Provider: {agent.provider}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {agent.usage_stats?.total_requests || 0} requests today
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No agents connected.
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
                {[
                  { action: "Added API docs", source: "Swagger UI", time: "2 hours ago", type: "document" },
                  { action: "Synced repository", source: "payment-service", time: "4 hours ago", type: "repository" },
                  { action: "Connected URL", source: "Team Wiki", time: "1 day ago", type: "url" },
                  { action: "Agent query", source: "GitHub Copilot", time: "2 days ago", type: "agent" },
                ].map((activity, index) => {
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
