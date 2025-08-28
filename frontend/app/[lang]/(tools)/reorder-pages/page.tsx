'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UploadCloud, FileText } from 'lucide-react';
import { PDFPreviewer } from '@/components/PDFPreviewer'; // We use our grid previewer here

// A small component to make each page draggable
const SortablePageItem = ({ id, src, pageNumber }: { id: any, src: string, pageNumber: number }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative cursor-grab">
      <img src={src} alt={`Page ${pageNumber}`} className="border border-gray-300 rounded-md shadow-sm" />
      <span className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center select-none">{pageNumber}</span>
    </div>
  );
};

export default function ReorderPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<{ id: number; src: string }[]>([]);
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
        
        const newPageOrderIndices = pages.map(p => p.id - 1);
        const copiedPages = await newDoc.copyPages(pdfDoc, newPageOrderIndices);
        copiedPages.forEach(page => newDoc.addPage(page));
        
        const pdfBytes = await newDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
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
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Reorder PDF Pages</h1>
        <p className="text-md md:text-lg text-gray-600">Drag and drop pages to change their order.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
        {!file ? (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center">
              <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg text-gray-600">Drag & drop a PDF here, or click to select a file</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-md mb-6">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-gray-500 mr-3" />
                <span className="font-medium text-gray-800">{file.name}</span>
              </div>
              <button onClick={() => { setFile(null); setPages([]); }} className="text-sm text-red-500 hover:underline">
                Remove
              </button>
            </div>
            
            {pages.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <div className="p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                        <SortableContext items={pages} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                {pages.map(page => <SortablePageItem key={page.id} id={page.id} src={page.src} pageNumber={page.id} />)}
                            </div>
                        </SortableContext>
                    </div>
                </DndContext>
            ) : (
                <PDFPreviewer file={file} onPreviewGenerated={handlePreviewsGenerated} />
            )}

            <div className="flex justify-center mt-6">
              <button onClick={handleReorder} disabled={isProcessing || pages.length === 0} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-300 text-lg">
                {isProcessing ? 'Processing...' : 'Save Reordered PDF'}
              </button>
            </div>
          </div>
        )}
        
        {reorderedPdfUrl && (
          <div className="mt-8 text-center p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 mb-4">Your PDF is Ready!</h3>
            <a href={reorderedPdfUrl} download={`reordered-${file?.name}`} className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors duration-300">
              Download Reordered PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}