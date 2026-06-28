import { SITE } from './config';

export function generateMetaTags(title: string, description: string, url: string, keywords?: string[]) {
  const kw = keywords || SITE.keywords;
  return {
    title: `${title} | ${SITE.title}`,
    description,
    url,
    keywords: kw.join(', '),
    ogTitle: title,
    ogDescription: description,
    ogUrl: url,
    ogType: 'article',
    ogSiteName: SITE.title,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    canonical: url,
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateArticleSchema(name: string, description: string, url: string, category: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${name} Function — Excel & Google Sheets`,
    description,
    url,
    author: {
      '@type': 'Organization',
      name: SITE.title,
      url: SITE.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.title,
      url: SITE.url,
    },
    mainEntityOfPage: url,
    section: category,
  };
}

export function generateFAQSchema(faqItems: { question: string; answer: string }[]) {
  return {
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
}

export function generateHowToSchema(name: string, steps: { name: string; text: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use the ${name} function in Excel`,
    description: `Step-by-step guide to using the ${name} function in Excel and Google Sheets`,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function generateSearchActionSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.title,
    url: SITE.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/function/?q={search_term_string}`,
      queryInput: 'required name=search_term_string',
    },
  };
}
