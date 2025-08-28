'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const FormEditor = dynamic(() => 
  import('@/components/FormEditor').then(mod => mod.FormEditor), 
  {
    ssr: false,
    loading: () => <div className="text-center py-10"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Loading Editor...</p></div>,
  }
);

export default function FillFormPage() {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  // NEW: Function to reset the file state
  const handleReset = () => {
    setFile(null);
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { 'application/pdf': ['.pdf'] } });

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Fill PDF Form</h1>
        <p className="text-md md:text-lg text-gray-600">Fill out PDF forms directly in your browser.</p>
      </div>
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
        {!file ? (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center"><UploadCloud className="w-12 h-12 text-gray-400 mb-4" /><p className="text-lg text-gray-600">Drag & drop a fillable PDF here</p></div>
          </div>
        ) : (
          // NEW: Passing the onReset function as a prop
          <FormEditor file={file} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}