/** @type {import('next-sitemap').IConfig} */

// List all your languages and tools here
const locales = ['en', 'es', 'hi', 'pt', 'zh', 'fr', 'ar', 'de', 'ru', 'ur'];
const toolSlugs = [
    'merge', 'split', 'compress', 'add-watermark', 'edit-metadata', 
    'fill-form', 'rotate', 'remove-pages', 'extract-pages', 
    'add-page-numbers', 'crop', 'sign', 'unlock', 'add-image', 'flatten',
    'pdf-to-jpg', 'jpg-to-pdf'
];
const staticPages = ['about', 'contact', 'privacy-policy', 'terms-of-service', 'cookie-policy', 'blog'];

module.exports = {
  siteUrl: 'https://a2ztool.vercel.app',
  generateRobotsTxt: true, // This will create a new, correct robots.txt
  
  // This is a more robust way to add all your pages
  additionalPaths: async (config) => {
    const paths = [];

    // Add all language homepages
    locales.forEach(lang => {
      paths.push({
        loc: `/${lang}`,
        changefreq: 'daily',
        priority: 1.0,
      });
    });

    // Add all tool pages for every language
    locales.forEach(lang => {
      toolSlugs.forEach(slug => {
        paths.push({
          loc: `/${lang}/${slug}`,
          changefreq: 'monthly',
          priority: 0.8,
        });
      });
    });
    
    // Add all static pages for every language
    locales.forEach(lang => {
      staticPages.forEach(slug => {
        paths.push({
          loc: `/${lang}/${slug}`,
          changefreq: 'weekly',
          priority: 0.6,
        });
      });
    });

    return paths;
  },
};