import { getAllDocs } from "@/lib/docs";
import { BookOpen, FileText } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import("@/components/layout/navbar").then(mod => mod.Navbar));
const Footer = dynamic(() => import("@/components/layout/footer").then(mod => mod.Footer));

export default async function DocumentationIndex() {
  const docs = getAllDocs();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg mx-auto">
                <BookOpen className="w-5 h-5 mr-2 text-white" />
                <span className="text-white font-bold text-lg">Documentation</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-center mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Complete Documentation</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to master ConFuse, from basic setup to advanced integrations.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 -mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {docs.map((doc) => (
                <Link key={doc.slug} href={`/docs/${doc.slug}`}>
                  <Card className="bg-card border-border hover:shadow-card transition-all duration-300 group relative h-full">
                    <div className="flex flex-col px-6 py-4 gap-4 overflow-hidden h-full">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {doc.title}
                        </CardTitle>
                      </div>
                      
                      {doc.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                          {doc.description}
                        </p>
                      )}
                      
                      <div className="mt-auto pt-4">
                        <div className="inline-flex items-center text-sm font-medium text-primary">
                          Read Document <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
              
              {docs.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No documentation files found in the /docs folder.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
