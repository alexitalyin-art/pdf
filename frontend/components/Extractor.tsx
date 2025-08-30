'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { UploadCloud, FileUp, Loader2, FileText, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const PDFPreviewer = dynamic(() => import('@/components/PDFPreviewer').then(mod => mod.PDFPreviewer), {
  ssr: false,
  loading: () => <div className="text-center py-10"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Loading Previews...</p></div>,
});

interface ExtractToolDict {
    dropzone_text: string;
    instructions: string;
    button_extract: string;
    processing: string;
    success_message: string;
    download_button: string;
}

export const Extractor = ({ dictionary }: { dictionary: ExtractToolDict }) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setSelectedPages(new Set());
      setOutputPdfUrl(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/pdf': ['.pdf'] },
  });

  const handlePageSelect = (pageNumber: number) => {
    setSelectedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageNumber)) {
        newSet.delete(pageNumber);
      } else {
        newSet.add(pageNumber);
      }
      return newSet;
    });
  };

  const handleExtract = async () => {
    if (!file || selectedPages.size === 0) {
      alert('Please select at least one page to extract.');
      return;
    }
    setIsProcessing(true);
    setOutputPdfUrl(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pageIndicesToKeep = Array.from(selectedPages).map(n => n - 1).sort((a, b) => a - b);

      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(pdfDoc, pageIndicesToKeep);
      copiedPages.forEach(page => newDoc.addPage(page));
      
      const pdfBytes = await newDoc.save();
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      uint8Array.set(pdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
    } catch (error) {
      alert('An error occurred while extracting pages.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
        {!file ? (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center ${isDragActive ? 'border-primary bg-secondary' : 'border-border'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
              <UploadCloud className="w-12 h-12 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">{dictionary.dropzone_text}</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between p-3 bg-secondary rounded-md mb-6">
              <p className="font-medium text-secondary-foreground truncate pr-4">{file.name}</p>
              <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Change File</Button>
            </div>
            <p className="text-center text-muted-foreground mb-4">{dictionary.instructions}</p>
            <PDFPreviewer 
              file={file} 
              interactive={true} 
              onPageSelect={handlePageSelect}
              selectedPages={selectedPages}
            />
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleExtract}
                disabled={isProcessing || selectedPages.size === 0}
                className="text-lg py-6"
              >
                <FileUp className="mr-2 h-5 w-5" />
                {isProcessing ? dictionary.processing : dictionary.button_extract.replace('{count}', selectedPages.size.toString())}
              </Button>
            </div>
          </div>
        )}
        {outputPdfUrl && (
          <div className="mt-6 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">{dictionary.success_message}</h3>
            <Button asChild size="lg">
              <a href={outputPdfUrl} download={`extracted-${file?.name}`}>{dictionary.download_button}</a>
            </Button>
          </div>
        )}
        </CardContent>
    </Card>
  );
};  