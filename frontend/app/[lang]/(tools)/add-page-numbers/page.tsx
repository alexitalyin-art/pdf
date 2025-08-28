'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { UploadCloud, Loader2, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

const PDFCarouselViewer = dynamic(() => import('@/components/PDFCarouselViewer').then(mod => mod.PDFCarouselViewer), {
  ssr: false,
  loading: () => <div className="text-center py-20"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Loading Viewer...</p></div>,
});

type Position = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export default function AddPageNumbersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);

  // Viewer State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  // Options State
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
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const pageNumberText = `${i + startNumber}`;
        const textWidth = helveticaFont.widthOfTextAtSize(pageNumberText, fontSize);
        const margin = 50;
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
      const blob = new Blob([pdfBytes.buffer], { type: 'application/pdf' });
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
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Add Page Numbers</h1>
        <p className="text-md md:text-lg text-gray-600">Add and preview page numbers on your PDF.</p>
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
                onPdfLoad={(pdf) => setTotalPages(pdf.numPages)}
                pageNumberOptions={{ fontSize, position, startNumber }}
              />
            </div>
            <div className="lg:w-1/3 flex flex-col justify-center">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="position" className="block text-lg font-semibold mb-2">Position</label>
                  <select id="position" value={position} onChange={e => setPosition(e.target.value as Position)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    {positionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="startNumber" className="block text-lg font-semibold mb-2">Start at page</label>
                  <input type="number" id="startNumber" value={startNumber} onChange={e => setStartNumber(parseInt(e.target.value, 10))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" min="1" />
                </div>
                <div>
                  <label htmlFor="fontSize" className="block text-lg font-semibold mb-2">Font Size ({fontSize}pt)</label>
                  <input type="range" id="fontSize" min="8" max="48" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value, 10))} className="w-full" />
                </div>
              </div>
              <button onClick={handleAddNumbers} disabled={isProcessing} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 w-full flex items-center justify-center gap-2 mt-6">
                <Type />
                {isProcessing ? 'Processing...' : 'Add Numbers & Download'}
              </button>
            </div>
          </div>
        )}
        {outputPdfUrl && (
          <div className="mt-8 text-center p-6 bg-green-50 border-green-200 rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 mb-4">Your PDF is Ready!</h3>
            <a href={outputPdfUrl} download={`numbered-${file?.name}`} className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700">Download Numbered PDF</a>
          </div>
        )}
      </div>
    </div>
  );
}