import Link from "next/link";
import { Shield, Lock, Eye, Key } from "lucide-react";

export default function SecurityPage() {
  const practices = [
    {
      icon: Lock,
      title: "Encryption everywhere",
      desc: "All data is encrypted at rest with AES-256 and in transit with TLS 1.3. Database connections require SSL.",
    },
    {
      icon: Key,
      title: "Scoped API keys",
      desc: "Every API key has explicit scopes and rate limits. Keys can be revoked instantly from your dashboard.",
    },
    {
      icon: Shield,
      title: "Role-based access",
      desc: "Workspace members have granular roles. Admins control who can read, write, or delete connected sources.",
    },
    {
      icon: Eye,
      title: "Audit logs",
      desc: "Every data mutation is logged with timestamp, user, and IP address. Logs are immutable and retained for 90 days.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold font-orbitron tracking-tight text-foreground mb-4">Security</h1>
        <p className="text-muted-foreground mb-12 text-lg">
          Security is not a feature — it's a requirement. Here's how we protect your data.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {practices.map((p) => (
            <div key={p.title} className="border border-border rounded-xl p-6 bg-card hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="border border-border rounded-xl p-6 bg-card">
          <h3 className="font-semibold text-foreground mb-2">Responsible Disclosure</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Found a vulnerability? We take security reports seriously and will respond within 48 hours. Please do not publicly disclose issues before we've had a chance to address them.
          </p>
          <a href="mailto:security@confuse.site" className="text-sm text-primary hover:underline">
            security@confuse.site
          </a>
        </div>
      </div>
    </div>
  );
}
