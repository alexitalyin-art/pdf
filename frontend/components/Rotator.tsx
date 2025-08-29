'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, degrees } from 'pdf-lib';
import { UploadCloud, RotateCw, RotateCcw, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { PDFDocumentProxy } from 'pdfjs-dist';

const PDFCarouselViewer = dynamic(() => import('@/components/PDFCarouselViewer').then(mod => mod.PDFCarouselViewer), {
  ssr: false,
  loading: () => <div className="text-center py-20"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Loading Viewer...</p></div>,
});

interface RotateToolDict {
    dropzone_text: string;
    rotate_current_page: string;
    button_apply: string;
    processing: string;
    success_message: string;
    download_button: string;
}

export const Rotator = ({ dictionary }: { dictionary: RotateToolDict }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotatedPdfUrl, setRotatedPdfUrl] = useState<string | null>(null);
  const [rotations, setRotations] = useState<{ [key: number]: number }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setRotatedPdfUrl(null);
      setRotations({});
      setCurrentPage(1);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { 'application/pdf': ['.pdf'] } });

  const handlePerPageRotate = (direction: 'cw' | 'ccw') => {
    const angle = direction === 'cw' ? 90 : -90;
    setRotations(prev => {
      const currentRotation = prev[currentPage] || 0;
      const newRotation = (currentRotation + angle);
      return { ...prev, [currentPage]: newRotation };
    });
  };

  const handleApplyChanges = async () => {
    if (!file) return;
    setIsProcessing(true);
    setRotatedPdfUrl(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      Object.entries(rotations).forEach(([pageNumStr, angle]) => {
        const pageNum = parseInt(pageNumStr, 10);
        if (angle !== 0) {
          const page = pdfDoc.getPage(pageNum - 1);
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + angle));
        }
      });

      const pdfBytes = await pdfDoc.save();
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      uint8Array.set(pdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      setRotatedPdfUrl(url);
    } catch (error) {
      alert('An error occurred while rotating the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
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
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow lg:w-2/3">
              <PDFCarouselViewer 
                file={file} 
                rotation={rotations[currentPage] || 0}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onPdfLoad={(pdf: PDFDocumentProxy) => setTotalPages(pdf.numPages)}
              />
            </div>
            <div className="lg:w-1/3 flex flex-col items-center justify-center">
              <div className="mb-6 w-full text-center">
                <h3 className="text-lg font-semibold mb-3">{dictionary.rotate_current_page}</h3>
                <div className="flex justify-center gap-4">
                  <Button onClick={() => handlePerPageRotate('ccw')} variant="outline" size="icon" className="h-12 w-12"><RotateCcw /></Button>
                  <Button onClick={() => handlePerPageRotate('cw')} variant="outline" size="icon" className="h-12 w-12"><RotateCw /></Button>
                </div>
              </div>
              <Button onClick={handleApplyChanges} disabled={isProcessing} className="w-full text-lg py-6">
                {isProcessing ? dictionary.processing : dictionary.button_apply}
              </Button>
              <Button onClick={() => setFile(null)} variant="ghost" className="mt-2 w-full text-center">
                Choose a different file
              </Button>
            </div>
          </div>
        )}
        {rotatedPdfUrl && (
          <div className="mt-6 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">{dictionary.success_message}</h3>
            <Button asChild size="lg">
              <a href={rotatedPdfUrl} download={`rotated-${file?.name}`}>{dictionary.download_button}</a>
            </Button>
          </div>
        )}
        </CardContent>
    </Card>
  );
};