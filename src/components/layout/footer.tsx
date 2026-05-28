import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row justify-between gap-12">
          <div className="flex flex-col space-y-4 lg:max-w-xs">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-bold tracking-tight">ConFuse</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering AI agents with the world&apos;s most intelligent knowledge layer.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 lg:ml-12">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/billing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="/api" className="hover:text-foreground transition-colors">API</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link href="/community" className="hover:text-foreground transition-colors">Community</Link></li>
                <li><Link href="/status" className="hover:text-foreground transition-colors">Status</Link></li>
                <li><Link href="/changelog" className="hover:text-foreground transition-colors">Changelog</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
                <li><Link href="/security" className="hover:text-foreground transition-colors">Security</Link></li>
                <li><Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              2025 ConFuse. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}