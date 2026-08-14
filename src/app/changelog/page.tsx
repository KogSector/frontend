const entries = [
  {
    version: "0.4.0",
    date: "June 2025",
    changes: [
      "Added Cloud Log ingestion via Kafka — stream logs from AWS, GCP, and Azure.",
      "MCP server now supports both SSE and HTTP transport types.",
      "Dashboard redesign with feature-toggle-gated quick actions.",
      "Auth0 integration for social login (GitHub, Google, Microsoft).",
    ],
  },
  {
    version: "0.3.0",
    date: "April 2025",
    changes: [
      "Repository sync now supports GitLab and Bitbucket in addition to GitHub.",
      "Document ingestion supports PDF, DOCX, and Markdown.",
      "Introduced role-based access control (RBAC) for workspace members.",
      "API key management with per-key scopes and rate limits.",
    ],
  },
  {
    version: "0.2.0",
    date: "February 2025",
    changes: [
      "Launched workspace support — invite team members and share context.",
      "Added URL ingestion for web pages and documentation sites.",
      "Embedding service upgraded to Gemini Embedding 2.",
      "Introduced audit logs for all data mutations.",
    ],
  },
  {
    version: "0.1.0",
    date: "December 2024",
    changes: [
      "Initial release of ConFuse.",
      "GitHub repository sync and document upload.",
      "MCP server (SSE) for Cursor and Windsurf.",
      "Free tier with 3 repos and 50 documents.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold font-orbitron tracking-tight text-foreground mb-4">Changelog</h1>
        <p className="text-muted-foreground mb-12">What's new in ConFuse.</p>

        <div className="space-y-10">
          {entries.map((entry) => (
            <div key={entry.version} className="border-l-2 border-primary/30 pl-6 relative">
              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-primary" />
              <div className="flex items-center gap-3 mb-3">
                <span className="font-semibold text-foreground">v{entry.version}</span>
                <span className="text-xs text-muted-foreground">{entry.date}</span>
              </div>
              <ul className="space-y-2">
                {entry.changes.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
