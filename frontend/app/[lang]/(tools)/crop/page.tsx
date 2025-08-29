import { Cropper } from "@/components/Cropper";
import type { Metadata } from 'next';
import type { Locale } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export async function generateMetadata({ params: { lang } }: { params: { lang: Locale } }): Promise<Metadata> {
  const dictionary = await getDictionary(lang);
  const t = dictionary.crop_pdf;
  return {
    title: t.meta_title,
    description: t.meta_description,
  };
}

export default async function CropPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);
  const t = dictionary.crop_pdf;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">{t.h1}</h1>
        <p className="text-lg text-muted-foreground mt-2">{t.subtitle}</p>
      </div>

      <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-12 h-12 animate-spin" /></div>}>
        <Cropper dictionary={t as any} />
      </Suspense>

      <div className="prose dark:prose-invert max-w-4xl mx-auto mt-12">
        <h2>{t.how_to_title}</h2>
        <ol>
          <li>{t.how_to_step_1}</li>
          <li>{t.how_to_step_2}</li>
          <li>{t.how_to_step_3}</li>
          <li>{t.how_to_step_4}</li>
        </ol>
      </div>
    </div>
  );
}