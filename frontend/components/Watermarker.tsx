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
    'Helvetica': { libFont: StandardFonts.Helvetica, cssFont: 'Helvetica, sans-serif' },
    'Times New Roman': { libFont: StandardFonts.TimesRoman, cssFont: 'Times New Roman, serif' },
    'Courier': { libFont: StandardFonts.Courier, cssFont: 'Courier New, monospace' },
    'Helvetica-Bold': { libFont: StandardFonts.HelveticaBold, cssFont: 'Helvetica, sans-serif' },
};
type FontKey = keyof typeof fontMap;
type StyleKey = 'single' | 'tiled';

export const Watermarker = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(50);
  const [opacity, setOpacity] = useState(0.25);
  const [font, setFont] = useState<FontKey>('Helvetica');
  const [style, setStyle] = useState<StyleKey>('tiled');
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setOutputPdfUrl(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { 'application/pdf': ['.pdf'] } });

  const handleAddWatermark = async () => {
    if (!file) return;
    setIsProcessing(true);
    setOutputPdfUrl(null);
    setError(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const selectedFont = await pdfDoc.embedFont(fontMap[font].libFont);
      const pages = pdfDoc.getPages();
      
      for (const page of pages) {
        const { width, height } = page.getSize();
        if (style === 'tiled') {
            const textWidth = selectedFont.widthOfTextAtSize(watermarkText, fontSize);
            const gap = 150;
            for (let y = 0; y < height + gap; y += gap) {
                for (let x = 0; x < width + gap; x += gap) {
                    page.drawText(watermarkText, {
                        x: x, y: y,
                        font: selectedFont, size: fontSize,
                        color: rgb(0, 0, 0), opacity: opacity,
                        rotate: degrees(-45),
                    });
                }
            }
        } else {
            const largeFontSize = fontSize * 2;
            const textWidth = selectedFont.widthOfTextAtSize(watermarkText, largeFontSize);
            const textHeight = selectedFont.heightAtSize(largeFontSize);
            page.drawText(watermarkText, {
                x: width / 2 - textWidth / 2,
                y: height / 2 - textHeight / 2,
                font: selectedFont, size: largeFontSize,
                color: rgb(0, 0, 0), opacity: opacity,
                rotate: degrees(-45),
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
      console.error('Error adding watermark:', e);
      setError('An error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
        <CardContent className="p-6">
        {!file ? (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-primary bg-secondary' : 'border-border'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4"><UploadCloud className="w-12 h-12 text-muted-foreground" /><p className="text-lg text-muted-foreground">Drag & drop a PDF here</p></div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow lg:w-2/3">
              <PDFCarouselViewer 
                file={file} 
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onPdfLoad={(pdf: PDFDocumentProxy) => setTotalPages(pdf.numPages)}
                // --- THIS IS THE FIX ---
                // We now pass the fontFamily and style properties to the watermark object
                watermark={{ text: watermarkText, fontSize: style === 'single' ? fontSize * 2 : fontSize, opacity, fontFamily: fontMap[font].cssFont, style }}
              />
            </div>
            <div className="lg:w-1/3 flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <Label htmlFor="watermarkText">Watermark Text</Label>
                <Input type="text" id="watermarkText" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="style">Style</Label>
                  <Select value={style} onValueChange={(value: StyleKey) => setStyle(value)}>
                      <SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="tiled">Tiled</SelectItem>
                          <SelectItem value="single">Single</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="fontStyle">Font Style</Label>
                  <Select value={font} onValueChange={(value: FontKey) => setFont(value)}>
                      <SelectTrigger><SelectValue placeholder="Select font" /></SelectTrigger>
                      <SelectContent>
                          {Object.keys(fontMap).map(fontName => (
                              <SelectItem key={fontName} value={fontName}>{fontName}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size ({fontSize}pt)</Label>
                <Input type="range" id="fontSize" min="10" max="100" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opacity">Opacity ({Math.round(opacity * 100)}%)</Label>
                <Input type="range" id="opacity" min="0.1" max="1" step="0.05" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} />
              </div>
              <Button onClick={handleAddWatermark} disabled={isProcessing} className="w-full text-lg py-6">
                <Droplet className="mr-2 h-5 w-5" />
                {isProcessing ? 'Processing...' : 'Add Watermark & Download'}
              </Button>
            </div>
          </div>
        )}
        {error && <div className="mt-4 text-center p-3 bg-destructive text-destructive-foreground rounded-lg"><p>{error}</p></div>}
        {outputPdfUrl && (
          <div className="mt-6 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">Watermark Added!</h3>
            <Button asChild size="lg"><a href={outputPdfUrl} download={`watermarked-${file?.name}`}>Download Watermarked PDF</a></Button>
          </div>
        )}
        </CardContent>
    </Card>
  );
};