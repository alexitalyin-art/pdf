'use client'; // This page needs to be a client component to manage the file state

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TextAdder } from '@/components/TextAdder';

export default function AddTextPage() {
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
            <CardTitle className="text-3xl md:text-4xl font-bold">Add Text to PDF</CardTitle>
            <CardDescription className="text-md md:text-lg text-muted-foreground">Add, edit, and place new text boxes on your document.</CardDescription>
        </CardHeader>
        <CardContent>
        {!file ? (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-primary bg-secondary' : 'border-border'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4"><UploadCloud className="w-12 h-12 text-muted-foreground" /><p className="text-lg text-muted-foreground">Drag & drop a PDF here</p></div>
          </div>
        ) : (
          <TextAdder file={file} onReset={handleReset} />
        )}
        </CardContent>
      </Card>
      
      <div className="prose dark:prose-invert max-w-4xl mx-auto mt-12">
        <h2>How to Add Text to a PDF</h2>
        <ol>
            <li>Upload your PDF document.</li>
            <li>Click the "Add Text Box" button. A new box will appear on the current page.</li>
            <li>Click inside the box to type your new text.</li>
            <li>Drag the box to move it or drag the corners to resize it.</li>
            <li>Click "Apply Text & Download" to save your changes.</li>
        </ol>
      </div>
    </div>
  );
}