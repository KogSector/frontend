import Link from "next/link";
import { GitBranch, FileText, Terminal, MessageSquare, Network, Shield } from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      icon: GitBranch,
      title: "Repository Sync",
      description: "Connect GitHub, GitLab, or Bitbucket repositories. ConFuse indexes your codebase and keeps it in sync so your AI agent always has up-to-date context.",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: FileText,
      title: "Document Ingestion",
      description: "Upload PDFs, Markdown files, Word documents, and more. ConFuse parses, chunks, and embeds them into a searchable knowledge base.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Terminal,
      title: "Cloud Log Streaming",
      description: "Stream logs from AWS, GCP, Azure, or any Kafka-compatible source. Query and correlate log data directly from your AI agent.",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      icon: MessageSquare,
      title: "Chat & Conversation History",
      description: "Ingest Slack, Teams, or custom chat exports. Give your agent memory of past conversations and decisions.",
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
    {
      icon: Network,
      title: "MCP Server",
      description: "ConFuse exposes a remote Model Context Protocol (MCP) server. Connect any MCP-compatible agent — Cursor, Windsurf, Claude — in seconds.",
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      icon: Shield,
      title: "Security & Access Control",
      description: "Role-based access, token-scoped API keys, and audit logs. Your data stays yours — we never train on your content.",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold font-orbitron tracking-tight text-foreground mb-4">Features</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to give your AI agent deep, accurate context about your codebase, documents, and infrastructure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="border border-border rounded-xl p-6 bg-card hover:border-primary/40 transition-colors">
              <div className={`w-11 h-11 rounded-lg ${f.bg} flex items-center justify-center mb-4`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}
