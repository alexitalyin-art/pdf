import { MetadataRoute } from 'next'
import { i18n } from '@/i18n-config'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://a2ztool.vercel.app';

  const locales = i18n.locales;

  const toolSlugs = [
    'merge', 'split', 'compress', 'add-watermark', 'edit-metadata', 
    'fill-form', 'rotate', 'remove-pages', 'extract-pages', 
    'add-page-numbers', 'crop', 'sign', 'unlock', 'add-image', 'flatten',
    'pdf-to-jpg', 'jpg-to-pdf', 'protect'
  ];

  const staticPages = ['about', 'contact', 'privacy-policy', 'terms-of-service', 'cookie-policy', 'blog'];
  
  // By explicitly typing the array, we prevent the TypeScript error.
  const allUrls: MetadataRoute.Sitemap = [];

  locales.forEach(lang => {
    // Main page for each language
    allUrls.push({
      url: `${baseUrl}/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    });

    // Tool pages for each language
    toolSlugs.forEach(slug => {
        allUrls.push({
            url: `${baseUrl}/${lang}/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        });
    });

    // Static pages for each language
    staticPages.forEach(slug => {
        allUrls.push({
            url: `${baseUrl}/${lang}/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        });
    });
  });

  return allUrls;
}