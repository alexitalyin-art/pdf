import { ToolCard } from '@/components/ToolCard';
import { 
    Scissors, Zap, Layers, FileUp, RefreshCw, Type, Droplet, Crop, Unlock, SquarePen,
    FileMinus, FilePenLine, ImagePlus, Combine
} from 'lucide-react';
import type { Locale } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary'; // We now import the central function

export default async function Home({ params: { lang } }: { params: { lang: Locale } }) {
  // We use the imported function, which knows all languages
  const dict = await getDictionary(lang);
  
  const tools = [
    { title: 'Merge PDF', description: 'Combine multiple PDFs into one.', href: `/${lang}/merge`, icon: <Layers /> },
    { title: 'Split PDF', description: 'Extract pages from a PDF.', href: `/${lang}/split`, icon: <Scissors /> },
    { title: 'Reorder Pages', description: 'Drag and drop to reorder PDF pages.', href: `/${lang}/reorder-pages`, icon: <FileUp /> },
    { title: 'Rotate PDF', description: 'Rotate all or selected pages in a PDF.', href: `/${lang}/rotate`, icon: <RefreshCw /> },
    { title: 'Remove Pages', description: 'Select and delete specific pages.', href: `/${lang}/remove-pages`, icon: <FileMinus /> },
    { title: 'Extract Pages', description: 'Create a new PDF from selected pages.', href: `/${lang}/extract-pages`, icon: <FileUp /> },
    { title: 'Add Page Numbers', description: 'Insert page numbers into a PDF.', href: `/${lang}/add-page-numbers`, icon: <Type /> },
    { title: 'Add Watermark', description: 'Add a text or image watermark.', href: `/${lang}/add-watermark`, icon: <Droplet /> },
    { title: 'Crop PDF', description: 'Trim the margins of your PDF pages.', href: `/${lang}/crop`, icon: <Crop /> },
    { title: 'Sign PDF', description: 'Add a drawn or typed signature.', href: `/${lang}/sign`, icon: <SquarePen /> },
    { title: 'Unlock PDF', description: 'Remove password from a PDF file.', href: `/${lang}/unlock`, icon: <Unlock /> },
    { title: 'Add an Image', description: 'Place an image onto pages of a PDF.', href: `/${lang}/add-image`, icon: <ImagePlus /> },
    { title: 'Edit Metadata', description: 'Change the file\'s author, title, etc.', href: `/${lang}/edit-metadata`, icon: <FilePenLine /> },
    { title: 'Fill PDF Form', description: 'Fill out and complete PDF forms online.', href: `/${lang}/fill-form`, icon: <FilePenLine /> },
    { title: 'Erase & Edit Text', description: 'Cover up text and write on top.', href: `/${lang}/erase-edit`, icon: <Combine /> },
    { title: 'Flatten PDF', description: 'Make form fields and annotations non-editable.', href: `/${lang}/flatten`, icon: <Combine /> },
  ];

  const backendTools = [
      { title: 'Compress PDF', description: 'Reduce the file size of a PDF.', href: `/${lang}/compress`, icon: <Zap /> },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{dict.homepage.title}</h1>
        <p className="text-lg text-gray-600">{dict.homepage.subtitle}</p>
      </div>

      <div className="w-full max-w-6xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Browser-Based Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {tools.map((tool, index) => (
            <ToolCard key={index} {...tool} />
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">Backend-Powered Tools</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {backendTools.map((tool, index) => (
            <ToolCard key={index} {...tool} />
          ))}
        </div>
      </div>
    </main>
  );
}