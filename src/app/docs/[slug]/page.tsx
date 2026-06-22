import { getDocBySlug, getDocSlugs } from '@/lib/docs';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import("@/components/layout/navbar").then(mod => mod.Navbar));
const Footer = dynamic(() => import("@/components/layout/footer").then(mod => mod.Footer));

export async function generateStaticParams() {
  const slugs = getDocSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const doc = getDocBySlug(resolvedParams.slug);

  if (!doc) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/docs" className="inline-block mb-8">
          <Button variant="ghost" className="hover:bg-primary/5">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documentation
          </Button>
        </Link>
        <article className="prose prose-slate dark:prose-invert lg:prose-lg mx-auto max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {doc.content}
          </ReactMarkdown>
        </article>
      </main>
      <Footer />
    </div>
  );
}
