'use client';

import { useState } from 'react';
import { ToolCard } from '@/components/ToolCard';
import { Input } from '@/components/ui/input';
import { 
    Scissors, Zap, Layers, FileUp, RefreshCw, Type, Droplet, Crop, Unlock, SquarePen,
    FileMinus, FilePenLine, ImagePlus, Combine
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ShieldCheck, Files } from 'lucide-react';

// A simple dictionary for the homepage text
// In a real app, this would come from your dictionary files
const translations: any = {
    en: {
        homepage_title: "A2Z Tool - Free Online PDF Tools",
        homepage_subtitle: "All the tools you need to work with PDFs, 100% free, secure, and run in your browser – no signup needed.",
        why_title: "Why Choose A2Z Tool?",
        why_secure_title: "Complete Privacy",
        why_secure_desc: "Your files are processed entirely in your browser. Nothing is ever uploaded to our servers, guaranteeing your data remains 100% private.",
        why_comprehensive_title: "All The Tools You Need",
        why_comprehensive_desc: "From merging and compressing to signing and editing, we offer a full suite of tools to handle any PDF task you have.",
        why_easy_title: "Simple and Fast",
        why_easy_desc: "No sign-ups, no ads, just simple, fast tools that get the job done. Our clean interface is designed to be intuitive for everyone.",
        faq_title: "Frequently Asked Questions",
        faq_q1: "Are the tools on A2Z Tool really free?",
        faq_a1: "Yes, all browser-based tools on our site are completely free to use without any limits or the need to sign up.",
        faq_q2: "Is it safe to use online PDF tools?",
        faq_a2: "It is 100% safe on A2Z Tool. Unlike other sites, our tools work on your computer ('client-side'), so your files never leave your device. We never upload or store your documents.",
        faq_q3: "Do I need to install any software?",
        faq_a3: "No. All of our tools work directly in your web browser. There is nothing to install. The site works on Windows, Mac, Linux, and mobile devices.",
        // Tool Card Text
        merge_pdf_title: "Merge PDF",
        merge_pdf_desc: "Combine multiple PDFs into one.",
        split_pdf_title: "Split PDF",
        split_pdf_desc: "Extract pages from a PDF.",
        compress_pdf_title: "Compress PDF",
        compress_pdf_desc: "Reduce the file size of a PDF.",
        rotate_pdf_title: "Rotate PDF",
        rotate_pdf_desc: "Rotate all or selected pages in a PDF.",
        reorder_pages_title: "Reorder Pages",
        reorder_pages_desc: "Drag and drop to reorder PDF pages.",
        remove_pages_title: "Remove Pages",
        remove_pages_desc: "Select and delete specific pages.",
        extract_pages_title: "Extract Pages",
        extract_pages_desc: "Create a new PDF from selected pages.",
        add_page_numbers_title: "Add Page Numbers",
        add_page_numbers_desc: "Insert page numbers into a PDF.",
        add_watermark_title: "Add Watermark",
        add_watermark_desc: "Add a text or image watermark.",
        crop_pdf_title: "Crop PDF",
        crop_pdf_desc: "Trim the margins of your PDF pages.",
        sign_pdf_title: "Sign PDF",
        sign_pdf_desc: "Add a drawn or typed signature.",
        unlock_pdf_title: "Unlock PDF",
        unlock_pdf_desc: "Remove password from a PDF file.",
        add_image_title: "Add an Image",
        add_image_desc: "Place an image onto pages of a PDF.",
        edit_metadata_title: "Edit Metadata",
        edit_metadata_desc: "Change the file's author, title, etc.",
        fill_form_title: "Fill PDF Form",
        fill_form_desc: "Fill out and complete PDF forms online.",
        erase_edit_title: "Erase & Edit Text",
        erase_edit_desc: "Cover up text and write on top.",
        flatten_pdf_title: "Flatten PDF",
        flatten_pdf_desc: "Make form fields and annotations non-editable.",
        protect_pdf_title: "Protect PDF",
        protect_pdf_desc: "Add a password to secure your PDF file.",
    },
    // You would have 'es', 'hi', etc. here
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const lang = pathname.split('/')[1] || 'en';
  
  const dict = translations[lang] || translations.en;
  
  const tools = [
    { id: 'merge', title: dict.merge_pdf_title, description: dict.merge_pdf_desc, href: `/${lang}/merge`, icon: <Layers /> },
    { id: 'split', title: dict.split_pdf_title, description: dict.split_pdf_desc, href: `/${lang}/split`, icon: <Scissors /> },
    { id: 'reorder', title: dict.reorder_pages_title, description: dict.reorder_pages_desc, href: `/${lang}/reorder-pages`, icon: <FileUp /> },
    { id: 'rotate', title: dict.rotate_pdf_title, description: dict.rotate_pdf_desc, href: `/${lang}/rotate`, icon: <RefreshCw /> },
    { id: 'remove', title: dict.remove_pages_title, description: dict.remove_pages_desc, href: `/${lang}/remove-pages`, icon: <FileMinus /> },
    { id: 'extract', title: dict.extract_pages_title, description: dict.extract_pages_desc, href: `/${lang}/extract-pages`, icon: <FileUp /> },
    { id: 'add-numbers', title: dict.add_page_numbers_title, description: dict.add_page_numbers_desc, href: `/${lang}/add-page-numbers`, icon: <Type /> },
    { id: 'watermark', title: dict.add_watermark_title, description: dict.add_watermark_desc, href: `/${lang}/add-watermark`, icon: <Droplet /> },
    { id: 'crop', title: dict.crop_pdf_title, description: dict.crop_pdf_desc, href: `/${lang}/crop`, icon: <Crop /> },
    { id: 'sign', title: dict.sign_pdf_title, description: dict.sign_pdf_desc, href: `/${lang}/sign`, icon: <SquarePen /> },
    { id: 'unlock', title: dict.unlock_pdf_title, description: dict.unlock_pdf_desc, href: `/${lang}/unlock`, icon: <Unlock /> },
    { id: 'add-image', title: dict.add_image_title, description: dict.add_image_desc, href: `/${lang}/add-image`, icon: <ImagePlus /> },
    { id: 'edit-metadata', title: dict.edit_metadata_title, description: dict.edit_metadata_desc, href: `/${lang}/edit-metadata`, icon: <FilePenLine /> },
    { id: 'fill-form', title: dict.fill_form_title, description: dict.fill_form_desc, href: `/${lang}/fill-form`, icon: <FilePenLine /> },
    { id: 'erase-edit', title: dict.erase_edit_title, description: dict.erase_edit_desc, href: `/${lang}/erase-edit`, icon: <Combine /> },
    { id: 'flatten', title: dict.flatten_pdf_title, description: dict.flatten_pdf_desc, href: `/${lang}/flatten`, icon: <Combine /> },
   
  ];

  const backendTools = [
    { id: 'compress', title: dict.compress_pdf_title, description: dict.compress_pdf_desc, href: `/${lang}/compress`, icon: <Zap /> },
  ];

  const filteredTools = tools.filter(tool =>
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredBackendTools = backendTools.filter(tool =>
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <main className="flex flex-col items-center p-8 md:p-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{dict.homepage_title}</h1>
          <p className="text-lg text-muted-foreground">{dict.homepage_subtitle}</p>
        </div>

        <div className="w-full max-w-xl mb-12">
          <Input
            type="search"
            placeholder="Find a tool..."
            className="w-full text-lg p-6"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full max-w-6xl">
          <h2 className="text-2xl font-bold mb-6">Browser-Based Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} {...tool} />
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-6">Backend-Powered Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBackendTools.map((tool) => (
              <ToolCard key={tool.id} {...tool} />
            ))}
          </div>
        </div>
      </main>

      <section className="w-full bg-secondary py-12 md:py-20">
        <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-8">{dict.why_title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center">
                    <ShieldCheck className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold">{dict.why_secure_title}</h3>
                    <p className="text-muted-foreground mt-2">{dict.why_secure_desc}</p>
                </div>
                <div className="flex flex-col items-center">
                    <Files className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold">{dict.why_comprehensive_title}</h3>
                    <p className="text-muted-foreground mt-2">{dict.why_comprehensive_desc}</p>
                </div>
                <div className="flex flex-col items-center">
                    <Zap className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold">{dict.why_easy_title}</h3>
                    <p className="text-muted-foreground mt-2">{dict.why_easy_desc}</p>
                </div>
            </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-20">
        <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-8">{dict.faq_title}</h2>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg">{dict.faq_q1}</AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">{dict.faq_a1}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-lg">{dict.faq_q2}</AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">{dict.faq_a2}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className="text-lg">{dict.faq_q3}</AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">{dict.faq_a3}</AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
      </section>
    </>
  );
}