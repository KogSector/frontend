export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold font-orbitron tracking-tight text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: June 2025</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          {[
            {
              title: "1. Acceptance",
              body: "By using ConFuse you agree to these terms. If you do not agree, do not use the service.",
            },
            {
              title: "2. Your account",
              body: "You are responsible for keeping your credentials secure. You must be at least 16 years old to use ConFuse. You may not share your account with others.",
            },
            {
              title: "3. Acceptable use",
              body: "You may not use ConFuse to store or process illegal content, to attempt to reverse-engineer the service, to scrape or abuse the API beyond your plan limits, or to resell access without a written agreement.",
            },
            {
              title: "4. Your content",
              body: "You own all content you connect to ConFuse. You grant us a limited licence to store and process it solely to provide the service. We do not claim any ownership over your content.",
            },
            {
              title: "5. Service availability",
              body: "We aim for high availability but do not guarantee uninterrupted service. We may perform maintenance with or without notice. We are not liable for losses caused by downtime.",
            },
            {
              title: "6. Billing",
              body: "Paid plans are billed monthly or annually. Cancellations take effect at the end of the current billing period. We do not offer refunds for partial periods.",
            },
            {
              title: "7. Termination",
              body: "We may suspend or terminate your account if you violate these terms. You may delete your account at any time from the account settings page.",
            },
            {
              title: "8. Limitation of liability",
              body: "ConFuse is provided 'as is'. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the service.",
            },
            {
              title: "9. Changes",
              body: "We may update these terms. We will notify you by email at least 14 days before material changes take effect.",
            },
            {
              title: "10. Contact",
              body: "Questions? Email legal@confuse.site.",
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
