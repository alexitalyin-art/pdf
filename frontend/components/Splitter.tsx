'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { UploadCloud, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PDFDocumentProxy } from 'pdfjs-dist';

const PDFCarouselViewer = dynamic(() => 
  import('@/components/PDFCarouselViewer').then(mod => mod.PDFCarouselViewer), 
  {
    ssr: false,
    loading: () => <div className="text-center py-20"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Loading Viewer...</p></div>,
  }
);

const parsePageRanges = (rangeStr: string): number[] => {
  if (!rangeStr.trim()) return [];
  const pages = new Set<number>();
  const ranges = rangeStr.split(',');
  for (const range of ranges) {
    const trimmedRange = range.trim();
    if (trimmedRange.includes('-')) {
      const [start, end] = trimmedRange.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) for (let i = start; i <= end; i++) pages.add(i);
    } else {
      const pageNum = Number(trimmedRange);
      if (!isNaN(pageNum)) pages.add(pageNum);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
};

interface SplitToolDict {
    dropzone_text: string;
    label_pages: string;
    placeholder_pages: string;
    help_text: string;
    button_split: string;
    processing: string;
    success_message: string;
    download_button: string;
    total_pages: string;
}

export const Splitter = ({ dictionary }: { dictionary: SplitToolDict }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState('');
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitPdfUrl, setSplitPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setSplitPdfUrl(null);
      setPageRange('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { 'application/pdf': ['.pdf'] } });

  const handleSplit = async () => {
    if (!file || !pageRange) return alert('Please select a file and enter page ranges.');
    setIsSplitting(true);
    setSplitPdfUrl(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pageNumbersToExtract = parsePageRanges(pageRange);
      if (pageNumbersToExtract.length === 0) throw new Error("Invalid page range.");
      const pageIndices = pageNumbersToExtract.map(n => n - 1);
      
      for (const index of pageIndices) {
        if (index < 0 || index >= pdfDoc.getPageCount()) throw new Error(`Invalid page number: ${index + 1}.`);
      }
      
      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach(page => newDoc.addPage(page));
      
      const pdfBytes = await newDoc.save();
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      uint8Array.set(pdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      setSplitPdfUrl(url);
    } catch (error) {
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
        <CardContent className="p-6">
        {!file ? (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center transition-colors ${isDragActive ? 'border-primary bg-secondary' : 'border-border'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
              <UploadCloud className="w-12 h-12 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">{dictionary.dropzone_text}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow lg:w-2/3">
              <PDFCarouselViewer file={file} currentPage={currentPage} onPageChange={setCurrentPage} onPdfLoad={(pdf: PDFDocumentProxy) => setTotalPages(pdf.numPages)} />
            </div>
            <div className="lg:w-1/3 flex flex-col items-center justify-center">
              <div className="w-full">
                <Label htmlFor="pageRange" className="block text-lg font-semibold mb-2">{dictionary.label_pages}</Label>
                <Input type="text" id="pageRange" value={pageRange} onChange={(e) => setPageRange(e.target.value)} placeholder={dictionary.placeholder_pages} />
                <p className="text-sm text-muted-foreground mt-1">{dictionary.help_text} ({totalPages} {dictionary.total_pages})</p>
              </div>
              <div className="w-full mt-6">
                <Button onClick={handleSplit} disabled={isSplitting} className="w-full text-lg py-6">
                  {isSplitting ? dictionary.processing : dictionary.button_split}
                </Button>
                 <Button variant="ghost" onClick={() => setFile(null)} className="mt-2 w-full text-center">
                    Choose a different file
                </Button>
              </div>
            </div>
          </div>
        )}
        {splitPdfUrl && (
           <div className="mt-8 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">{dictionary.success_message}</h3>
            <Button asChild size="lg">
              <a href={splitPdfUrl} download={`split-${file?.name || 'document'}.pdf`}>
                {dictionary.download_button}
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};