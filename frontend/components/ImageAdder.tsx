'use client';

import { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2, Save, Move, XCircle, ImageUp, RotateCcw, FileUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Rnd } from 'react-rnd';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const PDFCarouselViewer = dynamic(() => import('@/components/PDFCarouselViewer').then(mod => mod.PDFCarouselViewer), {
  ssr: false,
  loading: () => <div className="text-center py-20"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Loading Viewer...</p></div>,
});

interface PlacedImage {
  id: number;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  imgDataUrl: string;
}

interface ImageAdderProps {
    file: File;
    onReset: () => void;
}

export const ImageAdder = ({ file, onReset }: ImageAdderProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [placedImages, setPlacedImages] = useState<PlacedImage[]>([]);
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  
  const handleLocalReset = () => {
    setImageDataUrl(null);
    setPlacedImages([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageDataUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addImageToPage = () => {
    if (!imageDataUrl) return;
    const newImage: PlacedImage = { id: Date.now(), page: currentPage, x: 50, y: 50, width: 150, height: 150, imgDataUrl: imageDataUrl };
    setPlacedImages(prev => [...prev, newImage]);
  };

  const deleteImage = (idToDelete: number) => setPlacedImages(prev => prev.filter(img => img.id !== idToDelete));
  const updateImagePosition = (id: number, x: number, y: number) => setPlacedImages(prev => prev.map(img => img.id === id ? { ...img, x, y } : img));
  const updateImageSize = (id: number, width: number, height: number, x: number, y: number) => setPlacedImages(prev => prev.map(img => img.id === id ? { ...img, width, height, x, y } : img));

  const handleApplyImages = async () => {
    if (!file || placedImages.length === 0) return alert('Please place at least one image.');
    setIsProcessing(true);
    setOutputPdfUrl(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      for (const img of placedImages) {
        const page = pdfDoc.getPage(img.page - 1);
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        const pagePreviewInViewer = await (await pdfjsLib.getDocument({data: existingPdfBytes}).promise).getPage(img.page);
        const scale = pageWidth / pagePreviewInViewer.getViewport({scale:1.0}).width;
        
        const embeddedImage = img.imgDataUrl.startsWith('data:image/jpeg')
          ? await pdfDoc.embedJpg(img.imgDataUrl)
          : await pdfDoc.embedPng(img.imgDataUrl);
        
        page.drawImage(embeddedImage, {
          x: img.x * scale,
          y: pageHeight - (img.y * scale) - (img.height * scale),
          width: img.width * scale,
          height: img.height * scale,
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
        <div className="mt-8 text-center p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 border rounded-lg">
          <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">Your PDF is Ready!</h3>
          <div className="flex justify-center gap-4">
            <a href={outputPdfUrl} download={`updated-${file.name}`}><Button size="lg">Download Updated PDF</Button></a>
            <Button onClick={onReset} variant="outline" size="lg">Add Image to Another PDF</Button>
          </div>
        </div>
      )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow lg:w-2/3 relative" ref={viewerContainerRef}>
            <PDFCarouselViewer file={file} currentPage={currentPage} onPageChange={setCurrentPage} onPdfLoad={(pdf) => setTotalPages(pdf.numPages)} />
            {placedImages.filter(img => img.page === currentPage).map(img => (
            <Rnd key={img.id} size={{ width: img.width, height: img.height }} position={{ x: img.x, y: img.y }} onDragStop={(e, d) => updateImagePosition(img.id, d.x, d.y)} onResizeStop={(e, direction, ref, delta, position) => updateImageSize(img.id, parseFloat(ref.style.width), parseFloat(ref.style.height), position.x, position.y)} className="border-2 border-dashed border-blue-500 group">
                <img src={img.imgDataUrl} alt="placed image" className="w-full h-full" />
                <button onClick={() => deleteImage(img.id)} className="absolute -top-3 -right-3 z-10 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><XCircle size={20} /></button>
            </Rnd>
            ))}
        </div>
        <div className="lg:w-1/3 flex flex-col items-center">
            <div className="w-full text-center">
            <h3 className="text-lg font-semibold mb-2">Your Image</h3>
            <div className="p-2 bg-secondary border rounded-lg h-32 flex items-center justify-center">
                {imageDataUrl ? <img src={imageDataUrl} alt="Uploaded image" className="max-h-full" /> : <p className="text-muted-foreground">No image selected</p>}
            </div>
            <input type="file" id="image-upload" accept="image/png, image/jpeg" onChange={handleImageUpload} className="hidden" />
            <label htmlFor="image-upload" className="cursor-pointer text-sm text-primary hover:underline mt-2 inline-block">
                {imageDataUrl ? 'Change Image' : 'Select an Image'}
            </label>
            <Button onClick={addImageToPage} disabled={!imageDataUrl} className="w-full flex items-center justify-center gap-2 mt-4">
                <Move /> Place on Page
            </Button>
            </div>
            <div className="w-full mt-auto pt-4 space-y-3">
            <Button onClick={onReset} variant="outline" className="w-full flex items-center justify-center gap-2">
                <FileUp /> Change PDF
            </Button>
            <Button onClick={handleLocalReset} disabled={!imageDataUrl && placedImages.length === 0} variant="destructive" className="w-full flex items-center justify-center gap-2">
                <RotateCcw /> Reset
            </Button>
            <Button onClick={handleApplyImages} disabled={isProcessing || placedImages.length === 0} className="w-full text-lg py-6">
                <Save /> {isProcessing ? 'Applying...' : 'Apply Images & Download'}
            </Button>
            </div>
        </div>
    </div>
  )
};