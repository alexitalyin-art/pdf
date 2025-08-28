import { Remover } from "@/components/Remover";
import type { Metadata } from 'next';
import type { Locale } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary';

export async function generateMetadata({ params: { lang } }: { params: { lang: Locale } }): Promise<Metadata> {
  const dictionary = await getDictionary(lang);
  // Assuming you will add 'remove_pages' to your dictionaries
  const t = dictionary.remove_pages || {};
  return {
    title: t.meta_title || 'Remove Pages from PDF | Free Online Tool',
    description: t.meta_description || 'Easily delete specific pages from your PDF document online. Select and remove pages in seconds. Secure and browser-based.',
  };
}

export default async function RemovePagesPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);
  const t = dictionary.remove_pages || {};

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">{t.title || 'Remove PDF Pages'}</h1>
        <p className="text-lg text-muted-foreground mt-2">{t.subtitle || 'Click on pages to select them for deletion.'}</p>
      </div>

      <Remover />

      {/* You can add translated SEO content here later */}
      <div className="prose dark:prose-invert max-w-4xl mx-auto mt-12">
        <h2>How to Delete Pages from a PDF</h2>
        <p>
            Our tool provides a simple visual interface to remove unwanted pages from your PDF files. The process is fast, free, and completely private.
        </p>
        <ol>
            <li>Drag and drop your PDF file into the upload area.</li>
            <li>A preview of all your pages will be displayed in a grid.</li>
            <li>Click on any page you wish to delete. A blue border will indicate it has been selected. Click it again to deselect.</li>
            <li>Once you've selected all the pages to remove, click the "Remove Pages" button.</li>
            <li>Download your new PDF, which will no longer contain the pages you deleted.</li>
        </ol>
      </div>
    </div>
  );
}