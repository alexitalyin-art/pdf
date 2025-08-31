/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://a2ztool.vercel.app',
  generateRobotsTxt: true, // This will also create a robots.txt for you
  // This function adds all your language versions to the sitemap automatically
  transform: async (config, path) => {
    // These are the pages that should exist in every language
    const regularPages = [
        '/',
        '/about',
        '/contact',
        '/privacy-policy',
        '/terms-of-service',
        '/cookie-policy',
        '/blog'
        // Add other static pages here
    ];

    // Exclude the base path (e.g., /en, /es) and blog post pages from this logic
    if (regularPages.includes(path.replace(/\/(en|es|hi|pt|zh|fr|ar|de|ru|ur)/, ''))) {
      return {
        loc: path,
        changefreq: 'daily',
        priority: path === '/' ? 1 : 0.7,
        lastmod: new Date().toISOString(),
        // Add alternate language links for every language
        alternateRefs: config.alternateUrls ? config.alternateUrls.map(url => ({
            href: url + path,
            hreflang: url.split('/').pop(),
        })) : [],
      }
    }

    // You can add more specific logic for blog posts or other dynamic pages here if needed

    return {
      loc: path,
      changefreq: 'daily',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    }
  },
}