'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { FileText, UploadCloud, Type, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PDFDocumentProxy } from 'pdfjs-dist';

const PDFCarouselViewer = dynamic(() => import('@/components/PDFCarouselViewer').then(mod => mod.PDFCarouselViewer), {
  ssr: false,
  loading: () => <div className="text-center py-20"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Loading Viewer...</p></div>,
});

type Position = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export default function AddPageNumbersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [position, setPosition] = useState<Position>('bottom-center');
  const [startNumber, setStartNumber] = useState(1);
  const [fontSize, setFontSize] = useState(12);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setOutputPdfUrl(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { 'application/pdf': ['.pdf'] } });

  const handleAddNumbers = async () => {
    if (!file) return;
    setIsProcessing(true);
    setOutputPdfUrl(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const margin = 50;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const pageNumberText = `${i + startNumber}`;
        const textWidth = helveticaFont.widthOfTextAtSize(pageNumberText, fontSize);
        let x = 0, y = 0;

        switch (position) {
            case 'top-left': x = margin; y = height - margin - fontSize; break;
            case 'top-center': x = width / 2 - textWidth / 2; y = height - margin - fontSize; break;
            case 'top-right': x = width - textWidth - margin; y = height - margin - fontSize; break;
            case 'bottom-left': x = margin; y = margin; break;
            case 'bottom-center': x = width / 2 - textWidth / 2; y = margin; break;
            case 'bottom-right': x = width - textWidth - margin; y = margin; break;
        }
        page.drawText(pageNumberText, { x, y, size: fontSize, font: helveticaFont, color: rgb(0, 0, 0) });
      }

      const pdfBytes = await pdfDoc.save();
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      uint8Array.set(pdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
    } catch (error) {
      console.error('Error adding page numbers:', error);
      alert('An error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const positionOptions: { value: Position; label: string }[] = [
    { value: 'bottom-center', label: 'Bottom Center' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'top-center', label: 'Top Center' },
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-right', label: 'Top Right' },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl font-bold">Add Page Numbers</CardTitle>
            <CardDescription className="text-md md:text-lg text-muted-foreground">Add and preview page numbers on your PDF.</CardDescription>
        </CardHeader>
        <CardContent>
        {!file ? (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-primary bg-secondary' : 'border-border'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4"><UploadCloud className="w-12 h-12 text-muted-foreground" /><p className="text-lg text-muted-foreground">Drag & drop a PDF here</p></div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow lg:w-2/3">
              <PDFCarouselViewer
                file={file}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onPdfLoad={(pdf: PDFDocumentProxy) => setTotalPages(pdf.numPages)}
                pageNumberOptions={{ fontSize, position, startNumber }}
              />
            </div>
            <div className="lg:w-1/3 flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select value={position} onValueChange={(value: Position) => setPosition(value)}>
                    <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                    <SelectContent>
                        {positionOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startNumber">Start at page</Label>
                <Input type="number" id="startNumber" value={startNumber} onChange={e => setStartNumber(parseInt(e.target.value, 10) || 1)} min="1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size ({fontSize}pt)</Label>
                <Input type="range" id="fontSize" min="8" max="48" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value, 10))} />
              </div>
              <Button onClick={handleAddNumbers} disabled={isProcessing} className="w-full text-lg py-6">
                <Type className="mr-2 h-5 w-5" />
                {isProcessing ? 'Processing...' : 'Add Numbers & Download'}
              </Button>
            </div>
          </div>
        )}
        {outputPdfUrl && (
          <div className="mt-6 text-center p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 border rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">Your PDF is Ready!</h3>
            <Button asChild size="lg">
              <a href={outputPdfUrl} download={`numbered-${file?.name}`}>Download Numbered PDF</a>
            </Button>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}