import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold font-orbitron tracking-tight text-foreground mb-6">About ConFuse</h1>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p className="text-lg text-foreground">
            ConFuse is an intelligent context layer for AI agents — built for developers who want their tools to actually understand their stack.
          </p>

          <p>
            Modern AI agents are powerful, but they're blind to your specific codebase, your internal documents, your logs, and your team's history. ConFuse fixes that. We connect to your repositories, documents, logs, and chat history, then expose everything through a single MCP-compatible endpoint your agent can query in real time.
          </p>

          <p>
            We built ConFuse because we were frustrated with copy-pasting context into every prompt. Your agent should already know what's in your repo, what your last deployment looked like, and what your team decided last week. ConFuse makes that possible.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">Our principles</h2>
          <ul className="space-y-3 list-none">
            {[
              "Your data is yours — we never train on your content.",
              "Privacy by default — role-based access and scoped API keys.",
              "Open standards — built on MCP so you're never locked in.",
              "Developer-first — every feature starts with a real use case.",
            ].map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 flex gap-4">
          <Link href="/features" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm">
            See Features
          </Link>
          <Link href="/contact" className="border border-border px-5 py-2.5 rounded-lg font-medium hover:border-primary/50 transition-colors text-sm text-foreground">
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
