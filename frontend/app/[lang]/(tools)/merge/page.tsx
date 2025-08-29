import type { Metadata } from 'next';
import type { Locale } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary';
import { Merger } from '@/components/Merger';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export async function generateMetadata({ params: { lang } }: { params: { lang: Locale } }): Promise<Metadata> {
  const dictionary = await getDictionary(lang);
  const t = dictionary.merge_pdf;
  return {
    title: t.meta_title,
    description: t.meta_description,
  };
}

export default async function MergePage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);
  const t = dictionary.merge_pdf;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">{t.h1}</h1>
        <p className="text-lg text-muted-foreground mt-2">{t.subtitle}</p>
      </div>

      <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-12 h-12 animate-spin" /></div>}>
        <Merger dictionary={t as any} />
      </Suspense>

      <div className="prose dark:prose-invert max-w-4xl mx-auto mt-12">
        <h2>{t.how_to_title}</h2>
        <ol>
          <li>{t.how_to_step_1}</li>
          <li>{t.how_to_step_2}</li>
          <li>{t.how_to_step_3}</li>
          <li>{t.how_to_step_4}</li>
        </ol>
        
        {/* Suggested Internal Links */}
        <p>After merging, you may want to <a href={`/${lang}/compress`}>Compress your PDF</a> or <a href={`/${lang}/add-page-numbers`}>Add Page Numbers</a>.</p>

        {/* Suggested Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Merge PDF - A2Z Tool",
            "operatingSystem": "Any (Web Browser)",
            "applicationCategory": "BusinessApplication",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "12580"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          }) }}
        />
      </div>
    </div>
  );
}