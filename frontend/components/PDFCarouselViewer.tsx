'use client';

import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { type PDFDocumentProxy } from 'pdfjs-dist';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface Watermark {
  text: string;
  fontSize: number;
  opacity: number;
  fontFamily: string;
  style: 'single' | 'tiled';
}
interface PageNumberOptions {
  fontSize: number;
  position: string;
  startNumber: number;
}
interface PDFCarouselViewerProps {
  file: File;
  rotation?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPdfLoad: (pdf: PDFDocumentProxy) => void;
  watermark?: Watermark;
  pageNumberOptions?: PageNumberOptions;
}

export const PDFCarouselViewer = ({ file, rotation = 0, currentPage, onPageChange, onPdfLoad, watermark, pageNumberOptions }: PDFCarouselViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewportTrigger, setViewportTrigger] = useState(0);

  useEffect(() => {
    const loadPdf = async () => {
      if (!file) return;
      setIsLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdf(pdfDoc);
        onPdfLoad(pdfDoc);
        onPageChange(1);
      } catch (error) { console.error("Failed to load PDF:", error); } 
      finally { setIsLoading(false); }
    };
    loadPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  useEffect(() => {
    if (!pdf || isLoading) return;
    let renderTask: pdfjsLib.RenderTask | undefined;
    const render = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container || container.clientWidth === 0) return;
        const viewport = page.getViewport({ scale: container.clientWidth / page.getViewport({ scale: 1.0 }).width });
        const context = canvas.getContext('2d');
        if (!context) return;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;

        if (watermark && watermark.text) {
          context.font = `${watermark.fontSize * viewport.scale}px ${watermark.fontFamily}`;
          context.fillStyle = `rgba(0, 0, 0, ${watermark.opacity})`;
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.save();
          
          if (watermark.style === 'tiled') {
            const gap = 150 * viewport.scale;
            for (let y = gap / 2; y < canvas.height; y += gap) {
              for (let x = gap / 2; x < canvas.width; x += gap) {
                context.save();
                context.translate(x, y);
                context.rotate(-Math.PI / 4);
                context.fillText(watermark.text, 0, 0);
                context.restore();
              }
            }
          } else {
            context.translate(canvas.width / 2, canvas.height / 2);
            context.rotate(-Math.PI / 4);
            context.fillText(watermark.text, 0, 0);
          }
          context.restore();
        }
        if (pageNumberOptions) {
            const { fontSize, position, startNumber } = pageNumberOptions;
            const margin = 20 * viewport.scale;
            const text = `${currentPage + startNumber - 1}`;
            context.font = `${fontSize * viewport.scale}px Helvetica`;
            context.fillStyle = 'rgba(0, 0, 0, 1)';
            let x=0, y=0;
            switch (position) {
                case 'top-left': x = margin; y = margin; context.textAlign = 'left'; context.textBaseline = 'top'; break;
                case 'top-center': x = canvas.width / 2; y = margin; context.textAlign = 'center'; context.textBaseline = 'top'; break;
                case 'top-right': x = canvas.width - margin; y = margin; context.textAlign = 'right'; context.textBaseline = 'top'; break;
                case 'bottom-left': x = margin; y = canvas.height - margin; context.textAlign = 'left'; context.textBaseline = 'bottom'; break;
                case 'bottom-center': x = canvas.width / 2; y = canvas.height - margin; context.textAlign = 'center'; context.textBaseline = 'bottom'; break;
                case 'bottom-right': x = canvas.width - margin; y = canvas.height - margin; context.textAlign = 'right'; context.textBaseline = 'bottom'; break;
            }
            context.fillText(text, x, y);
        }
      } catch (error: any) {
        if (error.name !== 'RenderingCancelledException') { console.error("Render error:", error); }
      }
    };
    render();
    return () => { renderTask?.cancel(); };
  }, [pdf, currentPage, isLoading, viewportTrigger, watermark, pageNumberOptions]);

  useEffect(() => {
    const handleResize = () => setViewportTrigger(val => val + 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const goToPreviousPage = () => { if (currentPage > 1) onPageChange(currentPage - 1); };
  const goToNextPage = () => { if (pdf && currentPage < pdf.numPages) onPageChange(currentPage + 1); };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {!isLoading && pdf && (
        <div className="flex items-center justify-center gap-4">
          <button onClick={goToPreviousPage} disabled={currentPage <= 1} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"><ArrowLeft /></button>
          <span className="font-semibold text-lg">Page {currentPage} of {pdf.numPages}</span>
          <button onClick={goToNextPage} disabled={currentPage >= pdf.numPages} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"><ArrowRight /></button>
        </div>
      )}
      <div ref={containerRef} className="w-full border border-gray-300 shadow-md overflow-hidden flex justify-center items-center min-h-[200px]">
        {isLoading ? (
          <div className="text-center py-20"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>
        ) : (
          <canvas ref={canvasRef} style={{ transform: `rotate(${rotation}deg)` }} className="transition-transform duration-300"></canvas>
        )}
      </div>
    </div>
  );
};