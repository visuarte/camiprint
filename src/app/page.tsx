import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/template-2');
}
      availability: 'https://schema.org/InStock',
      url: brandConfig.siteUrl,
    },
    {
      '@type': 'Offer',
      name: 'Pack 50+ camisetas',
      price: '8.90',
      priceCurrency: 'EUR',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: '8.90', priceCurrency: 'EUR', unitText: 'unidad' },
      availability: 'https://schema.org/InStock',
      url: brandConfig.siteUrl,
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '1200',
    bestRating: '5',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/template-2');
}
