'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { UploadCloud, Save, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface MetadataState {
  title: string;
  author: string;
  subject: string;
  keywords: string;
}

interface MetadataToolDict {
    dropzone_text: string;
    title_label: string;
    author_label: string;
    subject_label: string;
    keywords_label: string;
    keywords_placeholder: string;
    button_save: string;
    processing: string;
    success_message: string;
    download_button: string;
}

export const MetadataEditor = ({ dictionary }: { dictionary: MetadataToolDict }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MetadataState>({ title: '', author: '', subject: '', keywords: '' });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setOutputPdfUrl(null);
      setMetadata({ title: '', author: '', subject: '', keywords: '' });
    }
  }, []);

  useEffect(() => {
    if (!file) return;
    const readMetadata = async () => {
      try {
        const existingPdfBytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes, { updateMetadata: false });
        setMetadata({
          title: pdfDoc.getTitle() || '',
          author: pdfDoc.getAuthor() || '',
          subject: pdfDoc.getSubject() || '',
          keywords: (pdfDoc.getKeywords() || '').replace(/;/g, ','),
        });
      } catch (error) {
        alert("Could not read metadata from this PDF.");
      }
    };
    readMetadata();
  }, [file]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { 'application/pdf': ['.pdf'] } });

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMetadata(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!file) return;
    setIsProcessing(true);
    setOutputPdfUrl(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      pdfDoc.setTitle(metadata.title);
      pdfDoc.setAuthor(metadata.author);
      pdfDoc.setSubject(metadata.subject);
      pdfDoc.setKeywords(metadata.keywords.split(',').map(k => k.trim()));
      pdfDoc.setModificationDate(new Date());
      const pdfBytes = await pdfDoc.save();
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      uint8Array.set(pdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
    } catch (error) {
      alert('An error occurred while updating metadata.');
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
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">{dictionary.title_label}</Label>
                        <Input id="title" name="title" value={metadata.title} onChange={handleMetadataChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="author">{dictionary.author_label}</Label>
                        <Input id="author" name="author" value={metadata.author} onChange={handleMetadataChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">{dictionary.subject_label}</Label>
                        <Textarea id="subject" name="subject" value={metadata.subject} onChange={handleMetadataChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="keywords">{dictionary.keywords_label}</Label>
                        <Input id="keywords" name="keywords" value={metadata.keywords} onChange={handleMetadataChange} placeholder={dictionary.keywords_placeholder} />
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isProcessing} className="w-full text-lg py-6">
                    <Save className="mr-2 h-5 w-5" />
                    {isProcessing ? dictionary.processing : dictionary.button_save}
                </Button>
            </div>
            )}
            {outputPdfUrl && (
            <div className="mt-6 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
                <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">{dictionary.success_message}</h3>
                <Button asChild size="lg">
                <a href={outputPdfUrl} download={`metadata-updated-${file?.name}`}>{dictionary.download_button}</a>
                </Button>
            </div>
            )}
        </CardContent>
    </Card>
  );
};