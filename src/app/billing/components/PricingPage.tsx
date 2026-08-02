import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Check } from "lucide-react";

export function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Perfect for individual developers and small personal projects",
      features: [
        "Up to 2 repos and 4 documents",
        "Max 256 MB storage (processing stops when limit is reached)",
        "80,000 requests per month",
        "Strong security (TLS 1.3, CSP, token blacklisting)"
      ],
      popular: false,
      buyUrl: "/billing"
    },
    {
      name: "Pro",
      price: "₹800",
      period: "per month",
      description: "Ideal for power developers needing higher storage and queries",
      features: [
        "5 repos, 10 documents",
        "512 MB max space",
        "160,000 requests per month",
        "Strong security (TLS 1.3, CSP, token blacklisting)"
      ],
      popular: true,
      buyUrl: "/billing"
    },
    {
      name: "Team",
      price: "₹2,300",
      period: "per month",
      description: "Perfect for engineering teams with shared database access",
      features: [
        "10 repos, 16 documents",
        "1,024 MB (1 GB) max space",
        "Max of 3 users can connect to database (READ-ONLY ONLY)",
        "320,000 requests/mo (main user)",
        "Advanced security & RBAC token permissions"
      ],
      popular: false,
      buyUrl: "/billing"
    },
    {
      name: "Enterprise",
      price: "₹4,000+",
      period: "per month",
      description: "For high-scale organizations needing custom quotas & SLA",
      features: [
        "Custom / Unlimited repos and documents",
        "Dedicated Storage Quota (> 5 GB+)",
        "Custom High-Throughput (1,000,000+ req/mo)",
        "Unlimited Read Seats & Multi-User Admin Write Roles",
        "Enterprise Security (SAML/SSO, Custom VPC/IP Isolation, Dedicated SLA)"
      ],
      popular: false,
      buyUrl: "/billing"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="secondary" className="w-fit mx-auto mb-4">
              Simple & Transparent Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Choose Your
              <span className="text-primary"> Subscription Plan</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect your repositories and documents seamlessly with defined quotas and rock-solid security.
            </p>
          </div>
        </section>

        <section className="py-16 -mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={`relative bg-card border-border flex flex-col justify-between ${
                    plan.popular ? 'ring-2 ring-primary shadow-primary' : ''
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-lg font-semibold text-foreground mb-2">
                      {plan.name}
                    </CardTitle>
                    <div className="space-y-1">
                      <div className="text-4xl font-bold text-foreground">
                        {plan.price}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {plan.period}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 min-h-[40px]">
                      {plan.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
                    <ul className="space-y-3 text-left">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <Check className="w-4 h-4 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground text-xs leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <a href={plan.buyUrl} target={plan.buyUrl.startsWith('http') ? '_blank' : '_self'} rel="noreferrer">
                      <Button 
                        className={`w-full ${
                          plan.popular 
                            ? 'bg-primary hover:bg-primary/90' 
                            : ''
                        }`}
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        {plan.name === 'Free' ? 'Get Started' : `Subscribe to ${plan.name}`}
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know about ConFuse payments and plans
              </p>
            </div>
            
            <div className="grid gap-6">
              {[
                {
                  question: "How are payments processed?",
                  answer: "All payments and subscription checkouts are processed securely."
                },
                {
                  question: "What happens when storage size is reached?",
                  answer: "On the Free tier (256 MB max) or paid tiers, processing automatically stops when the max storage limit is reached until space is freed or plan upgraded."
                },
                {
                  question: "How do Team Tier database read-only connections work?",
                  answer: "Team tier allows up to 3 connected users to read from your database. Connected users are strictly restricted to READ-ONLY mode and cannot execute write operations."
                },
                {
                  question: "Can I upgrade or manage my subscription later?",
                  answer: "Yes, you can manage, pause, or update your subscription anytime via your billing dashboard."
                }
              ].map((faq, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
