import Link from "next/link";

const faqs = [
  {
    q: "How do I connect my first repository?",
    a: "Go to Dashboard → Repository → Connect. Authenticate with GitHub, GitLab, or Bitbucket, then select the repos you want to index. ConFuse will start syncing immediately.",
  },
  {
    q: "What file types does ConFuse support for documents?",
    a: "PDF, Markdown (.md), plain text (.txt), Word (.docx), and HTML. More formats are on the roadmap.",
  },
  {
    q: "How do I connect my AI agent to ConFuse?",
    a: "Go to Dashboard → Agents Config. Copy your personal MCP URL and paste it into your agent's config (Cursor, Windsurf, Claude Desktop, etc.) as a remote MCP server.",
  },
  {
    q: "Is my data used to train AI models?",
    a: "No. Your data is never used to train any model. It is stored solely to serve context back to your agent.",
  },
  {
    q: "How do I revoke access for a connected source?",
    a: "Open the source from your dashboard, click the trash icon, and confirm deletion. The data is removed from our index within minutes.",
  },
  {
    q: "What is the free tier limit?",
    a: "The free tier includes up to 3 repositories, 50 documents, and 1,000 context requests per month. See the Pricing page for full details.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold font-orbitron tracking-tight text-foreground mb-4">Help Center</h1>
        <p className="text-muted-foreground mb-12">Answers to the most common questions. Can't find what you need? <Link href="/contact" className="text-primary hover:underline">Contact us</Link>.</p>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="border border-border rounded-xl p-6 bg-card">
              <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 border border-border rounded-xl p-6 bg-card text-center">
          <p className="text-muted-foreground mb-4">Still stuck? Our team usually responds within a few hours.</p>
          <Link href="/contact" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
