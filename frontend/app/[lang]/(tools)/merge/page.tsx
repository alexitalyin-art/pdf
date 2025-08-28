import type { Metadata } from 'next';
import type { Locale } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary';
import { Merger } from '@/components/Merger';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// This function generates the SEO metadata for the page
export async function generateMetadata({ params: { lang } }: { params: { lang: Locale } }): Promise<Metadata> {
  const dictionary = await getDictionary(lang);
  const t = dictionary.merge_pdf || {}; // Add fallback for safety
  return {
    title: t.meta_title || 'Merge PDF',
    description: t.meta_description || 'Combine multiple PDFs into one.',
  };
}

export default async function MergePage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);
  const t = dictionary.merge_pdf;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">{t.title}</h1>
        <p className="text-lg text-muted-foreground mt-2">{t.subtitle}</p>
      </div>

      <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-12 h-12 animate-spin" /></div>}>
        <Merger dictionary={t as any} />
      </Suspense>

      {/* SEO CONTENT */}
      <div className="prose dark:prose-invert max-w-4xl mx-auto mt-12">
        <h2>{t.how_to_title}</h2>
        <ol>
          <li>{t.how_to_step_1}</li>
          <li>{t.how_to_step_2}</li>
          <li>{t.how_to_step_3}</li>
          <li>{t.how_to_step_4}</li>
        </ol>

        <h2>{t.why_use_title}</h2>
        <ul>
          <li><strong>{t.why_use_secure?.split('.')[0]}.</strong>{t.why_use_secure?.split('.')[1]}</li>
          <li><strong>{t.why_use_fast?.split('.')[0]}.</strong>{t.why_use_fast?.split('.')[1]}</li>
          <li><strong>{t.why_use_easy?.split('.')[0]}.</strong>{t.why_use_easy?.split('.')[1]}</li>
        </ul>

        <h2>{t.faq_title}</h2>
        <h3>{t.faq_q1}</h3>
        <p>{t.faq_a1}</p>
        <h3>{t.faq_q2}</h3>
        <p>{t.faq_a2}</p>
      </div>
    </div>
  );
}