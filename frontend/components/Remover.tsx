'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { UploadCloud, FileText, Trash2, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const PDFPreviewer = dynamic(() => import('@/components/PDFPreviewer').then(mod => mod.PDFPreviewer), {
  ssr: false,
  loading: () => <div className="text-center py-10"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Loading Previews...</p></div>,
});

export const Remover = () => {
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

  const handleRemove = async () => {
    if (!file || selectedPages.size === 0) {
      alert('Please select at least one page to remove.');
      return;
    }

    setIsProcessing(true);
    setOutputPdfUrl(null);

    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const totalPages = pdfDoc.getPageCount();
      
      const pagesToKeepIndices = [];
      for (let i = 0; i < totalPages; i++) {
        if (!selectedPages.has(i + 1)) {
          pagesToKeepIndices.push(i);
        }
      }

      if (pagesToKeepIndices.length === 0) {
        alert("You cannot remove all pages of the document.");
        setIsProcessing(false);
        return;
      }

      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(pdfDoc, pagesToKeepIndices);
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
      console.error('Error removing pages:', error);
      alert('An error occurred while removing pages from the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
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

                <p className="text-center text-muted-foreground mb-4">Click pages to select/deselect them for removal. Selected pages will have a blue border.</p>

                <PDFPreviewer 
                file={file} 
                interactive={true} 
                onPageSelect={handlePageSelect}
                selectedPages={selectedPages}
                />
                
                <div className="flex justify-center mt-6">
                <Button
                    onClick={handleRemove}
                    disabled={isProcessing || selectedPages.size === 0}
                    className="text-lg py-6"
                    variant="destructive"
                >
                    <Trash2 className="mr-2 h-5 w-5" />
                    {isProcessing ? 'Removing...' : `Remove ${selectedPages.size} Page(s)`}
                </Button>
                </div>
            </div>
            )}

            {outputPdfUrl && (
            <div className="mt-6 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
                <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">Pages Removed!</h3>
                <Button asChild size="lg">
                <a href={outputPdfUrl} download={`removed-${file?.name}`}>Download Updated PDF</a>
                </Button>
            </div>
            )}
        </CardContent>
    </Card>
  )
};