'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { UploadCloud, Droplet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// This is a simplified dictionary type for the component
interface WatermarkToolDict {
    dropzone_text: string;
    watermark_text_label: string;
    font_size_label: string;
    opacity_label: string;
    apply_button: string;
    processing: string;
    success_message: string;
    download_button: string;
}

export const Watermarker = ({ dictionary }: { dictionary: WatermarkToolDict }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>("Confidential");
  const [opacity, setOpacity] = useState(0.5);
  const [fontSize, setFontSize] = useState(50);
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

  const handleApplyWatermark = async () => {
    if (!file) return alert('Please select a file.');
    setIsProcessing(true);
    setOutputPdfUrl(null);
    setError(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      
      const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, fontSize);

      for (const page of pages) {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 2 - textWidth / 2,
          y: height / 2,
          font: helveticaFont,
          size: fontSize,
          color: rgb(0, 0, 0),
          opacity: opacity,
          rotate: degrees(-45),
        });
      }

      const pdfBytes = await pdfDoc.save();
      
      // Using your robust method to create the Blob
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
    } catch (e) {
      console.error('Error adding watermark:', e);
      setError('An error occurred. The file might be corrupted or protected.');
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
                <Label htmlFor="watermarkText">{dictionary.watermark_text_label}</Label>
                <Input type="text" id="watermarkText" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} />
                </div>
                <div className="space-y-2">
                <Label htmlFor="fontSize">{dictionary.font_size_label} ({fontSize}pt)</Label>
                <Input type="range" id="fontSize" min="10" max="200" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} />
                </div>
                <div className="space-y-2">
                <Label htmlFor="opacity">{dictionary.opacity_label} ({Math.round(opacity * 100)}%)</Label>
                <Input type="range" id="opacity" min="0.1" max="1" step="0.05" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} />
                </div>
                <Button onClick={handleApplyWatermark} disabled={isProcessing} className="w-full text-lg py-6">
                <Droplet className="mr-2 h-5 w-5" />
                {isProcessing ? dictionary.processing : dictionary.apply_button}
                </Button>
            </div>
            )}

            {error && (
            <div className="mt-4 text-center p-3 bg-destructive text-destructive-foreground rounded-lg"><p>{error}</p></div>
            )}

            {outputPdfUrl && (
            <div className="mt-6 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
                <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">{dictionary.success_message}</h3>
                <Button asChild size="lg">
                <a href={outputPdfUrl} download={`watermarked-${file?.name}`}>
                    {dictionary.download_button}
                </a>
                </Button>
            </div>
            )}
        </CardContent>
    </Card>
  );
};