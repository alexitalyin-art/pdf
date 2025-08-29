import type { Metadata } from 'next';
import type { Locale } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const Signer = dynamic(() => import('@/components/Signer'), {
  ssr: false,
  loading: () => <div className="flex justify-center p-12"><Loader2 className="w-12 h-12 animate-spin" /></div>,
});

export async function generateMetadata({ params: { lang } }: { params: { lang: Locale } }): Promise<Metadata> {
  const dictionary = await getDictionary(lang);
  const t = dictionary.sign_pdf || {};
  return {
    title: t.meta_title || 'Sign PDF | Free Online PDF Signature Tool',
    description: t.meta_description || 'Sign PDF documents online for free. Draw or upload your signature, place it on the document, and download the signed file.',
  };
}

export default async function SignPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);
  const t = dictionary.sign_pdf || {};

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">{t.title || 'Sign PDF Document'}</h1>
        <p className="text-lg text-muted-foreground mt-2">{t.subtitle || 'Draw, upload, and place your signature on the document.'}</p>
      </div>

      <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-12 h-12 animate-spin" /></div>}>
        <Signer />
      </Suspense>

    </div>
  );
}