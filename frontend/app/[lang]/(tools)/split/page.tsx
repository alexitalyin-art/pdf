import type { Metadata } from 'next';
import type { Locale } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary';
import { Splitter } from '@/components/Splitter';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export async function generateMetadata({ params: { lang } }: { params: { lang: Locale } }): Promise<Metadata> {
  const dictionary = await getDictionary(lang);
  const t = dictionary.split_pdf || {};
  return {
    title: t.meta_title || 'Split PDF',
    description: t.meta_description || 'Split a PDF file online.',
  };
}

export default async function SplitPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);
  const t = dictionary.split_pdf;

  // Assuming you'll add these to your dictionary files.
  const seoContent = {
      how_to_title: "How to Split a PDF File",
      how_to_step_1: "Upload your PDF file by dragging it into the drop zone.",
      how_to_step_2: "Use the preview to review your document's pages.",
      how_to_step_3: "Enter the page numbers or ranges you wish to extract into the text box (e.g., '1-3, 5').",
      how_to_step_4: "Click the 'Split PDF' button and download your new, smaller document.",
      faq_title: "FAQs about Splitting PDFs",
      faq_q1: "Can I extract pages in any order?",
      faq_a1: "Yes, you can enter page numbers in any order, like '5, 1-3'. The final document will contain the pages in the sorted order (1, 2, 3, 5).",
      faq_q2: "Will my original file be changed?",
      faq_a2: "No. Your original file remains untouched. Our tool creates a brand new PDF file containing only the pages you selected."
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">{t.title}</h1>
        <p className="text-lg text-muted-foreground mt-2">{t.subtitle}</p>
      </div>

      <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-12 h-12 animate-spin" /></div>}>
        <Splitter dictionary={t as any} />
      </Suspense>

      <div className="prose dark:prose-invert max-w-4xl mx-auto mt-12">
        <h2>{seoContent.how_to_title}</h2>
        <ol>
          <li>{seoContent.how_to_step_1}</li>
          <li>{seoContent.how_to_step_2}</li>
          <li>{seoContent.how_to_step_3}</li>
          <li>{seoContent.how_to_step_4}</li>
        </ol>
        <h2>{seoContent.faq_title}</h2>
        <h3>{seoContent.faq_q1}</h3>
        <p>{seoContent.faq_a1}</p>
        <h3>{seoContent.faq_q2}</h3>
        <p>{seoContent.faq_a2}</p>
      </div>
    </div>
  );
}