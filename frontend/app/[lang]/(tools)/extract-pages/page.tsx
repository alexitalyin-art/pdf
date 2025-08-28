'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { UploadCloud, FileText, FileUp, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const PDFPreviewer = dynamic(() => import('@/components/PDFPreviewer').then(mod => mod.PDFPreviewer), {
  ssr: false,
  loading: () => <div className="text-center py-10"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Loading Previews...</p></div>,
});

export default function ExtractPagesPage() {
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
      
      // --- THIS IS THE DEFINITIVE FIX ---
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      uint8Array.set(pdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      // ------------------------------------
      
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);

    } catch (error) {
      console.error('Error extracting pages:', error);
      alert('An error occurred while extracting pages from the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl md:text-4xl font-bold">Extract PDF Pages</CardTitle>
                <CardDescription className="text-md md:text-lg">Click on pages to select them for your new PDF.</CardDescription>
            </CardHeader>
            <CardContent>
                {!file ? (
                <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center transition-colors ${isDragActive ? 'border-primary bg-secondary' : 'border-border'}`}>
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center space-y-4">
                    <UploadCloud className="w-12 h-12 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">Drag & drop a PDF here, or click to select</p>
                    </div>
                </div>
                ) : (
                <div>
                    <div className="flex items-center justify-between p-3 bg-secondary rounded-md mb-6">
                    <p className="font-medium text-secondary-foreground truncate pr-4">{file.name}</p>
                    <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Change File</Button>
                    </div>

                    <p className="text-center text-muted-foreground mb-4">Click pages to select/deselect them. Selected pages will be included in your new PDF.</p>

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
                        {isProcessing ? 'Extracting...' : `Extract ${selectedPages.size} Page(s)`}
                    </Button>
                    </div>
                </div>
                )}

                {outputPdfUrl && (
                <div className="mt-6 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
                    <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">Extraction Complete!</h3>
                    <Button asChild size="lg">
                    <a href={outputPdfUrl} download={`extracted-${file?.name}`}>Download Extracted PDF</a>
                    </Button>
                </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}