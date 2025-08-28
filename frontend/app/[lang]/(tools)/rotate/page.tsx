import { Rotator } from "@/components/Rotator";
import type { Metadata } from 'next';
import type { Locale } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary';

export async function generateMetadata({ params: { lang } }: { params: { lang: Locale } }): Promise<Metadata> {
  const dictionary = await getDictionary(lang);
  const t = dictionary.rotate_pdf || {};
  return {
    title: t.meta_title || 'Rotate PDF | Free Online Page Rotator',
    description: t.meta_description || 'Easily rotate pages in your PDF document for free. Rotate individual pages left or right with a live preview.',
  };
}

export default async function RotatePage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);
  const t = dictionary.rotate_pdf || {};

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">{t.title || 'Rotate PDF Pages'}</h1>
        <p className="text-lg text-muted-foreground mt-2">{t.subtitle || 'Review and rotate individual pages.'}</p>
      </div>

      <Rotator />

    </div>
  );
}