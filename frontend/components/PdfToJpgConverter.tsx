'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, FileText, X, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ConvertToolDict {
    dropzone_text: string;
    button_convert: string;
    processing: string;
    success_message: string;
    download_button: string;
}

export const JpgToPdfConverter = ({ dictionary }: { dictionary: ConvertToolDict }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFileUrl, setOutputFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    setOutputFileUrl(null);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop, multiple: true, noClick: true, noKeyboard: true,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
  });
  
  const removeFile = (index: number) => setFiles(files.filter((_, i) => i !== index));

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setOutputFileUrl(null);
    setError(null);
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });
    try {
      const response = await fetch('http://localhost:8000/convert/jpg-to-pdf', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Server error');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setOutputFileUrl(url);
    } catch (e) {
      setError('An error occurred during conversion.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        {files.length === 0 ? (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center ${isDragActive ? 'border-primary bg-secondary' : 'border-border'}`} onClick={open}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
              <UploadCloud className="w-12 h-12 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">{dictionary.dropzone_text}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
                {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-md">
                    <div className="flex items-center gap-2"><FileText className="h-5 w-5" /><span className="font-medium truncate">{file.name}</span></div>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(index)}><X className="h-4 w-4" /></Button>
                </div>
                ))}
            </div>
            <Button variant="outline" onClick={open} className="w-full flex items-center gap-2">
                <PlusCircle className="h-5 w-5" /> Add more images
            </Button>
            <Button onClick={handleConvert} disabled={isProcessing} className="w-full text-lg py-6">
              {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isProcessing ? dictionary.processing : dictionary.button_convert}
            </Button>
          </div>
        )}
        {error && <div className="mt-4 text-center p-3 bg-destructive text-destructive-foreground rounded-lg"><p>{error}</p></div>}
        {outputFileUrl && (
          <div className="mt-6 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">{dictionary.success_message}</h3>
            <Button asChild size="lg">
              <a href={outputFileUrl} download={`converted.pdf`}>
                {dictionary.download_button}
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};