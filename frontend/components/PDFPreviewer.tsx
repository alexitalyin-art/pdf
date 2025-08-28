'use client';

import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2 } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PDFPreviewerProps {
  file: File;
  onPreviewGenerated?: (previews: string[]) => void;
  interactive?: boolean;
  onPageSelect?: (pageNumber: number) => void;
  selectedPages?: Set<number>;
}

export const PDFPreviewer = ({ file, onPreviewGenerated, interactive = false, onPageSelect, selectedPages }: PDFPreviewerProps) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const generatePreviews = async () => {
      if (!file) return;
      setIsGenerating(true);
      setPreviews([]);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        const newPreviews: string[] = [];

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (context) { // This check ensures context is not null
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            newPreviews.push(canvas.toDataURL());
          }
        }
        setPreviews(newPreviews);
        if (onPreviewGenerated) onPreviewGenerated(newPreviews);
      } catch (error) {
        console.error('Failed to generate previews:', error);
      }
      setIsGenerating(false);
    };
    generatePreviews();
  }, [file, onPreviewGenerated]);

  if (isGenerating) {
    return (
      <div className="text-center py-10"><Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" /><p className="mt-4 text-gray-600">Generating page previews...</p></div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {previews.map((src, index) => {
          const pageNumber = index + 1;
          const isSelected = selectedPages?.has(pageNumber);
          return (
            <div key={index} className={`relative text-center ${interactive ? 'cursor-pointer' : ''}`} onClick={() => interactive && onPageSelect?.(pageNumber)}>
              <img src={src} alt={`Page ${pageNumber}`} className={`border-4 rounded-md shadow-sm transition-all ${isSelected ? 'border-blue-500 scale-105' : 'border-transparent'}`} />
              <span className="block mt-1 text-sm font-semibold">{pageNumber}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};