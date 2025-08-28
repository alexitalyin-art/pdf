'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { UploadCloud, Loader2, Droplet } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { PDFDocumentProxy } from 'pdfjs-dist';

const PDFCarouselViewer = dynamic(() => import('@/components/PDFCarouselViewer').then(mod => mod.PDFCarouselViewer), {
  ssr: false,
  loading: () => <div className="text-center py-20"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Loading Viewer...</p></div>,
});

export default function AddWatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(97);
  const [opacity, setOpacity] = useState(0.7);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setOutputPdfUrl(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { 'application/pdf': ['.pdf'] } });

  const handleAddWatermark = async () => {
    if (!file) return;
    setIsProcessing(true);
    setOutputPdfUrl(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, fontSize);
      const textHeight = helveticaFont.heightAtSize(fontSize);

      for (const page of pages) {
        const { width, height } = page.getSize();
        
        // --- DEBUGGING STEP ---
        // This simplified code only centers the text without rotation.
        page.drawText(watermarkText, {
          x: (width - textWidth) / 2,
          y: (height - textHeight) / 2,
          font: helveticaFont,
          size: fontSize,
          color: rgb(0, 0, 0),
          opacity: opacity,
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
    } catch (error) {
      console.error('Error adding watermark:', error);
      alert('An error occurred while adding the watermark.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Add Watermark</h1>
        <p className="text-md md:text-lg text-gray-600">Add a text watermark to your PDF with a live preview.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-5xl mx-auto">
        {!file ? (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center"><UploadCloud className="w-12 h-12 text-gray-400 mb-4" /><p className="text-lg text-gray-600">Drag & drop a PDF here</p></div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow lg:w-2/3">
              <PDFCarouselViewer 
                file={file} 
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onPdfLoad={(pdf: PDFDocumentProxy) => setTotalPages(pdf.numPages)}
                watermark={{ text: watermarkText, fontSize: fontSize, opacity: opacity }}
              />
            </div>
            <div className="lg:w-1f/3 flex flex-col justify-center">
              <div className="mb-4">
                <label htmlFor="watermarkText" className="block text-lg font-semibold mb-2">Watermark Text</label>
                <input type="text" id="watermarkText" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="mb-4">
                <label htmlFor="fontSize" className="block text-lg font-semibold mb-2">Font Size ({fontSize}pt)</label>
                <input type="range" id="fontSize" min="10" max="150" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-full" />
              </div>
              <div className="mb-6">
                <label htmlFor="opacity" className="block text-lg font-semibold mb-2">Opacity ({Math.round(opacity * 100)}%)</label>
                <input type="range" id="opacity" min="0.1" max="1" step="0.1" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} className="w-full" />
              </div>
              <button onClick={handleAddWatermark} disabled={isProcessing} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 w-full flex items-center justify-center gap-2">
                <Droplet />
                {isProcessing ? 'Processing...' : 'Add Watermark & Download'}
              </button>
            </div>
          </div>
        )}
        {outputPdfUrl && (
          <div className="mt-8 text-center p-6 bg-green-50 border-green-200 rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 mb-4">Your PDF is Ready!</h3>
            <a href={outputPdfUrl} download={`watermarked-${file?.name}`} className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700">Download Watermarked PDF</a>
          </div>
        )}
      </div>
    </div>
  );
}