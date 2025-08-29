'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { UploadCloud, Loader2, Save, Move, XCircle, ImageUp, RotateCcw, FileUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Rnd } from 'react-rnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { PDFDocumentProxy } from 'pdfjs-dist';

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

interface ImageAdderToolDict {
    dropzone_text: string;
    your_image: string;
    no_image_selected: string;
    select_an_image: string;
    change_image: string;
    place_on_page: string;
    reset: string;
    apply_and_download: string;
    processing: string;
    success_message: string;
    download_button: string;
}

export const ImageAdder = ({ dictionary }: { dictionary: ImageAdderToolDict }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [placedImages, setPlacedImages] = useState<PlacedImage[]>([]);
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const [pdfJsDoc, setPdfJsDoc] = useState<PDFDocumentProxy | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setOutputPdfUrl(null);
      setImageDataUrl(null);
      setPlacedImages([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, multiple: false, noClick: true, noKeyboard: true, accept: { 'application/pdf': ['.pdf'] } });

  const handleReset = () => {
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
    if (!file || placedImages.length === 0 || !pdfJsDoc) return alert('Please place at least one image.');
    setIsProcessing(true);
    setOutputPdfUrl(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      for (const img of placedImages) {
        const page = pdfDoc.getPage(img.page - 1);
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        const viewerPage = await pdfJsDoc.getPage(img.page);
        const viewerViewport = viewerPage.getViewport({ scale: viewerContainerRef.current!.clientWidth / viewerPage.getViewport({scale: 1.0}).width });
        const scale = pageWidth / viewerViewport.width;
        
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
  
  return (
    <Card className="w-full max-w-5xl mx-auto">
        <CardContent className="p-6">
        {!file ? (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center ${isDragActive ? 'border-primary bg-secondary' : 'border-border'}`} onClick={open}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4"><UploadCloud className="w-12 h-12 text-muted-foreground" /><p className="text-lg text-muted-foreground">{dictionary.dropzone_text}</p></div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow lg:w-2/3 relative" ref={viewerContainerRef}>
              <PDFCarouselViewer file={file} currentPage={currentPage} onPageChange={setCurrentPage} onPdfLoad={(pdf) => { setTotalPages(pdf.numPages); setPdfJsDoc(pdf); }} />
              {placedImages.filter(img => img.page === currentPage).map(img => (
                <Rnd key={img.id} size={{ width: img.width, height: img.height }} position={{ x: img.x, y: img.y }} onDragStop={(e, d) => updateImagePosition(img.id, d.x, d.y)} onResizeStop={(e, direction, ref, delta, position) => updateImageSize(img.id, parseFloat(ref.style.width), parseFloat(ref.style.height), position.x, position.y)} className="border-2 border-dashed border-blue-500 group">
                  <img src={img.imgDataUrl} alt="placed image" className="w-full h-full" />
                  <button onClick={() => deleteImage(img.id)} className="absolute -top-3 -right-3 z-10 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><XCircle size={20} /></button>
                </Rnd>
              ))}
            </div>
            <div className="lg:w-1/3 flex flex-col items-center">
              <div className="w-full text-center">
                <h3 className="text-lg font-semibold mb-2">{dictionary.your_image}</h3>
                <div className="p-2 bg-secondary border rounded-lg h-32 flex items-center justify-center">
                    {imageDataUrl ? <img src={imageDataUrl} alt="Uploaded" className="max-h-full" /> : <p className="text-muted-foreground">{dictionary.no_image_selected}</p>}
                </div>
                <input type="file" id="image-upload" accept="image/png, image/jpeg" onChange={handleImageUpload} className="hidden" />
                <label htmlFor="image-upload" className="cursor-pointer text-sm text-primary hover:underline mt-2 inline-block">
                    {imageDataUrl ? dictionary.change_image : dictionary.select_an_image}
                </label>
                <Button onClick={addImageToPage} disabled={!imageDataUrl} className="w-full flex items-center justify-center gap-2 mt-4"><Move /> {dictionary.place_on_page}</Button>
              </div>
              <div className="w-full mt-auto pt-4 space-y-3">
                <Button onClick={open} variant="outline" className="w-full flex items-center justify-center gap-2">
                    <FileUp /> Change PDF
                </Button>
                <Button onClick={handleReset} disabled={!imageDataUrl && placedImages.length === 0} variant="destructive" className="w-full flex items-center justify-center gap-2">
                    <RotateCcw /> {dictionary.reset}
                </Button>
                <Button onClick={handleApplyImages} disabled={isProcessing || placedImages.length === 0} className="w-full text-lg py-6">
                  <Save /> {isProcessing ? dictionary.processing : dictionary.apply_and_download}
                </Button>
              </div>
            </div>
          </div>
        )}
        {outputPdfUrl && (
          <div className="mt-6 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">{dictionary.success_message}</h3>
            <Button asChild size="lg"><a href={outputPdfUrl} download={`updated-${file?.name}`}>{dictionary.download_button}</a></Button>
          </div>
        )}
        </CardContent>
    </Card>
  );
};