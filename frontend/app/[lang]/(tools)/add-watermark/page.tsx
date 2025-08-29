'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Watermarker } from '@/components/Watermarker';

export default function AddWatermarkPage() {
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
      <Card className="max-w-5xl mx-auto">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl font-bold">Add Watermark</CardTitle>
            <CardDescription className="text-md md:text-lg text-muted-foreground">Add a text watermark with a live preview.</CardDescription>
        </CardHeader>
        <CardContent>
        {!file ? (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-primary bg-secondary' : 'border-border'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4"><UploadCloud className="w-12 h-12 text-muted-foreground" /><p className="text-lg text-muted-foreground">Drag & drop a PDF here</p></div>
          </div>
        ) : (
          <Watermarker file={file} onReset={handleReset} />
        )}
        </CardContent>
      </Card>
      
      <div className="prose dark:prose-invert max-w-4xl mx-auto mt-12">
        <h2>How to Add a Watermark to a PDF</h2>
        <ol>
            <li>Drag and drop your PDF file into the upload area above.</li>
            <li>Enter the text you want to use as your watermark.</li>
            <li>Adjust the font size, style, and opacity using the controls to see a live preview.</li>
            <li>Click the "Add Watermark & Download" button.</li>
            <li>Your new, watermarked PDF will be generated for you to download instantly.</li>
        </ol>
      </div>
    </div>
  );
}