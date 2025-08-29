'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { UploadCloud, FileText, Combine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FlattenToolDict {
    dropzone_text: string;
    button_flatten: string;
    processing: string;
    success_message: string;
    download_button: string;
    error_message_no_fields: string;
    error_message_general: string;
}

export const Flattener = ({ dictionary }: { dictionary: FlattenToolDict }) => {
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
    if (!file) return;
    setIsProcessing(true);
    setOutputPdfUrl(null);
    setError(null);

    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const form = pdfDoc.getForm();
      if (form.getFields().length === 0) {
        setError(dictionary.error_message_no_fields);
        setIsProcessing(false);
        return;
      }

      form.flatten();
      const pdfBytes = await pdfDoc.save();
      
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      uint8Array.set(pdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);

    } catch (e) {
      setError(dictionary.error_message_general);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
            {!file ? (
            <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center ${isDragActive ? 'border-primary bg-secondary' : 'border-border'}`}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-4">
                <UploadCloud className="w-12 h-12 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">{dictionary.dropzone_text}</p>
                </div>
            </div>
            ) : (
            <div className="space-y-6">
                <div className="flex items-center justify-between p-3 bg-secondary rounded-md">
                    <p className="font-medium text-secondary-foreground truncate pr-4">{file.name}</p>
                    <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Change File</Button>
                </div>
                <Button onClick={handleFlatten} disabled={isProcessing} className="w-full text-lg py-6">
                    <Combine className="mr-2 h-5 w-5" />
                    {isProcessing ? dictionary.processing : dictionary.button_flatten}
                </Button>
            </div>
            )}
            {error && (
                <div className="mt-6 text-center p-4 bg-destructive text-destructive-foreground rounded-lg">
                    <p>{error}</p>
                </div>
            )}
            {outputPdfUrl && (
            <div className="mt-8 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
                <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">{dictionary.success_message}</h3>
                <Button asChild size="lg">
                <a href={outputPdfUrl} download={`flattened-${file?.name}`}>
                    {dictionary.download_button}
                </a>
                </Button>
            </div>
            )}
        </CardContent>
    </Card>
  );
};