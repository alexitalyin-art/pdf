'use client';

import { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Loader2, Save, XCircle, Edit, RotateCcw } from 'lucide-react';
import { Rnd } from 'react-rnd';
import dynamic from 'next/dynamic';

// --- THIS IS THE FIX ---
// We must also dynamically import the viewer INSIDE this component.
const PDFCarouselViewer = dynamic(() => import('@/components/PDFCarouselViewer').then(mod => mod.PDFCarouselViewer), {
  ssr: false,
  loading: () => <div className="text-center py-20"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Loading Viewer...</p></div>,
});


pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PlacedItem {
  id: number;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'whiteout' | 'text';
  text?: string;
  fontSize?: number;
  color?: string;
}

interface EraseEditEditorProps {
    file: File;
}

export const EraseEditEditor = ({ file }: EraseEditEditorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  const [items, setItems] = useState<PlacedItem[]>([]);
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  
  const [isErasing, setIsErasing] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [imgSrc, setImgSrc] = useState('');

  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [pdfJsDoc, setPdfJsDoc] = useState<PDFDocumentProxy | null>(null);
  
  const handleReset = () => {
    setItems([]);
    setSelectedItemId(null);
  };

  const startErasing = async () => {
    if (!viewerContainerRef.current) return;
    const canvas = viewerContainerRef.current.querySelector('canvas');
    if (canvas) {
      setImgSrc(canvas.toDataURL());
      setIsErasing(true);
      setSelectedItemId(null);
    }
  };

  const onCropComplete = (c: Crop) => {
    if (c.width && c.height) {
      const whiteoutBox: PlacedItem = { id: Date.now(), page: currentPage, x: c.x, y: c.y, width: c.width, height: c.height, type: 'whiteout' };
      const textBox: PlacedItem = { id: Date.now() + 1, page: currentPage, x: c.x, y: c.y, width: c.width, height: c.height, type: 'text', text: 'Type here...', fontSize: 14, color: '#000000' };
      setItems(prev => [...prev, whiteoutBox, textBox]);
      setIsErasing(false);
      setCrop(undefined);
    }
  };
  
  const deleteItem = (idToDelete: number) => {
    const itemToDelete = items.find(i => i.id === idToDelete);
    if (itemToDelete?.type === 'text') {
      setItems(prev => prev.filter(item => item.id !== idToDelete && item.id !== idToDelete - 1));
    } else {
      setItems(prev => prev.filter(item => item.id !== idToDelete));
    }
  };
  
  const updateItemProperty = (id: number, props: Partial<PlacedItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...props } : item));
  };
  
  const updateItemPosition = (id: number, x: number, y: number) => updateItemProperty(id, { x, y });
  const updateItemSize = (id: number, width: number, height: number, x: number, y: number) => updateItemProperty(id, { width, height, x, y });
  
  const handleApplyEdits = async () => {
    if (!file || items.length === 0 || !pdfJsDoc) return alert('Please add at least one edit.');
    setIsProcessing(true);
    setOutputPdfUrl(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (const item of items) {
        if (item.page < 1 || item.page > pdfDoc.getPageCount()) continue;

        const page = pdfDoc.getPage(item.page - 1);
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        const pagePreviewInViewer = await pdfJsDoc.getPage(item.page);
        const scale = pageWidth / pagePreviewInViewer.getViewport({scale:1.0}).width;

        const itemX = item.x * scale;
        const itemY_fromTop = item.y * scale;
        const itemWidth = item.width * scale;
        const itemHeight = item.height * scale;

        if (item.type === 'whiteout') {
          page.drawRectangle({ x: itemX, y: pageHeight - itemY_fromTop - itemHeight, width: itemWidth, height: itemHeight, color: rgb(1, 1, 1) });
        } else if (item.type === 'text' && item.text && item.fontSize && item.color) {
          const textColor = { r: parseInt(item.color.slice(1, 3), 16) / 255, g: parseInt(item.color.slice(3, 5), 16) / 255, b: parseInt(item.color.slice(5, 7), 16) / 255 };
          const scaledFontSize = item.fontSize * scale;
          const textHeight = helveticaFont.getAscentAtSize(scaledFontSize);

          page.drawText(item.text, {
            x: itemX, y: pageHeight - itemY_fromTop - textHeight,
            font: helveticaFont, size: scaledFontSize,
            color: textColor, maxWidth: itemWidth,
            lineHeight: scaledFontSize * 1.2,
          });
        }
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
    } catch (error) {
      console.error('Error applying edits:', error);
      alert('An error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const selectedItem = items.find(i => i.id === selectedItemId);

  if (outputPdfUrl) {
    return (
        <div className="mt-8 text-center p-6 bg-green-50 border-green-200 rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 mb-4">Your Edited PDF is Ready!</h3>
            <a href={outputPdfUrl} download={`edited-${file?.name}`} className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700">Download PDF</a>
        </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow lg:w-2/3 relative" ref={viewerContainerRef}>
            {isErasing ? (
                <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={onCropComplete}>
                <img src={imgSrc} alt="Select area to erase" />
            </ReactCrop>
            ) : (
            <>
                <PDFCarouselViewer 
                    file={file} 
                    currentPage={currentPage} 
                    onPageChange={setCurrentPage} 
                    onPdfLoad={(pdf) => {
                        setTotalPages(pdf.numPages);
                        setPdfJsDoc(pdf);
                    }} 
                />
                {items.filter(item => item.page === currentPage).map(item => {
                    const itemStyle = {
                        border: selectedItemId === item.id ? '2px solid #3b82f6' : '2px dashed #ccc',
                        background: item.type === 'whiteout' ? 'white' : 'transparent',
                    };
                    if (item.type === 'whiteout') {
                        return <div key={item.id} style={{ position: 'absolute', left: item.x, top: item.y, width: item.width, height: item.height, background: 'white', border: '1px dashed #ccc' }} />;
                    }
                    if (item.type === 'text') {
                        return <Rnd key={item.id} size={{ width: item.width, height: item.height }} position={{ x: item.x, y: item.y }} onDragStart={() => setSelectedItemId(item.id)} onDragStop={(e, d) => updateItemPosition(item.id, d.x, d.y)} onResizeStop={(e, dir, ref, delta, pos) => updateItemSize(item.id, parseFloat(ref.style.width), parseFloat(ref.style.height), pos.x, pos.y)} style={itemStyle} className="group flex items-center justify-center">
                            <textarea value={item.text} onChange={(e) => updateItemProperty(item.id, { text: e.target.value })} onClick={() => setSelectedItemId(item.id)} className="w-full h-full bg-transparent resize-none text-center outline-none p-1" style={{ fontSize: item.fontSize, color: item.color }} />
                            <button onClick={() => deleteItem(item.id)} className="absolute -top-3 -right-3 z-10 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"><XCircle size={20} /></button>
                        </Rnd>
                    }
                    return null;
                })}
            </>
            )}
        </div>
        <div className="lg:w-1/3 flex flex-col items-center">
            <div className="w-full text-center">
            <button onClick={startErasing} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 w-full flex items-center justify-center gap-2 mt-4">
                <Edit /> Select Area to Erase/Edit
            </button>
                {isErasing && <button onClick={() => setIsErasing(false)} className="text-sm text-red-500 hover:underline mt-2">Cancel</button>}
            </div>
            
            {selectedItem && selectedItem.type === 'text' && (
            <div className="w-full mt-6 p-4 border rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-center">Text Options</h3>
                <div className="mb-3">
                    <label htmlFor="fontSize" className="block text-sm font-medium mb-1">Font Size ({selectedItem.fontSize}pt)</label>
                    <input type="range" id="fontSize" min="8" max="72" value={selectedItem.fontSize} onChange={e => updateItemProperty(selectedItemId!, { fontSize: parseInt(e.target.value) })} className="w-full" />
                </div>
                <div className="mb-3">
                    <label htmlFor="fontColor" className="block text-sm font-medium mb-1">Font Color</label>
                    <input type="color" id="fontColor" value={selectedItem.color} onChange={e => updateItemProperty(selectedItemId!, { color: e.target.value })} className="w-full h-10 p-1 border border-gray-300 rounded-md" />
                </div>
            </div>
            )}

            <div className="w-full mt-auto pt-4">
            <button onClick={handleReset} disabled={items.length === 0} className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 w-full flex items-center justify-center gap-2 mb-3"><RotateCcw /> Reset</button>
            <button onClick={handleApplyEdits} disabled={isProcessing || items.length === 0} className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 w-full flex items-center justify-center gap-2"><Save /> Apply Edits & Download</button>
            </div>
        </div>
    </div>
  )
};