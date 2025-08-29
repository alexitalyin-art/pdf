'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { UploadCloud, Loader2, Save, Move, XCircle, Type, RotateCcw, FileUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Rnd } from 'react-rnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { PDFDocumentProxy } from 'pdfjs-dist';

const PDFCarouselViewer = dynamic(() => import('@/components/PDFCarouselViewer').then(mod => mod.PDFCarouselViewer), {
  ssr: false,
  loading: () => <div className="text-center py-20"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Loading Viewer...</p></div>,
});

interface PlacedText {
  id: number;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
}

interface TextAdderProps {
    file: File;
    onReset: () => void;
}

export const TextAdder = ({ file, onReset }: TextAdderProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [placedTexts, setPlacedTexts] = useState<PlacedText[]>([]);
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const [pdfJsDoc, setPdfJsDoc] = useState<PDFDocumentProxy | null>(null);

  const addTextToPage = () => {
    const newText: PlacedText = { id: Date.now(), page: currentPage, x: 50, y: 50, width: 200, height: 50, text: 'Your text here', fontSize: 16 };
    setPlacedTexts(prev => [...prev, newText]);
  };

  const updateTextValue = (id: number, newText: string) => setPlacedTexts(prev => prev.map(t => t.id === id ? { ...t, text: newText } : t));
  const deleteText = (idToDelete: number) => setPlacedTexts(prev => prev.filter(t => t.id !== idToDelete));
  const updateTextPosition = (id: number, x: number, y: number) => setPlacedTexts(prev => prev.map(t => t.id === id ? { ...t, x, y } : t));
  const updateTextSize = (id: number, width: number, height: number, x: number, y: number) => setPlacedTexts(prev => prev.map(t => t.id === id ? { ...t, width, height, x, y } : t));

  const handleApplyText = async () => {
    if (!file || placedTexts.length === 0 || !pdfJsDoc) return alert('Please add at least one text box.');
    setIsProcessing(true);
    setOutputPdfUrl(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (const item of placedTexts) {
        const page = pdfDoc.getPage(item.page - 1);
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        const viewerPage = await pdfJsDoc.getPage(item.page);
        const viewerViewport = viewerPage.getViewport({ scale: viewerContainerRef.current!.clientWidth / viewerPage.getViewport({scale: 1.0}).width });
        const scale = pageWidth / viewerViewport.width;
        
        const scaledFontSize = item.fontSize * scale;
        const textHeight = helveticaFont.heightAtSize(scaledFontSize);
        
        page.drawText(item.text, {
          x: item.x * scale,
          y: pageHeight - (item.y * scale) - textHeight,
          font: helveticaFont,
          size: scaledFontSize,
          color: rgb(0, 0, 0),
          lineHeight: (item.fontSize + 2) * scale,
          maxWidth: item.width * scale,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      uint8Array.set(pdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
    } catch (error) {
      alert('An error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (outputPdfUrl) {
    return (
        <div className="mt-6 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">Your PDF is Ready!</h3>
            <div className="flex justify-center gap-4">
                <Button asChild size="lg">
                    <a href={outputPdfUrl} download={`text-added-${file.name}`}>Download PDF</a>
                </Button>
                <Button onClick={onReset} variant="outline" size="lg">Start Over</Button>
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow lg:w-2/3 relative" ref={viewerContainerRef}>
            <PDFCarouselViewer 
                file={file} 
                currentPage={currentPage} 
                onPageChange={setCurrentPage} 
                onPdfLoad={(pdf) => {
                    setTotalPages(pdf.numPages);
                    setPdfJsDoc(pdf);
                }} 
            />
            {placedTexts.filter(t => t.page === currentPage).map(t => (
            <Rnd key={t.id} size={{ width: t.width, height: t.height }} position={{ x: t.x, y: t.y }} onDragStop={(e, d) => updateTextPosition(t.id, d.x, d.y)} onResizeStop={(e, direction, ref, delta, position) => updateTextSize(t.id, parseFloat(ref.style.width), parseFloat(ref.style.height), position.x, position.y)} className="border-2 border-dashed border-blue-500 group flex items-center justify-center">
                <textarea value={t.text} onChange={(e) => updateTextValue(t.id, e.target.value)} className="w-full h-full bg-transparent resize-none text-center outline-none p-1" style={{ fontSize: t.fontSize }} />
                <button onClick={() => deleteText(t.id)} className="absolute -top-3 -right-3 z-10 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><XCircle size={20} /></button>
            </Rnd>
            ))}
        </div>
        <div className="lg:w-1/3 flex flex-col items-center">
            <div className="w-full text-center">
            <Button onClick={addTextToPage} className="w-full flex items-center justify-center gap-2 mt-4"><Type /> Add Text Box</Button>
            </div>
            <div className="w-full mt-auto pt-4 space-y-3">
            <Button onClick={onReset} variant="outline" className="w-full flex items-center justify-center gap-2">
                <FileUp /> Change PDF
            </Button>
            <Button onClick={() => setPlacedTexts([])} disabled={placedTexts.length === 0} variant="destructive" className="w-full flex items-center justify-center gap-2">
                <RotateCcw /> Reset
            </Button>
            <Button onClick={handleApplyText} disabled={isProcessing || placedTexts.length === 0} className="w-full text-lg py-6">
                <Save /> {isProcessing ? 'Applying...' : 'Apply Text & Download'}
            </Button>
            </div>
        </div>
    </div>
  );
};