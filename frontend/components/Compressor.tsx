'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CompressToolDict {
    dropzone_text: string;
    button_compress: string;
    processing: string;
    success_message: string;
    download_button: string;
}

export const Compressor = ({ dictionary }: { dictionary: CompressToolDict }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFileUrl, setOutputFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setOutputFileUrl(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, multiple: false,
    accept: { 'application/pdf': ['.pdf'] },
  });

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setOutputFileUrl(null);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://localhost:8000/compress/compress-pdf', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Server error');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setOutputFileUrl(url);
    } catch (e) {
      setError('An error occurred. The server might be down or the file may be corrupted.');
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
            <Button onClick={handleCompress} disabled={isProcessing} className="w-full text-lg py-6">
              {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isProcessing ? dictionary.processing : dictionary.button_compress}
            </Button>
          </div>
        )}
        {error && <div className="mt-4 text-center p-3 bg-destructive text-destructive-foreground rounded-lg"><p>{error}</p></div>}
        {outputFileUrl && (
          <div className="mt-6 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">{dictionary.success_message}</h3>
            <Button asChild size="lg">
              <a href={outputFileUrl} download={`compressed-${file?.name || 'document.pdf'}`}>
                {dictionary.download_button}
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};