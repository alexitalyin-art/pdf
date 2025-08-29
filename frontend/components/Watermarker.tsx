'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { UploadCloud, Loader2, Droplet } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PDFCarouselViewer = dynamic(() => import('@/components/PDFCarouselViewer').then(mod => mod.PDFCarouselViewer), {
  ssr: false,
  loading: () => <div className="text-center py-20"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Loading Viewer...</p></div>,
});

const fontMap = {
    'Helvetica-Bold': { libFont: StandardFonts.HelveticaBold, cssFont: 'Helvetica, sans-serif' },
    'Helvetica': { libFont: StandardFonts.Helvetica, cssFont: 'Helvetica, sans-serif' },
    'Times New Roman': { libFont: StandardFonts.TimesRoman, cssFont: 'Times New Roman, serif' },
    'Courier': { libFont: StandardFonts.Courier, cssFont: 'Courier New, monospace' },
};
type FontKey = keyof typeof fontMap;
type StyleKey = 'single' | 'tiled';

interface WatermarkToolDict {
    dropzone_text: string;
    watermark_text_label: string;
    style_label: string;
    style_tiled: string;
    style_single: string;
    font_style_label: string;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(50);
  const [opacity, setOpacity] = useState(0.25);
  const [font, setFont] = useState<FontKey>('Helvetica-Bold');
  const [style, setStyle] = useState<StyleKey>('tiled');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setOutputPdfUrl(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { 'application/pdf': ['.pdf'] } });

  const handleAddWatermark = async () => {
    if (!file) return;
    setIsProcessing(true);
    setOutputPdfUrl(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const selectedFont = await pdfDoc.embedFont(fontMap[font].libFont);
      const pages = pdfDoc.getPages();
      
      for (const page of pages) {
        const { width, height } = page.getSize();
        if (style === 'tiled') {
            const gap = 200;
            for (let y = 0; y < height + gap; y += gap) {
                for (let x = 0; x < width + gap; x += gap) {
                    page.drawText(watermarkText, {
                        x, y, font: selectedFont, size: fontSize,
                        color: rgb(0, 0, 0), opacity: opacity, rotate: degrees(45),
                    });
                }
            }
        } else {
            const largeFontSize = fontSize * 2.5;
            const textWidth = selectedFont.widthOfTextAtSize(watermarkText, largeFontSize);
            const textHeight = selectedFont.heightAtSize(largeFontSize);
            page.drawText(watermarkText, {
                x: width / 2 - textWidth / 2,
                y: height / 2 - textHeight / 2,
                font: selectedFont, size: largeFontSize,
                color: rgb(0, 0, 0), opacity: opacity, rotate: degrees(-45),
            });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      uint8Array.set(pdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
    } catch (e) {
      alert('An error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
        <CardContent className="p-6">
        {!file ? (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center ${isDragActive ? 'border-primary bg-secondary' : 'border-border'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4"><UploadCloud className="w-12 h-12 text-muted-foreground" /><p className="text-lg text-muted-foreground">{dictionary.dropzone_text}</p></div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow lg:w-2/3">
              <PDFCarouselViewer 
                file={file} 
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onPdfLoad={(pdf: PDFDocumentProxy) => setTotalPages(pdf.numPages)}
                watermark={{ text: watermarkText, fontSize: style === 'single' ? fontSize * 2.5 : fontSize, opacity, fontFamily: fontMap[font].cssFont, style }}
              />
            </div>
            <div className="lg:w-1/3 flex flex-col space-y-4">
              <div className="space-y-2">
                <Label htmlFor="watermarkText">{dictionary.watermark_text_label}</Label>
                <Input type="text" id="watermarkText" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="style">{dictionary.style_label}</Label>
                  <Select value={style} onValueChange={(value: StyleKey) => setStyle(value)}>
                      <SelectTrigger className="bg-background border"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-background border">
                          <SelectItem value="tiled">{dictionary.style_tiled}</SelectItem>
                          <SelectItem value="single">{dictionary.style_single}</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="fontStyle">{dictionary.font_style_label}</Label>
                  <Select value={font} onValueChange={(value: FontKey) => setFont(value)}>
                      <SelectTrigger className="bg-background border"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-background border">
                          {Object.keys(fontMap).map(fontName => (<SelectItem key={fontName} value={fontName}>{fontName}</SelectItem>))}
                      </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fontSize">{dictionary.font_size_label} ({fontSize}pt)</Label>
                <Input type="range" id="fontSize" min="10" max="100" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opacity">{dictionary.opacity_label} ({Math.round(opacity * 100)}%)</Label>
                <Input type="range" id="opacity" min="0.1" max="1" step="0.05" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} />
              </div>
              <Button onClick={handleAddWatermark} disabled={isProcessing} className="w-full text-lg py-6">
                <Droplet className="mr-2 h-5 w-5" />
                {isProcessing ? dictionary.processing : dictionary.apply_button}
              </Button>
            </div>
          </div>
        )}
        {outputPdfUrl && (
          <div className="mt-6 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">{dictionary.success_message}</h3>
            <Button asChild size="lg"><a href={outputPdfUrl} download={`watermarked-${file?.name}`}>{dictionary.download_button}</a></Button>
          </div>
        )}
        </CardContent>
    </Card>
  );
};