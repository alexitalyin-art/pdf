'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { UploadCloud, Unlock as UnlockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UnlockToolDict {
    dropzone_text: string;
    label_password: string;
    placeholder_password: string;
    button_unlock: string;
    processing: string;
    success_message: string;
    download_button: string;
    error_message: string;
}

export const Unlocker = ({ dictionary }: { dictionary: UnlockToolDict }) => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setOutputPdfUrl(null);
      setError(null);
      setPassword('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/pdf': ['.pdf'] },
  });

  const handleUnlock = async () => {
    if (!file || !password) {
      return alert('Please select a file and enter the password.');
    }
    setIsProcessing(true);
    setOutputPdfUrl(null);
    setError(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      // @ts-ignore - pdf-lib types are not perfectly aligned with all TypeScript versions
      const pdfDoc = await PDFDocument.load(existingPdfBytes, { password: password });
      
      const pdfBytes = await pdfDoc.save();
      
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      uint8Array.set(pdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
    } catch (e) {
      setError(dictionary.error_message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        {!file ? (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center transition-colors ${isDragActive ? 'border-primary bg-secondary' : 'border-border'}`}>
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
            <div className="space-y-2">
              <Label htmlFor="password">{dictionary.label_password}</Label>
              <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={dictionary.placeholder_password}
              />
            </div>
            <Button onClick={handleUnlock} disabled={isProcessing} className="w-full text-lg py-6">
              <UnlockIcon className="mr-2 h-5 w-5" />
              {isProcessing ? dictionary.processing : dictionary.button_unlock}
            </Button>
          </div>
        )}
        {error && (
          <div className="mt-4 text-center p-3 bg-destructive text-destructive-foreground rounded-lg">
              <p>{error}</p>
          </div>
        )}
        {outputPdfUrl && (
          <div className="mt-6 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">{dictionary.success_message}</h3>
            <Button asChild size="lg">
              <a href={outputPdfUrl} download={`unlocked-${file?.name || 'document'}.pdf`}>
                {dictionary.download_button}
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};