'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { UploadCloud, Loader2, Save, Move, XCircle, ImageUp, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Rnd } from 'react-rnd';

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

export default function AddImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [placedImages, setPlacedImages] = useState<PlacedImage[]>([]);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setOutputPdfUrl(null);
      setImageDataUrl(null);
      setPlacedImages([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { 'application/pdf': ['.pdf'] } });
  
  const handleReset = () => {
    setImageDataUrl(null);
    setPlacedImages([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageDataUrl(reader.result as string);
      };
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
    if (!file || placedImages.length === 0) return alert('Please place at least one image on the document.');
    setIsProcessing(true);
    setOutputPdfUrl(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const viewerWidth = viewerContainerRef.current?.clientWidth || 600;

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
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
    } catch (error) {
      console.error('Error applying images:', error);
      alert('An error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Add Image to PDF</h1>
        <p className="text-md md:text-lg text-gray-600">Upload and place images on your document.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-5xl mx-auto">
        {!file ? (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center"><UploadCloud className="w-12 h-12 text-gray-400 mb-4" /><p className="text-lg text-gray-600">Drag & drop a PDF here</p></div>
          </div>
        ) : (
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
                <div className="p-2 bg-gray-100 border rounded-lg h-32 flex items-center justify-center">
                    {imageDataUrl ? <img src={imageDataUrl} alt="Uploaded image" className="max-h-full" /> : <p className="text-gray-500">No image selected</p>}
                </div>
                <input type="file" id="image-upload" accept="image/png, image/jpeg" onChange={handleImageUpload} className="hidden" />
                <label htmlFor="image-upload" className="cursor-pointer text-sm text-blue-500 hover:underline mt-2 inline-block">
                    {imageDataUrl ? 'Change Image' : 'Select an Image'}
                </label>
                <button onClick={addImageToPage} disabled={!imageDataUrl} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 w-full flex items-center justify-center gap-2 mt-4 disabled:bg-gray-400">
                    <Move /> Place on Page
                </button>
              </div>
              <div className="w-full mt-auto pt-4">
                <button onClick={handleReset} disabled={!imageDataUrl && placedImages.length === 0} className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 w-full flex items-center justify-center gap-2 mb-3">
                    <RotateCcw /> Reset
                </button>
                <button onClick={handleApplyImages} disabled={isProcessing || placedImages.length === 0} className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 w-full flex items-center justify-center gap-2">
                  <Save /> Apply Images & Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {outputPdfUrl && (
        <div className="mt-8 text-center p-6 bg-green-50 border-green-200 rounded-lg">
          <h3 className="text-2xl font-semibold text-green-800 mb-4">Your PDF is Ready!</h3>
          <a href={outputPdfUrl} download={`updated-${file?.name}`} className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700">Download Updated PDF</a>
        </div>
      )}
    </div>
  );
}