"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Compass, Plug, MonitorSmartphone, CheckCircle, ExternalLink, HardDrive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MarketplaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentSelected: (agent: MarketplaceAgent) => void;
}

export type MarketplaceAgent = {
  id: string;
  name: string;
  provider: string;
  category: "ide" | "extension" | "webapp" | "local";
  description: string;
  icon: any;
};

const AGENT_CATALOG: MarketplaceAgent[] = [
  { id: "cursor", name: "Cursor", provider: "Anysphere", category: "ide", description: "AI-first Code Editor.", icon: Compass },
  { id: "antigravity", name: "Antigravity", provider: "Gemini", category: "ide", description: "Advanced Agentic Coding Environment.", icon: MonitorSmartphone },
  { id: "trae", name: "Trae", provider: "Trae", category: "ide", description: "Adaptive AI IDE.", icon: MonitorSmartphone },
  { id: "copilot", name: "GitHub Copilot", provider: "GitHub", category: "extension", description: "Your AI pair programmer.", icon: Plug },
  { id: "amazon-q", name: "Amazon Q", provider: "AWS", category: "extension", description: "Generative AI powered assistant for businesses and developers.", icon: Plug },
  { id: "chatgpt", name: "ChatGPT", provider: "OpenAI", category: "webapp", description: "Conversational AI model by OpenAI.", icon: ExternalLink },
  { id: "deepseek", name: "DeepSeek", provider: "DeepSeek", category: "webapp", description: "DeepSeek AI chat platform.", icon: ExternalLink },
  { id: "claude", name: "Claude", provider: "Anthropic", category: "webapp", description: "Next generation AI assistant based on Anthropic's research.", icon: ExternalLink },
  { id: "ollama", name: "Ollama", provider: "Ollama", category: "local", description: "Get up and running with large language models locally.", icon: HardDrive }
];

export function MarketplaceModal({ open, onOpenChange, onAgentSelected }: MarketplaceModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "ide" | "extension" | "webapp" | "local">("all");
  const [selectedAgent, setSelectedAgent] = useState<MarketplaceAgent | null>(null);

  const { toast } = useToast();

  const filteredAgents = AGENT_CATALOG.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const generateAndCopySnippet = () => {
    if (!selectedAgent) return;
    
    // Snippet logic based on agent type
    let snippet = "";
    if (selectedAgent.category === 'ide') {
      snippet = `{\n  "mcpServers": {\n    "confuse-${selectedAgent.name.toLowerCase()}": {\n      "command": "npx",\n      "args": ["-y", "@confuse/mcp-server"]\n    }\n  }\n}`;
    } else {
      snippet = `// Instruction for ${selectedAgent.name}\nConfigure the endpoint to: https://api.confuse.com/v1/mcp`;
    }

    navigator.clipboard.writeText(snippet);
    toast({
      title: "Connection details copied!",
      description: "Paste this JSON into your agent configuration.",
    });

    onAgentSelected(selectedAgent);
    onOpenChange(false);
    
    // Reset selection after close
    setTimeout(() => {
      setSelectedAgent(null);
      setSearchQuery("");
      setSelectedCategory("all");
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) {
        setSelectedAgent(null);
        setSearchQuery("");
        setSelectedCategory("all");
      }
    }}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Agent Marketplace
          </DialogTitle>
          <DialogDescription>
            Discover and integrate your favorite AI Agents and Tools with the ConFuse Platform.
          </DialogDescription>
        </DialogHeader>

        {selectedAgent ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 overflow-hidden">
             <div className="p-4 rounded-full bg-primary/10 mb-4">
                <selectedAgent.icon className="w-16 h-16 text-primary" />
             </div>
             <h3 className="text-2xl font-semibold">Connect {selectedAgent.name}</h3>
             <p className="text-muted-foreground text-center max-w-md">
               We have generated an MCP snippet for {selectedAgent.name}. Click below to copy it to your clipboard.
             </p>
             <div className="bg-muted w-full max-w-md p-4 rounded-xl border font-mono text-sm overflow-x-auto whitespace-pre">
               {selectedAgent.category === 'ide' 
                 ? `{\n  "mcpServers": {\n    "confuse-${selectedAgent.name.toLowerCase()}": {\n      "command": "npx",\n      "args": ["-y", "@confuse/mcp-server"]\n    }\n  }\n}`
                 : `// MCP Connection instruction\nEndpoint: https://api.confuse.com/v1/mcp`
               }
             </div>
             <div className="flex gap-4 mt-8">
               <Button variant="outline" onClick={() => setSelectedAgent(null)}>Back to Catalog</Button>
               <Button onClick={generateAndCopySnippet}>
                 <CheckCircle className="w-4 h-4 mr-2" />
                 Copy & Add Agent
               </Button>
             </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 gap-4 overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search agents, IDEs, extensions..." 
                  className="pl-9 bg-muted/50 border-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 bg-muted/30 p-1 rounded-lg">
                <Button variant={selectedCategory === "all" ? "default" : "ghost"} size="sm" onClick={() => setSelectedCategory("all")}>All</Button>
                <Button variant={selectedCategory === "ide" ? "default" : "ghost"} size="sm" onClick={() => setSelectedCategory("ide")}>IDEs</Button>
                <Button variant={selectedCategory === "extension" ? "default" : "ghost"} size="sm" onClick={() => setSelectedCategory("extension")}>Extensions</Button>
                <Button variant={selectedCategory === "webapp" ? "default" : "ghost"} size="sm" onClick={() => setSelectedCategory("webapp")}>Web</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4">
              {filteredAgents.map((agent) => (
                <Card 
                  key={agent.id} 
                  className="group cursor-pointer hover:border-primary transition-all duration-300 hover:shadow-md bg-card/50 backdrop-blur-sm relative overflow-hidden"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-5 flex flex-col items-start gap-3 h-full justify-between">
                    <div className="flex justify-between items-start w-full">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        <agent.icon className="w-5 h-5" />
                      </div>
                      <Badge variant="secondary" className="capitalize text-xs rounded-full">
                        {agent.category}
                      </Badge>
                    </div>
                    <div className="space-y-1 mt-2">
                      <h4 className="font-semibold text-lg">{agent.name}</h4>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{agent.provider}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {agent.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredAgents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p>No agents found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
