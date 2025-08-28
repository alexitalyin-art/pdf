'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { UploadCloud, Loader2, Save, Move, XCircle, Type, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Rnd } from 'react-rnd';

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

export default function AddTextPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [placedTexts, setPlacedTexts] = useState<PlacedText[]>([]);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setOutputPdfUrl(null);
      setPlacedTexts([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { 'application/pdf': ['.pdf'] } });

  const addTextToPage = () => {
    const newText: PlacedText = {
      id: Date.now(),
      page: currentPage,
      x: 50,
      y: 50,
      width: 200,
      height: 50,
      text: 'Your text here',
      fontSize: 16,
    };
    setPlacedTexts(prev => [...prev, newText]);
  };

  const updateTextValue = (id: number, newText: string) => {
    setPlacedTexts(prev => prev.map(t => t.id === id ? { ...t, text: newText } : t));
  };
  
  const deleteText = (idToDelete: number) => setPlacedTexts(prev => prev.filter(t => t.id !== idToDelete));
  const updateTextPosition = (id: number, x: number, y: number) => setPlacedTexts(prev => prev.map(t => t.id === id ? { ...t, x, y } : t));
  const updateTextSize = (id: number, width: number, height: number, x: number, y: number) => setPlacedTexts(prev => prev.map(t => t.id === id ? { ...t, width, height, x, y } : t));

  const handleApplyText = async () => {
    if (!file || placedTexts.length === 0) return alert('Please add at least one text box.');
    setIsProcessing(true);
    setOutputPdfUrl(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (const item of placedTexts) {
        const page = pdfDoc.getPage(item.page - 1);
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        const pagePreviewInViewer = await (await pdfjsLib.getDocument({data: existingPdfBytes}).promise).getPage(item.page);
        const scale = pageWidth / pagePreviewInViewer.getViewport({scale:1.0}).width;
        
        const scaledFontSize = item.fontSize * scale;
        
        // --- THIS IS THE DEFINITIVE FIX ---
        // The correct function is `heightAtSize`. This calculates the full height of the text.
        const textHeight = helveticaFont.heightAtSize(scaledFontSize);
        const y_coordinate = pageHeight - (item.y * scale) - textHeight;

        page.drawText(item.text, {
          x: item.x * scale,
          y: y_coordinate,
          font: helveticaFont,
          size: scaledFontSize,
          color: rgb(0, 0, 0),
          lineHeight: (item.fontSize + 2) * scale,
          maxWidth: item.width * scale,
        });
      }

      const pdfBytes = await pdfDoc.save();
      
      // The robust, multi-line fix for saving the file
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      uint8Array.set(pdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
    } catch (error) {
      console.error('Error applying text:', error);
      alert('An error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Add Text to PDF</h1>
        <p className="text-md md:text-lg text-gray-600">Add, edit, and place new text boxes on your document.</p>
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
              {placedTexts.filter(t => t.page === currentPage).map(t => (
                <Rnd key={t.id} size={{ width: t.width, height: t.height }} position={{ x: t.x, y: t.y }} onDragStop={(e, d) => updateTextPosition(t.id, d.x, d.y)} onResizeStop={(e, direction, ref, delta, position) => updateTextSize(t.id, parseFloat(ref.style.width), parseFloat(ref.style.height), position.x, position.y)} className="border-2 border-dashed border-blue-500 group flex items-center justify-center">
                  <textarea value={t.text} onChange={(e) => updateTextValue(t.id, e.target.value)} className="w-full h-full bg-transparent resize-none text-center outline-none p-1" style={{ fontSize: t.fontSize }} />
                  <button onClick={() => deleteText(t.id)} className="absolute -top-3 -right-3 z-10 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><XCircle size={20} /></button>
                </Rnd>
              ))}
            </div>
            <div className="lg:w-1/3 flex flex-col items-center">
              <div className="w-full text-center">
                <button onClick={addTextToPage} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 w-full flex items-center justify-center gap-2 mt-4"><Type /> Add Text Box</button>
              </div>
              <div className="w-full mt-auto pt-4">
                <button onClick={() => setPlacedTexts([])} disabled={placedTexts.length === 0} className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 w-full flex items-center justify-center gap-2 mb-3">
                    <RotateCcw /> Reset
                </button>
                <button onClick={handleApplyText} disabled={isProcessing || placedTexts.length === 0} className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 w-full flex items-center justify-center gap-2">
                  <Save /> Apply Text & Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {outputPdfUrl && (
        <div className="mt-8 text-center p-6 bg-green-50 border-green-200 rounded-lg">
          <h3 className="text-2xl font-semibold text-green-800 mb-4">Your Updated PDF is Ready!</h3>
          <a href={outputPdfUrl} download={`text-added-${file?.name}`} className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700">Download PDF</a>
        </div>
      )}
    </div>
  );
}