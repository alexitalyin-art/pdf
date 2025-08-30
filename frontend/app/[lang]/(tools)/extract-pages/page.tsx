import { Extractor } from "@/components/Extractor";
import type { Metadata } from 'next';
import type { Locale } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export async function generateMetadata({ params: { lang } }: { params: { lang: Locale } }): Promise<Metadata> {
  const dictionary = await getDictionary(lang);
  const t = dictionary.extract_pages || {};
  return {
    title: t.meta_title || 'Extract Pages from PDF | Free PDF Page Extractor',
    description: t.meta_description || 'Select and extract specific pages from a PDF to create a new document. Fast, secure, and works in your browser.',
  };
}

export default async function ExtractPagesPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);
  const t = dictionary.extract_pages || {};

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">{t.h1 || "A2Z Tool's Free Online PDF Page Extractor"}</h1>
        <p className="text-lg text-muted-foreground mt-2">{t.subtitle || 'Visually select the pages you want to keep and create a new PDF.'}</p>
      </div>

      <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-12 h-12 animate-spin" /></div>}>
        <Extractor dictionary={t as any} />
      </Suspense>

      <div className="prose dark:prose-invert max-w-4xl mx-auto mt-12">
        <h2>{t.how_to_title || 'How to Extract Pages from a PDF'}</h2>
        <ol>
          <li>{t.how_to_step_1 || 'Upload your PDF file.'}</li>
          <li>{t.how_to_step_2 || 'A grid preview of all your pages will be shown.'}</li>
          <li>{t.how_to_step_3 || "Click on all the pages you wish to keep in your new document."}</li>
          <li>{t.how_to_step_4 || "Click the 'Extract Pages' button to generate your new PDF."}</li>
        </ol>
      </div>
    </div>
  );
}