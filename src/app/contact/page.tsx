export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold font-orbitron tracking-tight text-foreground mb-4">Contact</h1>
        <p className="text-muted-foreground mb-12">Have a question, a bug report, or just want to say hi? We read every message.</p>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {[
            { label: "General", email: "hello@confuse.site", desc: "Product questions, partnerships, press." },
            { label: "Support", email: "support@confuse.site", desc: "Bug reports, account issues, billing." },
            { label: "Security", email: "security@confuse.site", desc: "Responsible disclosure and security concerns." },
            { label: "Careers", email: "jobs@confuse.site", desc: "Open roles and spontaneous applications." },
          ].map((c) => (
            <div key={c.label} className="border border-border rounded-xl p-5 bg-card hover:border-primary/40 transition-colors">
              <h3 className="font-semibold text-foreground mb-1">{c.label}</h3>
              <p className="text-xs text-muted-foreground mb-3">{c.desc}</p>
              <a href={`mailto:${c.email}`} className="text-sm text-primary hover:underline">{c.email}</a>
            </div>
          ))}
        </div>

        <div className="border border-border rounded-xl p-6 bg-card">
          <h3 className="font-semibold text-foreground mb-4">Send a message</h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Name</label>
                <input type="text" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" placeholder="Your name" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Email</label>
                <input type="email" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Message</label>
              <textarea rows={5} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none" placeholder="What's on your mind?" />
            </div>
            <button type="submit" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
