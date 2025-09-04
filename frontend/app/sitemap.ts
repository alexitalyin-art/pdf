import { MetadataRoute } from 'next'
import { i18n } from '@/i18n-config'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://a2ztool.vercel.app';
  const locales = i18n.locales;

  const toolSlugs = [
    'merge', 'split', 'compress', 'add-watermark', 'edit-metadata', 'fill-form', 
    'rotate', 'remove-pages', 'extract-pages', 'add-page-numbers', 'crop', 
    'sign', 'unlock', 'add-image', 'flatten', 'pdf-to-jpg', 'jpg-to-pdf'
  ];
  const staticPages = ['about', 'contact', 'privacy-policy', 'terms-of-service', 'cookie-policy', 'blog'];
  
  const allUrls: MetadataRoute.Sitemap = [];

  locales.forEach(lang => {
    allUrls.push({ url: `${baseUrl}/${lang}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 });
    
    toolSlugs.forEach(slug => {
        allUrls.push({ url: `${baseUrl}/${lang}/${slug}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 });
    });

    staticPages.forEach(slug => {
        allUrls.push({ url: `${baseUrl}/${lang}/${slug}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 });
    });
  });

  return allUrls;
}