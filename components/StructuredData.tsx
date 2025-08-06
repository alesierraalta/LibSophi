export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Palabreo",
    "description": "Plataforma comunitaria para escritores que fusiona ficción, ensayos y newsletters en un hogar digital auténtico.",
    "url": "https://palabreo.com", // TODO: Replace with actual domain
    "applicationCategory": "WritingApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString(),
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "ratingCount": "1",
      "bestRating": "5",
      "worstRating": "1"
    },
    "creator": {
      "@type": "Organization",
      "name": "Palabreo Team",
      "url": "https://palabreo.com",
    },
    "featureList": [
      "Editor de texto colaborativo",
      "Comunidad de escritores",
      "Publicación de ficción",
      "Newsletters integradas",
      "Feedback comunitario",
      "Herramientas de escritura"
    ],
    "screenshot": "https://palabreo.com/screenshot.png", // TODO: Add real screenshot
    "softwareVersion": "1.0.0-beta",
    "releaseNotes": "Lanzamiento beta con funcionalidades básicas de comunidad",
    "downloadUrl": "https://palabreo.com",
    "installUrl": "https://palabreo.com",
    "storageRequirements": "1MB",
    "memoryRequirements": "512MB",
    "processorRequirements": "Cualquier procesador moderno",
    "permissions": "Acceso a internet para sincronización",
    "supportingData": "https://palabreo.com/help",
    "maintainer": {
      "@type": "Organization",
      "name": "Palabreo Team",
      "email": "hola@palabreo.com",
      "url": "https://palabreo.com"
    }
  }

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Palabreo",
    "url": "https://palabreo.com",
    "logo": "https://palabreo.com/logo.png", // TODO: Add real logo
    "description": "Startup literaria enfocada en construir comunidades auténticas de escritores",
    "foundingDate": "2024",
    "founders": [
      {
        "@type": "Person",
        "name": "Equipo Palabreo"
      }
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+34-XXX-XXX-XXX", // TODO: Add real phone
      "contactType": "Customer Service",
      "email": "hola@palabreo.com",
      "availableLanguage": ["Spanish", "English"]
    },
    "sameAs": [
      "https://twitter.com/palabreo", // TODO: Add real social media
      "https://linkedin.com/company/palabreo",
      "https://instagram.com/palabreo"
    ]
  }

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Palabreo",
    "url": "https://palabreo.com",
    "description": "Donde las historias cobran vida en comunidad",
    "inLanguage": "es-ES",
    "isAccessibleForFree": true,
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://palabreo.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
    </>
  )
}