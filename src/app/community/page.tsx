import Link from "next/link";

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold font-orbitron tracking-tight text-foreground mb-4">Community</h1>
        <p className="text-muted-foreground mb-12 text-lg">
          Join developers building with ConFuse. Share integrations, ask questions, and help shape the product.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {[
            {
              title: "Discord",
              desc: "The fastest way to get help, share what you've built, and talk directly with the ConFuse team.",
              action: "Join Discord",
              href: "https://discord.gg/confuse",
              color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-500",
            },
            {
              title: "GitHub Discussions",
              desc: "Feature requests, bug reports, and longer-form technical discussions live here.",
              action: "Open GitHub",
              href: "https://github.com/confuse",
              color: "bg-slate-500/10 border-slate-500/20 text-slate-400",
            },
            {
              title: "X / Twitter",
              desc: "Follow @confuse_ai for product updates, tips, and community highlights.",
              action: "Follow us",
              href: "https://x.com/confuse_ai",
              color: "bg-sky-500/10 border-sky-500/20 text-sky-500",
            },
            {
              title: "Newsletter",
              desc: "Monthly digest of new features, engineering posts, and community picks. No spam.",
              action: "Subscribe",
              href: "/contact",
              color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
            },
          ].map((c) => (
            <div key={c.title} className={`border rounded-xl p-6 bg-card hover:border-primary/40 transition-colors`}>
              <h3 className="font-semibold text-foreground mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{c.desc}</p>
              <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                {c.action} →
              </a>
            </div>
          ))}
        </div>

        <div className="border border-border rounded-xl p-6 bg-card">
          <h3 className="font-semibold text-foreground mb-2">Community Guidelines</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Be kind, be helpful, and assume good intent. We're all here to build better tools. Harassment, spam, and off-topic promotion will result in removal.
          </p>
        </div>
      </div>
    </div>
  );
}
