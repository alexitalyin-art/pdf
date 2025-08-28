import type { Metadata } from 'next';
import type { Locale } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary';
import { Watermarker } from '@/components/Watermarker';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export async function generateMetadata({ params: { lang } }: { params: { lang: Locale } }): Promise<Metadata> {
  const dictionary = await getDictionary(lang);
  // Assuming you will add 'add_watermark' to your dictionaries
  const t = dictionary.add_watermark || {};
  return {
    title: t.meta_title || 'Add Watermark to PDF | Free Online Watermarking Tool',
    description: t.meta_description || 'Easily add a text watermark to your PDF documents. Customize text, font size, and opacity. Secure and free to use in your browser.',
  };
}

export default async function AddWatermarkPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);
  // Assuming you will add 'add_watermark' to your dictionaries
  const t = dictionary.add_watermark || {};

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">{t.title || 'Add Watermark to PDF'}</h1>
        <p className="text-lg text-muted-foreground mt-2">{t.subtitle || 'Apply a text watermark to every page of your PDF.'}</p>
      </div>

      <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-12 h-12 animate-spin" /></div>}>
        <Watermarker dictionary={t as any} />
      </Suspense>

      {/* You can add translated SEO content to your dictionary files later */}
      <div className="prose dark:prose-invert max-w-4xl mx-auto mt-12">
        <h2>How to Add a Watermark to a PDF</h2>
        <ol>
          <li>Drag and drop your PDF file into the upload area above.</li>
          <li>Enter the text you want to use as your watermark.</li>
          <li>Adjust the font size and opacity using the sliders.</li>
          <li>Click the "Add Watermark & Download" button.</li>
          <li>Your new, watermarked PDF will be generated for you to download instantly.</li>
        </ol>
      </div>
    </div>
  );
}