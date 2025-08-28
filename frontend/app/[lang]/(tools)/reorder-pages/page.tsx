import { Reorderer } from "@/components/Reorderer";
import type { Metadata } from 'next';
import type { Locale } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary';

export async function generateMetadata({ params: { lang } }: { params: { lang: Locale } }): Promise<Metadata> {
  const dictionary = await getDictionary(lang);
  // Assuming you will add 'reorder_pages' to your dictionaries
  const t = dictionary.reorder_pages || {};
  return {
    title: t.meta_title || 'Reorder PDF Pages | Free Online PDF Organizer',
    description: t.meta_description || 'Easily rearrange the pages of your PDF document. Drag and drop pages into a new order and save the result for free.',
  };
}

export default async function ReorderPagesPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);
  const t = dictionary.reorder_pages || {};

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">{t.title || 'Reorder PDF Pages'}</h1>
        <p className="text-lg text-muted-foreground mt-2">{t.subtitle || 'Drag and drop pages to change their order.'}</p>
      </div>

      <Reorderer />

      {/* You can add translated SEO content here later */}
      <div className="prose dark:prose-invert max-w-4xl mx-auto mt-12">
        <h2>How to Reorder PDF Pages</h2>
        <p>
            Our visual page organizer makes it simple to change the order of pages in your PDF files.
        </p>
        <ol>
            <li>Upload your PDF file.</li>
            <li>A preview of all your pages will be displayed in a grid.</li>
            <li>Click and drag any page to a new position. The other pages will automatically adjust.</li>
            <li>Once you are happy with the new order, click the "Save Reordered PDF" button.</li>
            <li>Download your newly organized PDF file.</li>
        </ol>
      </div>
    </div>
  );
}