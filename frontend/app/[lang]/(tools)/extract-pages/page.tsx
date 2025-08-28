'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { UploadCloud, FileText, FileUp, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const PDFPreviewer = dynamic(() => import('@/components/PDFPreviewer').then(mod => mod.PDFPreviewer), {
  ssr: false,
  loading: () => <div className="text-center py-10"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Loading Previews...</p></div>,
});

export default function ExtractPagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setSelectedPages(new Set());
      setOutputPdfUrl(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/pdf': ['.pdf'] },
  });

  const handlePageSelect = (pageNumber: number) => {
    setSelectedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageNumber)) {
        newSet.delete(pageNumber);
      } else {
        newSet.add(pageNumber);
      }
      return newSet;
    });
  };

  const handleExtract = async () => {
    if (!file || selectedPages.size === 0) {
      alert('Please select at least one page to extract.');
      return;
    }

    setIsProcessing(true);
    setOutputPdfUrl(null);

    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      // Convert page numbers to 0-based indices and sort them
      const pageIndicesToKeep = Array.from(selectedPages).map(n => n - 1).sort((a, b) => a - b);

      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(pdfDoc, pageIndicesToKeep);
      copiedPages.forEach(page => newDoc.addPage(page));

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);

    } catch (error) {
      console.error('Error extracting pages:', error);
      alert('An error occurred while extracting pages from the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Extract PDF Pages</h1>
        <p className="text-md md:text-lg text-gray-600">Click on pages to select them for your new PDF.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
        {!file ? (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center">
              <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg text-gray-600">Drag & drop a PDF here, or click to select a file</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-md mb-6">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-gray-500 mr-3" />
                <span className="font-medium text-gray-800">{file.name}</span>
              </div>
              <button onClick={() => setFile(null)} className="text-sm text-red-500 hover:underline">Choose a different file</button>
            </div>

            <p className="text-center text-gray-600 mb-4">Click pages to select/deselect them. Selected pages (with a blue border) will be included in your new PDF.</p>

            <PDFPreviewer 
              file={file} 
              interactive={true} 
              onPageSelect={handlePageSelect}
              selectedPages={selectedPages}
            />
            
            <div className="flex justify-center mt-6">
              <button
                onClick={handleExtract}
                disabled={isProcessing || selectedPages.size === 0}
                className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-300 text-lg flex items-center gap-2"
              >
                <FileUp />
                {isProcessing ? 'Extracting...' : `Extract ${selectedPages.size} Page(s)`}
              </button>
            </div>
          </div>
        )}

        {outputPdfUrl && (
          <div className="mt-8 text-center p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 mb-4">Extraction Complete!</h3>
            <a href={outputPdfUrl} download={`extracted-${file?.name}`} className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors duration-300">
              Download Extracted PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}