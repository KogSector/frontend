"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MarketPlaceAgent, MarketplaceModal } from "./MarketplaceModal";
import { Bot, Plus, Settings, RefreshCw, Trash2, Activity, Play, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ConnectedAgent = {
  id: string;
  name: string;
  provider: string;
  status: "connected" | "pending" | "error";
  category: string;
  lastSync: string;
};

export function AgentsDashboard() {
  const [agents, setAgents] = useState<ConnectedAgent[]>([]);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initial dummy data to show some state
    setAgents([
      { id: "1", name: "GitHub Copilot", provider: "GitHub", status: "connected", category: "extension", lastSync: "10 mins ago" },
      { id: "2", name: "Custom GPT", provider: "OpenAI", status: "connected", category: "webapp", lastSync: "1 hour ago" },
    ]);
  }, []);

  const handleAgentAdded = (agent: any) => {
    const newAgent: ConnectedAgent = {
      id: Math.random().toString(36).substr(2, 9),
      name: agent.name,
      provider: agent.provider,
      status: "connected",
      category: agent.category,
      lastSync: "Just now",
    };
    setAgents((prev) => [newAgent, ...prev]);
  };

  const removeAgent = (id: string) => {
    setAgents(agents.filter(a => a.id !== id));
    toast({
      title: "Agent Removed",
      description: "The agent connection has been deleted.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Agents
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your AI assistant connections and IDE integrations.
          </p>
        </div>
        <Button onClick={() => setIsMarketplaceOpen(true)} className="group shadow-lg shadow-primary/20 transition-all hover:scale-105">
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Add Agent
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Connected Agents
              <Bot className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{agents.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-card/50 border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Active Syncs
              <RefreshCw className="w-4 h-4 text-accent" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{agents.filter(a => a.status === 'connected').length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-card/50 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total Requests (24h)
              <Activity className="w-4 h-4 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,482</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="relative overflow-hidden group hover:shadow-lg hover:border-primary/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    {agent.status}
                  </div>
                </div>
              </div>
              <CardTitle className="mt-4 text-xl">{agent.name}</CardTitle>
              <CardDescription className="uppercase tracking-wider text-xs">
                {agent.provider} • {agent.category}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> {agent.lastSync}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Config
                </Button>
                <Button variant="destructive" size="sm" className="px-3" onClick={() => removeAgent(agent.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card 
          className="border-dashed border-2 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group min-h-[220px]"
          onClick={() => setIsMarketplaceOpen(true)}
        >
          <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 mb-4 transition-colors">
            <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">Add New Agent</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">Browse the marketplace to connect an IDE, extension, or agent.</p>
        </Card>
      </div>

      <MarketplaceModal 
        open={isMarketplaceOpen} 
        onOpenChange={setIsMarketplaceOpen}
        onAgentSelected={handleAgentAdded}
      />
    </div>
  );
}
