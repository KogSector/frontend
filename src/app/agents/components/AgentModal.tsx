"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

interface AgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentSelected: (agent: Agent) => void;
}

export type Agent = {
  id: string;
  name: string;
  provider: string;
  category: "ide" | "extension" | "webapp" | "local";
  description: string;
  iconUrl: string;
};

const AGENT_CATALOG: Agent[] = [
  {
    id: "cursor",
    name: "Cursor",
    provider: "Anysphere",
    category: "ide",
    description: "AI-first Code Editor.",
    iconUrl: "https://www.cursor.com/favicon.ico",
  },
  {
    id: "vscode",
    name: "VS Code",
    provider: "Microsoft",
    category: "ide",
    description: "The classic IDE, empowered by AI extensions like Cline.",
    iconUrl: "https://code.visualstudio.com/favicon.ico",
  },
  {
    id: "antigravity",
    name: "Antigravity",
    provider: "Gemini",
    category: "ide",
    description: "Advanced Agentic Coding Environment.",
    iconUrl: "https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg",
  },
  {
    id: "trae",
    name: "Trae",
    provider: "ByteDance",
    category: "ide",
    description: "Adaptive AI IDE.",
    iconUrl: "https://www.trae.ai/favicon.ico",
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    provider: "GitHub",
    category: "extension",
    description: "Your AI pair programmer.",
    iconUrl: "https://github.githubassets.com/favicons/favicon.svg",
  },
  {
    id: "amazon-q",
    name: "Amazon Q",
    provider: "AWS",
    category: "extension",
    description: "Generative AI powered assistant for businesses and developers.",
    iconUrl: "https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    provider: "OpenAI",
    category: "webapp",
    description: "Conversational AI model by OpenAI.",
    iconUrl: "https://cdn.oaistatic.com/assets/favicon-o20kmmos.svg",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    provider: "DeepSeek",
    category: "webapp",
    description: "DeepSeek AI chat platform.",
    iconUrl: "https://www.deepseek.com/favicon.ico",
  },
  {
    id: "claude",
    name: "Claude",
    provider: "Anthropic",
    category: "webapp",
    description: "Next generation AI assistant based on Anthropic's research.",
    iconUrl: "https://claude.ai/favicon.ico",
  },
  {
    id: "ollama",
    name: "Ollama",
    provider: "Ollama",
    category: "local",
    description: "Get up and running with large language models locally.",
    iconUrl: "https://ollama.com/public/ollama.png",
  },
];

export function AgentModal({ open, onOpenChange, onAgentSelected }: AgentModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "ide" | "extension" | "webapp" | "local">("all");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();

  const filteredAgents = AGENT_CATALOG.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const serverUrl = process.env.NEXT_PUBLIC_CLIENT_CONNECTOR_URL || 'http://localhost:3020';
  const userId = user?.sub || user?.id || 'YOUR_USER_ID';
  const mcpEndpoint = `${serverUrl}/mcp/sse?userId=${encodeURIComponent(userId)}&rules=default`;

  const generateAndCopySnippet = () => {
    if (!selectedAgent) return;
    
    // Snippet logic based on agent type
    let snippet = "";

    if (selectedAgent.category === 'ide') {
      snippet = `{\n  "mcpServers": {\n    "confuse": {\n      "type": "sse",\n      "url": "${mcpEndpoint}"\n    }\n  }\n}`;
    } else {
      snippet = `// Instruction for ${selectedAgent.name}\nConfigure the MCP SSE endpoint to: ${mcpEndpoint}`;
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
    <Dialog open={open} onOpenChange={(val: boolean) => {
      onOpenChange(val);
      if (!val) {
        setSelectedAgent(null);
        setSearchQuery("");
        setSelectedCategory("all");
      }
    }}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Agent
          </DialogTitle>
          <DialogDescription>
            Discover and integrate your favorite AI Agents and Tools with the ConFuse Platform.
          </DialogDescription>
        </DialogHeader>

        {selectedAgent ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 overflow-hidden">
             <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Image
                  src={selectedAgent.iconUrl}
                  alt={selectedAgent.name}
                  width={64}
                  height={64}
                  className="rounded-xl object-contain"
                />
             </div>
             <h3 className="text-2xl font-semibold">Connect {selectedAgent.name}</h3>
             <p className="text-muted-foreground text-center max-w-md">
               We have generated an MCP snippet for {selectedAgent.name}. Click below to copy it to your clipboard.
             </p>
             <div className="bg-muted w-full max-w-md p-4 rounded-xl border font-mono text-sm overflow-x-auto whitespace-pre">
               {selectedAgent.category === 'ide' 
                 ? `{\n  "mcpServers": {\n    "confuse": {\n      "type": "sse",\n      "url": "${mcpEndpoint}"\n    }\n  }\n}`
                 : `// MCP Connection instruction\nEndpoint: ${mcpEndpoint}`
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
                  className="pl-9 bg-muted/50 border-none focus:ring-2 focus:ring-primary/20"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 bg-muted/30 p-1 rounded-lg">
                <Button variant={selectedCategory === "all" ? "default" : "ghost"} size="sm" onClick={() => setSelectedCategory("all")}>All</Button>
                <Button variant={selectedCategory === "ide" ? "default" : "ghost"} size="sm" onClick={() => setSelectedCategory("ide")}>IDEs</Button>
                <Button variant={selectedCategory === "extension" ? "default" : "ghost"} size="sm" onClick={() => setSelectedCategory("extension")}>Extensions</Button>
                <Button variant={selectedCategory === "webapp" ? "default" : "ghost"} size="sm" onClick={() => setSelectedCategory("webapp")}>Web</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4 flex-1 content-start">
              {filteredAgents.map((agent) => (
                <Card
                  key={agent.id}
                  className="group cursor-pointer hover:border-primary transition-all duration-300 hover:shadow-md bg-card/50 backdrop-blur-sm relative overflow-hidden"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-start w-full">
                      <div className="p-2 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform flex items-center justify-center w-10 h-10 shrink-0">
                        <Image
                          src={agent.iconUrl}
                          alt={agent.name}
                          width={24}
                          height={24}
                          className="rounded object-contain"
                        />
                      </div>
                      <Badge variant="secondary" className="capitalize text-xs rounded-full">
                        {agent.category}
                      </Badge>
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-base leading-tight">{agent.name}</h4>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{agent.provider}</p>
                    </div>
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
