'use client';

import { useState, useEffect, useRef } from 'react';
import type { PDFPageProxy } from 'pdfjs-dist';
import { Loader2 } from 'lucide-react';

interface PageRendererProps {
  page: PDFPageProxy;
  scale: number;
}

export const PageRenderer = ({ page, scale }: PageRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stop observing once it's visible
          observer.disconnect();
          
          const render = async () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const viewport = page.getViewport({ scale });
            const context = canvas.getContext('2d');
            if (!context) return;
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;
            setIsRendered(true);
          };
          render();
        }
      },
      { rootMargin: '100px' } // Start loading when it's 100px away from the viewport
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [page, scale]);

  const viewport = page.getViewport({ scale });

  return (
    <div ref={containerRef} style={{ height: `${viewport.height}px`, width: `${viewport.width}px` }} className="bg-gray-200 flex items-center justify-center">
      <canvas ref={canvasRef} className={isRendered ? 'block' : 'hidden'} />
      {!isRendered && <Loader2 className="w-8 h-8 animate-spin text-gray-500" />}
    </div>
  );
};