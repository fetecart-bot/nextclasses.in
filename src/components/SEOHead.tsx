import { useEffect } from 'react';
import { Course } from '../types';

const SITE = 'https://www.nextclasses.in';
const DEFAULT_IMAGE = `${SITE}/og-nextclasses.jpg`;

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`${selector}[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

export default function SEOHead({ course }: { course?: Course | null }) {
  useEffect(() => {
    const slug = course?.id.replace(/^course-/, '');
    const canonical = course ? `${SITE}/courses/${slug}/` : `${SITE}/`;
    const title = course
      ? `${course.title} | NextClasses.in`
      : 'NextClasses.in | AI Courses, Languages & Entrance Exam Preparation';
    const description = course
      ? `${course.subtitle} Learn in ${course.language}. View syllabus, demo lessons and enrol online from ₹${course.price}.`
      : 'Practical AI courses, spoken-language programs and NEET, JEE, KEAM, AISSEE and Navodaya preparation with mock tests, certificates and multilingual support.';
    const image = course?.thumbnail?.startsWith('http')
      ? course.thumbnail
      : course?.thumbnail ? `${SITE}${course.thumbnail}` : DEFAULT_IMAGE;

    document.title = title;
    setMeta('meta', 'name', 'description', description);
    setMeta('meta', 'name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setMeta('meta', 'property', 'og:title', title);
    setMeta('meta', 'property', 'og:description', description);
    setMeta('meta', 'property', 'og:url', canonical);
    setMeta('meta', 'property', 'og:image', image);
    setMeta('meta', 'name', 'twitter:title', title);
    setMeta('meta', 'name', 'twitter:description', description);
    setMeta('meta', 'name', 'twitter:image', image);

    let canonicalEl = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.rel = 'canonical';
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.href = canonical;

    document.getElementById('dynamic-course-schema')?.remove();
    if (course) {
      const schema = document.createElement('script');
      schema.id = 'dynamic-course-schema';
      schema.type = 'application/ld+json';
      schema.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.title,
        description: course.subtitle,
        url: canonical,
        image,
        inLanguage: course.language,
        provider: { '@type': 'EducationalOrganization', name: 'NextClasses.in', url: SITE },
        offers: {
          '@type': 'Offer',
          url: canonical,
          price: String(course.price),
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: course.rating,
          reviewCount: course.reviewCount,
          bestRating: 5,
        },
      });
      document.head.appendChild(schema);
    }
  }, [course]);

  return null;
}
