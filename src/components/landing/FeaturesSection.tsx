"use client";

import { ArrowRight } from "lucide-react";

const features = [
  {
    title: "Multi-Source Connection",
    description: "Integrate repositories and documentation natively. Seamlessly combine code and knowledge into a single source of truth.",
    metric: "01"
  },
  {
    title: "Immutable Context",
    description: "Your architecture knowledge is versioned, synced, and immutable. Easily query point-in-time contexts for debugging.",
    metric: "02"
  },
  {
    title: "Granular Security",
    description: "Row-level security and explicit scoping. Authorized agents only access what they are explicitly permitted to see.",
    metric: "03"
  },
  {
    title: "Low-Latency Retrieval",
    description: "Optimized vector search paired with deep graph traversal ensures sub-10ms response times for complex multi-hop queries.",
    metric: "04"
  }
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 bg-background relative border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
            Engineered for scale.
            <br />
            Built for developers.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl font-medium">
            Forget disjointed context windows. Give your entire team and tooling native understanding of the codebase structure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-border">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-background p-10 hover:bg-muted/50 transition-colors group relative flex flex-col justify-between min-h-[300px]"
            >
              <div>
                <div className="text-sm font-bold text-muted-foreground mb-8 font-mono">{feature.metric}</div>
                <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
              <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-5 h-5 text-foreground" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;