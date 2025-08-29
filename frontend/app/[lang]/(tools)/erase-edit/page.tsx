'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import dynamic from 'next/dynamic';

// --- THIS IS THE FIX ---
// The component is now imported directly, without curly braces {}
const EraseEditEditor = dynamic(() => 
  import('@/components/EraseEditEditor'), 
  {
    ssr: false,
    loading: () => <div className="text-center py-10"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Loading Editor...</p></div>,
  }
);

export default function EraseEditTextPage() {
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
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl font-bold">Erase & Edit Text</CardTitle>
            <CardDescription className="text-md md:text-lg text-muted-foreground">Cover up old text and add new, styled text on top.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {!file ? (
            <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-primary bg-secondary' : 'border-border'}`}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-4">
                <UploadCloud className="w-12 h-12 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">Drag & drop a PDF here</p>
              </div>
            </div>
          ) : (
            <EraseEditEditor file={file} onBack={handleReset} />
          )}
        </CardContent>
      </Card>
      
      <div className="prose dark:prose-invert max-w-4xl mx-auto mt-12">
        <h2>How to Erase and Edit Text in a PDF</h2>
        <ol>
            <li>Upload your PDF file.</li>
            <li>Click "Select Area to Erase/Edit". Your cursor will change.</li>
            <li>Draw a box over the text you want to replace. A white box will cover the area, and a new text box will appear on top.</li>
            <li>Click the new text box to edit the text, font size, and color.</li>
            <li>Click "Apply Edits & Download" to get your new file.</li>
        </ol>
      </div>
    </div>
  );
}