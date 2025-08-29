'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { UploadCloud, FileText, Crop as CropIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface CropToolDict {
    dropzone_text: string;
    button_crop: string;
    processing: string;
    success_message: string;
    download_button: string;
}

export const Cropper = ({ dictionary }: { dictionary: CropToolDict }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [originalPdfDims, setOriginalPdfDims] = useState<{width: number, height: number}>({width: 0, height: 0});
  const [imgSize, setImgSize] = useState<{width: number, height: number}>({width:0, height:0});

  useEffect(() => {
    if (!file) return;
    const generatePreview = async () => {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const page = await pdf.getPage(1);
      const originalViewport = page.getViewport({ scale: 1.0 });
      setOriginalPdfDims({ width: originalViewport.width, height: originalViewport.height });
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
      setImgSrc(canvas.toDataURL());
    };
    generatePreview();
  }, [file]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setImgSize({ width, height });
    const initialCrop = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height);
    setCrop(initialCrop);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setOutputPdfUrl(null);
      setCrop(undefined);
      setImgSrc('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { 'application/pdf': ['.pdf'] } });

  const handleCrop = async () => {
    if (!file || !crop || !crop.width || !crop.height) return alert('Please draw a crop area.');
    setIsProcessing(true);
    setOutputPdfUrl(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      const scaleX = originalPdfDims.width / imgSize.width;
      const scaleY = originalPdfDims.height / imgSize.height;
      const cropX = crop.x * scaleX;
      const cropY = originalPdfDims.height - (crop.y * scaleY) - (crop.height * scaleY);
      const cropWidth = crop.width * scaleX;
      const cropHeight = crop.height * scaleY;

      pages.forEach(page => {
        page.setMediaBox(cropX, cropY, cropWidth, cropHeight);
        page.setCropBox(cropX, cropY, cropWidth, cropHeight);
      });

      const pdfBytes = await pdfDoc.save();
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      uint8Array.set(pdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
    } catch (error) {
      alert('An error occurred while cropping the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
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
          <div>
            <div className="flex justify-center items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              {!imgSrc ? (
                <div className="text-center py-10"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Generating Preview...</p></div>
              ) : (
                <ReactCrop crop={crop} onChange={(c, pc) => setCrop(c)}>
                  <img src={imgSrc} alt="PDF Preview" onLoad={onImageLoad} />
                </ReactCrop>
              )}
            </div>
            <div className="flex justify-center mt-6">
              <Button onClick={handleCrop} disabled={isProcessing || !crop} className="text-lg py-6">
                <CropIcon className="mr-2 h-5 w-5" />
                {isProcessing ? dictionary.processing : dictionary.button_crop}
              </Button>
            </div>
          </div>
        )}
        {outputPdfUrl && (
          <div className="mt-6 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">{dictionary.success_message}</h3>
            <Button asChild size="lg">
              <a href={outputPdfUrl} download={`cropped-${file?.name}`}>{dictionary.download_button}</a>
            </Button>
          </div>
        )}
        </CardContent>
    </Card>
  );
};