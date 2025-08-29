'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormFiller } from '@/components/FormFiller'; // We will create this
import type { Locale } from '@/i18n-config';
// We cannot get the dictionary on this page because it's a client component
// For a full multi-language implementation, we would pass the dictionary down from a server component

export default function FillFormPage() {
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

  // A simplified dictionary for the client component
  const dictionary = {
      dropzone_text: "Drag & drop a fillable PDF here",
      analyzing_pdf: "Analyzing PDF...",
      button_save: "Save Filled PDF",
      processing: "Saving...",
      success_message: "Your Filled PDF is Ready!",
      download_button: "Download Filled PDF"
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl md:text-4xl font-bold">Fill PDF Form</CardTitle>
                <CardDescription className="text-md md:text-lg text-muted-foreground">Fill out PDF forms directly in your browser.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
            {!file ? (
            <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-primary bg-secondary' : 'border-border'}`}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-4"><UploadCloud className="w-12 h-12 text-muted-foreground" /><p className="text-lg text-muted-foreground">{dictionary.dropzone_text}</p></div>
            </div>
            ) : (
            <FormFiller file={file} onReset={handleReset} dictionary={dictionary} />
            )}
            </CardContent>
        </Card>
      
      <div className="prose dark:prose-invert max-w-4xl mx-auto mt-12">
        <h2>How to Fill Out a PDF Form</h2>
        <ol>
            <li>Upload your fillable PDF file.</li>
            <li>The tool will automatically detect and display the interactive form fields.</li>
            <li>Click on any field and start typing to fill out the form.</li>
            <li>Once you've completed the form, click 'Save Filled PDF' to get your new file.</li>
        </ol>
      </div>
    </div>
  );
}