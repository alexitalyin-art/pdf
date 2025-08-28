'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { FileText, UploadCloud, Combine } from 'lucide-react';

export default function FlattenPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setOutputPdfUrl(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/pdf': ['.pdf'] },
  });

  const handleFlatten = async () => {
    if (!file) {
      alert('Please select a file.');
      return;
    }

    setIsProcessing(true);
    setOutputPdfUrl(null);
    setError(null);

    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      const form = pdfDoc.getForm();
      
      // This is the core logic that flattens the PDF
      form.flatten();

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);

    } catch (e) {
      console.error('Error flattening PDF:', e);
      setError('This PDF does not contain any interactive fields to flatten, or it is corrupted.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Flatten PDF</h1>
        <p className="text-md md:text-lg text-gray-600">Make PDF form fields and annotations permanent.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
        {!file ? (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center">
              <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg text-gray-600">Drag & drop a PDF with form fields here</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-md mb-6">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-gray-500 mr-3" />
                <span className="font-medium text-gray-800">{file.name}</span>
              </div>
              <button onClick={() => setFile(null)} className="text-sm text-red-500 hover:underline">Remove</button>
            </div>
            
            <div className="flex justify-center mt-6">
              <button
                onClick={handleFlatten}
                disabled={isProcessing}
                className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-300 text-lg flex items-center gap-2"
              >
                <Combine />
                {isProcessing ? 'Processing...' : 'Flatten PDF'}
              </button>
            </div>
          </div>
        )}

        {error && (
            <div className="mt-6 text-center p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                <p>{error}</p>
            </div>
        )}

        {outputPdfUrl && (
          <div className="mt-8 text-center p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 mb-4">PDF Flattened!</h3>
            <a
              href={outputPdfUrl}
              download={`flattened-${file?.name || 'document'}.pdf`}
              className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors duration-300"
            >
              Download Flattened PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}