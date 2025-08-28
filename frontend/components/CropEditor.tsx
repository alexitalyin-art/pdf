'use client';

import { useState, useCallback, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FileText, Crop as CropIcon, Loader2, ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { PDFCarouselViewer } from './PDFCarouselViewer'; // Assuming it's in the same folder

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface CropEditorProps {
  file: File;
  onBack: () => void;
}

export const CropEditor = ({ file, onBack }: CropEditorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [crops, setCrops] = useState<{ [key: number]: Crop }>({});
  const [imgSize, setImgSize] = useState<{ [key: number]: {width: number, height: number} }>({});
  const [originalPdfDims, setOriginalPdfDims] = useState<{ [key: number]: {width: number, height: number} }>({});

  // NEW: State to hold the processed file for final review
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [finalCurrentPage, setFinalCurrentPage] = useState(1);

  useEffect(() => {
    // Only run if we have a file and haven't processed it yet
    if (!file || processedFile) return;

    const generateAllPreviews = async () => {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      setPdf(pdfDoc);
      
      const previews: string[] = [];
      const origDims: { [key: number]: {width: number, height: number} } = {};

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        origDims[i] = { width: page.view[2], height: page.view[3] };
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
          previews.push(canvas.toDataURL());
        }
      }
      setPagePreviews(previews);
      setOriginalPdfDims(origDims);
    };
    generateAllPreviews();
  }, [file, processedFile]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>, pageNum: number) => {
    const { width, height } = e.currentTarget;
    setImgSize(prev => ({ ...prev, [pageNum]: { width, height } }));
    if (!crops[pageNum]) {
      const initialCrop = centerCrop(makeAspectCrop({ unit: 'px', width: width * 0.9, height: height * 0.9 }, 1, width, height), width, height);
      setCrops(prev => ({...prev, [pageNum]: initialCrop}));
    }
  };

  const handleCrop = async () => {
    if (Object.keys(crops).length === 0) return alert('Please define at least one crop area.');
    setIsProcessing(true);
    setOutputPdfUrl(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();

      Object.entries(crops).forEach(([pageNumStr, crop]) => {
        const pageNum = parseInt(pageNumStr, 10);
        const pageIndex = pageNum - 1;
        const page = pages[pageIndex];

        if (crop && crop.width && crop.height) {
          const originalDims = originalPdfDims[pageNum];
          const previewDims = imgSize[pageNum];
          if (!originalDims || !previewDims) return;

          const scaleX = originalDims.width / previewDims.width;
          const scaleY = originalDims.height / previewDims.height;
          
          const cropX = crop.x * scaleX;
          const cropY = originalDims.height - (crop.y * scaleY) - (crop.height * scaleY);
          const cropWidth = crop.width * scaleX;
          const cropHeight = crop.height * scaleY;
          
          page.setMediaBox(cropX, cropY, cropWidth, cropHeight);
          page.setCropBox(cropX, cropY, cropWidth, cropHeight);
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer], { type: 'application/pdf' });
      // NEW: Create a new file object and URL for the final preview and download
      const newFile = new File([blob], `cropped-${file.name}`, { type: 'application/pdf' });
      setProcessedFile(newFile);
      setOutputPdfUrl(URL.createObjectURL(blob));

    } catch (error) {
      console.error('Error cropping PDF:', error);
      alert('An error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, pdf?.numPages || 1));

  // If a file has been processed, show the final review UI
  if (processedFile) {
    return (
      <div>
        <h3 className="text-2xl font-bold text-center mb-4">Final Preview</h3>
        <PDFCarouselViewer
            file={processedFile}
            currentPage={finalCurrentPage}
            onPageChange={setFinalCurrentPage}
            onPdfLoad={() => {}}
        />
        <div className="flex justify-center items-center gap-4 mt-6">
            <button onClick={() => setProcessedFile(null)} className="bg-gray-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-600">
                Back to Editor
            </button>
            <a href={outputPdfUrl!} download={processedFile.name} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Download /> Download
            </a>
        </div>
      </div>
    );
  }

  // Otherwise, show the default editor UI
  return (
    <div>
      <div className="flex items-center justify-between p-3 bg-gray-100 rounded-md mb-6">
        <div className="flex items-center"><FileText className="w-5 h-5 text-gray-500 mr-3" /><span className="font-medium text-gray-800">{file.name}</span></div>
        <button onClick={onBack} className="text-sm text-red-500 hover:underline">Choose a different file</button>
      </div>
      
      <div className="flex justify-center items-center bg-gray-100 p-4 rounded-lg min-h-[300px]">
        {pagePreviews.length === 0 ? (
          <div className="text-center py-10"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Generating Previews...</p></div>
        ) : (
          <ReactCrop crop={crops[currentPage]} onChange={(c) => setCrops(prev => ({...prev, [currentPage]: c}))}>
            <img src={pagePreviews[currentPage - 1]} alt={`Page ${currentPage}`} onLoad={(e) => onImageLoad(e, currentPage)} />
          </ReactCrop>
        )}
      </div>
      
      {pdf && pagePreviews.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-4">
              <button onClick={goToPreviousPage} disabled={currentPage <= 1} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"><ArrowLeft /></button>
              <span className="font-semibold text-lg">Page {currentPage} of {pdf.numPages}</span>
              <button onClick={goToNextPage} disabled={currentPage >= pdf.numPages} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"><ArrowRight /></button>
          </div>
      )}

      <div className="flex justify-center mt-6">
        <button onClick={handleCrop} disabled={isProcessing || Object.keys(crops).length === 0} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2">
          <CropIcon />
          {isProcessing ? 'Cropping...' : 'Apply Crops & Preview'}
        </button>
      </div>
    </div>
  );
};