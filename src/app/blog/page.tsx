import Link from "next/link";

const posts = [
  {
    slug: "introducing-confuse",
    title: "Introducing ConFuse: Context for AI Agents",
    date: "June 2025",
    summary: "We built ConFuse to solve a problem every developer hits: AI agents that don't know anything about your actual project. Here's why we built it and what's next.",
    tag: "Product",
  },
  {
    slug: "mcp-explained",
    title: "What is MCP and Why It Matters",
    date: "May 2025",
    summary: "Model Context Protocol is becoming the standard way for AI agents to fetch external context. We break down how it works and why we built ConFuse on top of it.",
    tag: "Engineering",
  },
  {
    slug: "cloud-log-ingestion",
    title: "Streaming Logs to Your AI Agent",
    date: "April 2025",
    summary: "ConFuse can now ingest logs from AWS CloudWatch, GCP Logging, and any Kafka topic. Here's how we built the pipeline and what you can do with it.",
    tag: "Engineering",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold font-orbitron tracking-tight text-foreground mb-4">Blog</h1>
        <p className="text-muted-foreground mb-12">Product updates, engineering deep-dives, and thoughts on AI context.</p>

        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.slug} className="border border-border rounded-xl p-6 bg-card hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">{post.tag}</span>
                <span className="text-xs text-muted-foreground">{post.date}</span>
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">{post.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{post.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
