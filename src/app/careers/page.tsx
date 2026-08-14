import Link from "next/link";

const openRoles = [
  {
    title: "Senior Backend Engineer (Rust)",
    team: "Infrastructure",
    type: "Full-time · Remote",
    description: "Build and scale the data ingestion pipelines that power ConFuse. You'll work on our Rust-based processors, Kafka consumers, and embedding services.",
  },
  {
    title: "Full-Stack Engineer (TypeScript / Next.js)",
    team: "Product",
    type: "Full-time · Remote",
    description: "Own the frontend and API layer. You'll ship features across the dashboard, auth flows, and integrations with external services.",
  },
  {
    title: "Developer Advocate",
    team: "Growth",
    type: "Full-time · Remote",
    description: "Help developers get the most out of ConFuse. Write guides, build demos, speak at meetups, and be the bridge between our users and our engineering team.",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold font-orbitron tracking-tight text-foreground mb-4">Careers</h1>
        <p className="text-muted-foreground mb-12 text-lg">
          We're a small team building the context layer for AI agents. If that sounds interesting, we'd love to talk.
        </p>

        <div className="space-y-6 mb-16">
          {openRoles.map((role) => (
            <div key={role.title} className="border border-border rounded-xl p-6 bg-card hover:border-primary/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-semibold text-foreground">{role.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{role.team}</span>
                    <span className="text-xs text-muted-foreground">{role.type}</span>
                  </div>
                </div>
                <Link href="/contact" className="text-sm text-primary hover:underline flex-shrink-0">Apply →</Link>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{role.description}</p>
            </div>
          ))}
        </div>

        <div className="border border-border rounded-xl p-6 bg-card">
          <h3 className="font-semibold text-foreground mb-2">Don't see your role?</h3>
          <p className="text-sm text-muted-foreground mb-4">We're always interested in exceptional people. Send us a note and tell us what you'd build.</p>
          <Link href="/contact" className="text-sm text-primary hover:underline">Get in touch →</Link>
        </div>
      </div>
    </div>
  );
}
