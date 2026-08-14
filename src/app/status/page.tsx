export default function StatusPage() {
  const services = [
    { name: "API Gateway", status: "operational" },
    { name: "Auth Service", status: "operational" },
    { name: "Document Ingestion", status: "operational" },
    { name: "Repository Sync", status: "operational" },
    { name: "Cloud Log Ingestion", status: "operational" },
    { name: "MCP Server", status: "operational" },
    { name: "Embedding Service", status: "operational" },
    { name: "Dashboard", status: "operational" },
  ];

  const dot = (status: string) =>
    status === "operational"
      ? "bg-emerald-500 shadow-emerald-500/50"
      : status === "degraded"
      ? "bg-amber-500 shadow-amber-500/50"
      : "bg-red-500 shadow-red-500/50";

  const label = (status: string) =>
    status === "operational" ? "Operational" : status === "degraded" ? "Degraded" : "Outage";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold font-orbitron tracking-tight text-foreground mb-4">System Status</h1>

        <div className="flex items-center gap-3 mb-10 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
          <span className="text-emerald-500 font-medium">All systems operational</span>
        </div>

        <div className="space-y-3 mb-12">
          {services.map((s) => (
            <div key={s.name} className="flex items-center justify-between border border-border rounded-lg px-5 py-3.5 bg-card">
              <span className="text-sm text-foreground">{s.name}</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full shadow-lg ${dot(s.status)}`} />
                <span className="text-xs text-muted-foreground">{label(s.status)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-border rounded-xl p-6 bg-card">
          <h3 className="font-semibold text-foreground mb-2">Incident History</h3>
          <p className="text-sm text-muted-foreground">No incidents in the last 90 days.</p>
        </div>
      </div>
    </div>
  );
}
