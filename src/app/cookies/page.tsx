export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold font-orbitron tracking-tight text-foreground mb-2">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: June 2025</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">What are cookies?</h2>
            <p>Cookies are small text files stored in your browser. They are used to keep you logged in and remember your preferences.</p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground mb-4">Cookies we use</h2>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground">Purpose</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground">Duration</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { name: "auth_token", purpose: "Keeps you logged in", duration: "2 hours", type: "Essential" },
                    { name: "auth_session", purpose: "Session metadata (last activity, expiry)", duration: "2 hours", type: "Essential" },
                  ].map((c) => (
                    <tr key={c.name} className="bg-card">
                      <td className="px-4 py-3 font-mono text-foreground">{c.name}</td>
                      <td className="px-4 py-3">{c.purpose}</td>
                      <td className="px-4 py-3">{c.duration}</td>
                      <td className="px-4 py-3">{c.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">What we don't use</h2>
            <p>We do not use advertising cookies, tracking pixels, or third-party analytics cookies. We do not use Google Analytics or any similar service.</p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Managing cookies</h2>
            <p>You can clear cookies at any time from your browser settings. Clearing the auth cookies will log you out. Because we only use essential cookies, there is no cookie consent banner — there is nothing to opt out of.</p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Contact</h2>
            <p>Questions? Email <a href="mailto:privacy@confuse.site" className="text-primary hover:underline">privacy@confuse.site</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
