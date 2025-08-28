'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const PDFPreviewer = dynamic(() => import('@/components/PDFPreviewer').then(mod => mod.PDFPreviewer), {
  ssr: false,
  loading: () => <div className="text-center py-10"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Loading Previews...</p></div>,
});

const SortablePageItem = ({ id, src, originalIndex }: { id: any, src: string, originalIndex: number }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none',
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative cursor-grab">
      <img src={src} alt={`Page ${originalIndex}`} className="border rounded-md shadow-sm" />
      <span className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center select-none">{originalIndex}</span>
    </div>
  );
};

export const Reorderer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<{ id: number; src: string; originalIndex: number }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reorderedPdfUrl, setReorderedPdfUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setReorderedPdfUrl(null);
      setPages([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/pdf': ['.pdf'] },
  });

  const handlePreviewsGenerated = (previews: string[]) => {
    const pageData = previews.map((src, index) => ({
      id: index + 1,
      src: src,
      originalIndex: index + 1,
    }));
    setPages(pageData);
  };
  
  const sensors = useSensors(useSensor(PointerSensor));
  
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleReorder = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
        const existingPdfBytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const newDoc = await PDFDocument.create();
        
        const newPageOrderIndices = pages.map(p => p.originalIndex - 1);
        const copiedPages = await newDoc.copyPages(pdfDoc, newPageOrderIndices);
        copiedPages.forEach(page => newDoc.addPage(page));
        
        const pdfBytes = await newDoc.save();
        
        // --- THIS IS THE DEFINITIVE FIX ---
        const arrayBuffer = new ArrayBuffer(pdfBytes.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        uint8Array.set(pdfBytes);
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        // ------------------------------------

        const url = URL.createObjectURL(blob);
        setReorderedPdfUrl(url);
    } catch (error) {
        console.error("Failed to reorder PDF:", error);
        alert("An error occurred while reordering the PDF.");
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
              <p className="text-lg text-muted-foreground">Drag & drop a PDF here, or click to select a file</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between p-3 bg-secondary rounded-md mb-6">
              <p className="font-medium text-secondary-foreground truncate pr-4">{file.name}</p>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPages([]); }}>Change File</Button>
            </div>
            
            {pages.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-96 overflow-y-auto">
                        <SortableContext items={pages} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                {pages.map(page => <SortablePageItem key={page.id} id={page.id} src={page.src} originalIndex={page.originalIndex} />)}
                            </div>
                        </SortableContext>
                    </div>
                </DndContext>
            ) : (
                <PDFPreviewer file={file} onPreviewGenerated={handlePreviewsGenerated} />
            )}

            <div className="flex justify-center mt-6">
              <Button onClick={handleReorder} disabled={isProcessing || pages.length === 0} className="text-lg py-6">
                {isProcessing ? 'Processing...' : 'Save Reordered PDF'}
              </Button>
            </div>
          </div>
        )}
        
        {reorderedPdfUrl && (
          <div className="mt-6 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">Your PDF is Ready!</h3>
            <Button asChild size="lg">
              <a href={reorderedPdfUrl} download={`reordered-${file?.name}`}>Download Reordered PDF</a>
            </Button>
          </div>
        )}
        </CardContent>
    </Card>
  );
};