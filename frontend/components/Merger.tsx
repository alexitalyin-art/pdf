'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { FileText, X, PlusCircle, UploadCloud } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface MergeToolDict {
    add_more_files: string;
    merge_button: string;
    merging: string;
    success_message: string;
    download_button: string;
    alert_at_least_two: string;
    alert_error_merging: string;
    dropzone_text: string;
}

export const Merger = ({ dictionary }: { dictionary: MergeToolDict }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    setMergedPdfUrl(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop, noClick: true, noKeyboard: true,
    accept: { 'application/pdf': ['.pdf'] },
  });

  const removeFile = (index: number) => setFiles(files.filter((_, i) => i !== index));

  const handleMerge = async () => {
    if (files.length < 2) return alert(dictionary.alert_at_least_two);
    setIsMerging(true);
    setMergedPdfUrl(null);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const fileBytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedPdfBytes = await mergedPdf.save();
      const arrayBuffer = new ArrayBuffer(mergedPdfBytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      uint8Array.set(mergedPdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert(dictionary.alert_error_merging);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
            <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            {files.length === 0 ? (
                <div onClick={open} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center ${isDragActive ? 'border-primary bg-secondary' : 'border-border'}`}>
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
                        <PlusCircle className="h-5 w-5" /> {dictionary.add_more_files}
                    </Button>
                    <Button onClick={handleMerge} disabled={isMerging} className="w-full text-lg py-6">
                        {isMerging ? dictionary.merging : dictionary.merge_button}
                    </Button>
                </div>
            )}
            </div>
            {mergedPdfUrl && (
            <div className="mt-6 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
                <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">{dictionary.success_message}</h3>
                <Button asChild size="lg">
                    <a href={mergedPdfUrl} download={`merged-${Date.now()}.pdf`}>{dictionary.download_button}</a>
                </Button>
            </div>
            )}
        </CardContent>
    </Card>
  );
}