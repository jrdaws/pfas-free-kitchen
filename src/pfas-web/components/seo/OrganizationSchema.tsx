const SITE_URL = 'https://pfasfreekitchen.com';

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PFAS-Free Kitchen',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Independent verification platform for PFAS-free cookware and kitchen products.',
    sameAs: [
      'https://twitter.com/pfasfreekitchen',
      // Add other social profiles as needed
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@pfasfreekitchen.com',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
