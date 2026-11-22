import { useEffect } from 'react';

export interface SeoConfig {
  title: string;
  description: string;
  type?: 'website' | 'article';
  image?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export function useSeo({ title, description, type = 'website', image, noindex = false, jsonLd }: SeoConfig) {
  useEffect(() => {
    const cleanTitle = title.trim();
    const cleanDesc = description.trim().slice(0, 160);
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;

    document.title = cleanTitle;
    setCanonical(canonicalUrl);

    setMetaTag('name', 'description', cleanDesc);
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', 'Humberto Jezus');
    setMetaTag('property', 'og:title', cleanTitle);
    setMetaTag('property', 'og:description', cleanDesc);
    setMetaTag('property', 'og:url', canonicalUrl);

    setMetaTag('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setMetaTag('name', 'twitter:title', cleanTitle);
    setMetaTag('name', 'twitter:description', cleanDesc);

    if (image && /^https?:\/\//i.test(image)) {
      setMetaTag('property', 'og:image', image);
      setMetaTag('name', 'twitter:image', image);
    }

    const scriptId = 'dynamic-seo-jsonld';
    const existing = document.getElementById(scriptId);
    if (jsonLd) {
      const script = existing || document.createElement('script');
      script.id = scriptId;
      script.setAttribute('type', 'application/ld+json');
      script.textContent = JSON.stringify(jsonLd);
      if (!existing) {
        document.head.appendChild(script);
      }
    } else if (existing) {
      existing.remove();
    }
  }, [title, description, type, image, noindex, jsonLd]);
}
