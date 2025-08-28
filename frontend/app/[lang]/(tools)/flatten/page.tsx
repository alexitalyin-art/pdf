'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { FileText, UploadCloud, Combine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
      if (form.getFields().length === 0) {
        setError('This PDF does not contain any interactive fields to flatten.');
        setIsProcessing(false);
        return;
      }

      form.flatten();

      const pdfBytes = await pdfDoc.save();
      
      // --- THIS IS THE DEFINITIVE FIX ---
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      uint8Array.set(pdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      // ------------------------------------

      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);

    } catch (e) {
      console.error('Error flattening PDF:', e);
      setError('An error occurred while flattening the PDF. It may be corrupted.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl font-bold">Flatten PDF</CardTitle>
            <CardDescription className="text-md md:text-lg">Make PDF form fields and annotations permanent.</CardDescription>
        </CardHeader>
        <CardContent>
            {!file ? (
            <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center transition-colors ${isDragActive ? 'border-primary bg-secondary' : 'border-border'}`}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-4">
                <UploadCloud className="w-12 h-12 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">Drag & drop a PDF with form fields here</p>
                </div>
            </div>
            ) : (
            <div>
                <div className="flex items-center justify-between p-3 bg-secondary rounded-md mb-6">
                    <p className="font-medium text-secondary-foreground truncate pr-4">{file.name}</p>
                    <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Change File</Button>
                </div>
                
                <div className="flex justify-center mt-6">
                <Button
                    onClick={handleFlatten}
                    disabled={isProcessing}
                    className="w-full text-lg py-6"
                >
                    <Combine className="mr-2 h-5 w-5" />
                    {isProcessing ? 'Processing...' : 'Flatten PDF'}
                </Button>
                </div>
            </div>
            )}

            {error && (
                <div className="mt-6 text-center p-4 bg-destructive text-destructive-foreground rounded-lg">
                    <p>{error}</p>
                </div>
            )}

            {outputPdfUrl && (
            <div className="mt-8 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
                <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">PDF Flattened!</h3>
                <Button asChild size="lg">
                <a
                    href={outputPdfUrl}
                    download={`flattened-${file?.name || 'document'}.pdf`}
                >
                    Download Flattened PDF
                </a>
                </Button>
            </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}