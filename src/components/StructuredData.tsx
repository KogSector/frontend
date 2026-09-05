export function StructuredData() {
  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ConFuse",
    "description": "ConFuse is an AI-powered platform that unifies repositories and documentation for development teams building microservices.",
    "url": "https://www.confuse.site",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "ConFuse"
    },
    "featureList": [
      "Multi-Source Connection",
      "Immutable Context",
      "Granular Security",
      "Low-Latency Retrieval"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is ConFuse?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ConFuse is an AI-powered platform that unifies repositories and documentation for development teams building microservices."
        }
      },
      {
        "@type": "Question",
        "name": "How does ConFuse work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ConFuse integrates with your existing development tools and repositories, creating a unified knowledge layer that AI agents and developers can query instantly. It uses vector search and graph traversal to provide sub-10ms response times."
        }
      },
      {
        "@type": "Question",
        "name": "What integrations does ConFuse support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ConFuse supports 50+ integrations including GitHub, GitLab, Bitbucket, Notion, Slack, Figma, Google Drive, and many more. You can connect repositories, documentation, and external resources."
        }
      },
      {
        "@type": "Question",
        "name": "Is ConFuse secure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, ConFuse implements granular security with row-level security and explicit scoping. Authorized agents only access what they are explicitly permitted to see. Your architecture knowledge is versioned, synced, and immutable."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
        id="software-app-schema"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        id="faq-schema"
      />
    </>
  );
}