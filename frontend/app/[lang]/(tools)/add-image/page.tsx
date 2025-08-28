'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';

const ImageAdder = dynamic(() => 
  import('@/components/ImageAdder').then(mod => mod.ImageAdder), 
  {
    ssr: false,
    loading: () => <div className="text-center py-10"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Loading Editor...</p></div>,
  }
);

export default function AddImagePage() {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const handleReset = () => {
    setFile(null);
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { 'application/pdf': ['.pdf'] } });

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Add Image to PDF</h1>
        <p className="text-md md:text-lg text-muted-foreground">Upload and place images on your document.</p>
      </div>
      <Card className="w-full max-w-5xl mx-auto">
        <CardContent className="p-6">
          {!file ? (
            <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center transition-colors ${isDragActive ? 'border-primary bg-secondary' : 'border-border'}`}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-4">
                <UploadCloud className="w-12 h-12 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">Drag & drop a PDF here, or click to select</p>
              </div>
            </div>
          ) : (
            <ImageAdder file={file} onReset={handleReset} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}