export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold font-orbitron tracking-tight text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: June 2025</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          {[
            {
              title: "1. What we collect",
              body: "We collect your email address and name when you sign up. We store the content you connect to ConFuse (repositories, documents, logs) solely to serve context back to your AI agent. We collect usage metrics (request counts, error rates) to operate and improve the service.",
            },
            {
              title: "2. How we use your data",
              body: "Your content is used exclusively to answer context queries from your agent. We do not sell your data, share it with third parties for advertising, or use it to train any AI model.",
            },
            {
              title: "3. Data storage",
              body: "Data is stored on infrastructure hosted in the EU and Asia-Pacific regions. All data is encrypted at rest (AES-256) and in transit (TLS 1.3).",
            },
            {
              title: "4. Data retention",
              body: "You can delete any connected source at any time from your dashboard. Deleted data is purged from our systems within 30 days. Account deletion removes all associated data within 7 days.",
            },
            {
              title: "5. Cookies",
              body: "We use a single session cookie to keep you logged in. We do not use tracking or advertising cookies. See our Cookies page for details.",
            },
            {
              title: "6. Third-party services",
              body: "We use Auth0 for authentication, Neon for database hosting, and Redis Labs for caching. Each provider has their own privacy policy. We do not share your content with these providers beyond what is necessary to operate the service.",
            },
            {
              title: "7. Your rights",
              body: "You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at privacy@confuse.site.",
            },
            {
              title: "8. Contact",
              body: "Questions about this policy? Email privacy@confuse.site.",
            },
          ].map((s) => (
            <div key={s.title}>
              <h2 className="text-base font-semibold text-foreground mb-2">{s.title}</h2>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
