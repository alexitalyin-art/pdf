'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, degrees } from 'pdf-lib';
import { UploadCloud, RotateCw, RotateCcw, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const PDFCarouselViewer = dynamic(() => 
  import('@/components/PDFCarouselViewer').then(mod => mod.PDFCarouselViewer), 
  {
    ssr: false,
    loading: () => (
      <div className="text-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
        <p className="mt-4">Loading Viewer...</p>
      </div>
    ),
  }
);

export default function RotatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] =useState(false);
  const [rotatedPdfUrl, setRotatedPdfUrl] = useState<string | null>(null);
  
  const [rotations, setRotations] = useState<{[key: number]: number}>({});
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/pdf': ['.pdf'] },
  });

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
      const blob = new Blob([pdfBytes.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setRotatedPdfUrl(url);
    } catch (error) {
      console.error('Error rotating PDF:', error);
      alert('An error occurred while rotating the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Rotate PDF Pages</h1>
        <p className="text-md md:text-lg text-gray-600">Review and rotate individual pages.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-5xl mx-auto">
        {!file ? (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center">
              <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg text-gray-600">Drag & drop a PDF here, or click to select a file</p>
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
                onPdfLoad={(pdf) => setTotalPages(pdf.numPages)}
              />
            </div>
            <div className="lg:w-1/3 flex flex-col items-center justify-center">
              <div className="mb-6 w-full text-center">
                <h3 className="text-lg font-semibold mb-3">Rotate Current Page</h3>
                <div className="flex justify-center gap-4">
                  <button onClick={() => handlePerPageRotate('ccw')} className="p-3 rounded-full bg-gray-200 hover:bg-gray-300"><RotateCcw /></button>
                  <button onClick={() => handlePerPageRotate('cw')} className="p-3 rounded-full bg-gray-200 hover:bg-gray-300"><RotateCw /></button>
                </div>
              </div>
              <button
                onClick={handleApplyChanges}
                disabled={isProcessing}
                className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-300 text-lg w-full"
              >
                {isProcessing ? 'Applying Changes...' : 'Apply Changes & Download'}
              </button>
              <button onClick={() => setFile(null)} className="mt-4 text-sm text-red-500 hover:underline">
                Choose a different file
              </button>
            </div>
          </div>
        )}

        {rotatedPdfUrl && (
          <div className="mt-8 text-center p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 mb-4">Rotation Complete!</h3>
            <a href={rotatedPdfUrl} download={`rotated-${file?.name}`} className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700">
              Download Rotated PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}