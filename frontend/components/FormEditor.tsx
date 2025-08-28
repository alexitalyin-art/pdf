'use client';

import { useState, useEffect, useRef } from 'react';
import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFPageProxy } from 'pdfjs-dist';
import { Loader2, Save } from 'lucide-react';
import { PageRenderer } from './PageRenderer';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface FormField {
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  options?: string[];
  pageIndex: number;
}
interface FormEditorProps {
    file: File;
    onReset: () => void;
}

export const FormEditor = ({ file, onReset }: FormEditorProps) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pdfJsDoc, setPdfJsDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageProxies, setPageProxies] = useState<PDFPageProxy[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [fieldValues, setFieldValues] = useState<{[key: string]: string | boolean}>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // This effect now reliably measures the container width
  useEffect(() => {
    if (containerRef.current && containerWidth === 0) {
      setContainerWidth(containerRef.current.clientWidth);
    }
    const handleResize = () => {
        if (containerRef.current) setContainerWidth(containerRef.current.clientWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerWidth]);


  // This single, robust effect handles all PDF processing
  useEffect(() => {
    if (!file) return;

    const processPdf = async () => {
      setIsProcessing(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);

      // Load both library instances at once
      const [loadedPdfDoc, loadedPdfJsDoc] = await Promise.all([
        PDFDocument.load(pdfData),
        pdfjsLib.getDocument({ data: pdfData }).promise,
      ]);

      setPdfDoc(loadedPdfDoc);
      setPdfJsDoc(loadedPdfJsDoc);

      // Pre-load all page proxy objects
      const pagePromises = [];
      for (let i = 1; i <= loadedPdfJsDoc.numPages; i++) {
        pagePromises.push(loadedPdfJsDoc.getPage(i));
      }
      const loadedPageProxies = await Promise.all(pagePromises);
      setPageProxies(loadedPageProxies);

      // Extract initial form values
      const form = loadedPdfDoc.getForm();
      const libFields = form.getFields();
      const initialValues: {[key: string]: string | boolean} = {};
      libFields.forEach(field => {
        const name = field.getName();
        if (field instanceof PDFTextField) initialValues[name] = field.getText() || '';
        if (field instanceof PDFCheckBox) initialValues[name] = field.isChecked();
        if (field instanceof PDFDropdown) initialValues[name] = field.getSelected()[0] || '';
        if (field instanceof PDFRadioGroup) initialValues[name] = field.getSelected() || '';
      });
      setFieldValues(initialValues);
      setIsProcessing(false);
    };

    processPdf();
  }, [file]);

  // This effect extracts field positions once everything is ready
  useEffect(() => {
    if (!pageProxies.length || !pdfDoc || containerWidth === 0) return;
    
    const extractFields = async () => {
        const allFields: FormField[] = [];
        const libFields = pdfDoc.getForm().getFields();

        for (let i = 0; i < pageProxies.length; i++) {
            const page = pageProxies[i];
            const scale = containerWidth / page.getViewport({ scale: 1.0 }).width;
            const viewport = page.getViewport({scale});
            
            const annotations = await page.getAnnotations();
            annotations
            .filter(anno => anno.subtype === 'Widget' && anno.fieldName)
            .forEach(anno => {
                const field = libFields.find(f => f.getName() === anno.fieldName);
                if (!field) return;

                const [x1, y1, x2, y2] = viewport.convertToViewportRectangle(anno.rect);
                const rect = pdfjsLib.Util.normalizeRect([x1, y1, x2, y2]);
                
                let fieldType = 'text';
                if (field instanceof PDFCheckBox) fieldType = 'checkbox';
                if (field instanceof PDFDropdown) fieldType = 'dropdown';
                if (field instanceof PDFRadioGroup) fieldType = 'radio';

                allFields.push({
                    name: field.getName(), type: fieldType,
                    x: rect[0], y: rect[1],
                    width: rect[2] - rect[0], height: rect[3] - rect[1],
                    options: (field instanceof PDFDropdown || field instanceof PDFRadioGroup) ? field.getOptions() : undefined,
                    pageIndex: i,
                });
            });
        }
        setFormFields(allFields);
    }
    extractFields();
  }, [pageProxies, pdfDoc, containerWidth]);

  const handleFieldChange = (fieldName: string, value: string | boolean) => {
    if (!pdfDoc) return;
    setFieldValues(prev => ({ ...prev, [fieldName]: value }));
    const form = pdfDoc.getForm();
    const field = form.getField(fieldName);
    try {
        if (field instanceof PDFTextField) field.setText(value as string);
        else if (field instanceof PDFCheckBox) { if (value) field.check(); else field.uncheck(); }
        else if (field instanceof PDFDropdown || field instanceof PDFRadioGroup) field.select(value as string);
    } catch (e) { console.error("Failed to update field:", e) }
  };

  const handleSave = async () => {
    if (!pdfDoc) return;
    setIsProcessing(true);
    try {
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
    } catch (e) {
      alert('Failed to save PDF.');
    }
    setIsProcessing(false);
  };
  
  if (outputPdfUrl) {
    return (
        <div className="mt-8 text-center p-6 bg-green-50 border-green-200 rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 mb-4">Your Filled PDF is Ready!</h3>
            <div className='flex justify-center items-center gap-4'>
                <a href={outputPdfUrl} download={`filled-${file?.name}`} className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700">Download PDF</a>
                <button onClick={onReset} className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700">Fill Another PDF</button>
            </div>
        </div>
    )
  }

  return (
    <div ref={containerRef}>
      <div className="flex justify-center mb-4">
          <button onClick={handleSave} disabled={isProcessing} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2">
            <Save />
            {isProcessing ? 'Processing...' : 'Save Filled PDF'}
          </button>
      </div>
      
      {isProcessing ? (
         <div className="text-center py-10"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Analyzing PDF...</p></div>
      ) : (
        <div className="space-y-4">
            {pageProxies.map((page, pageIndex) => {
            const pageFields = formFields.filter(f => f.pageIndex === pageIndex);
            const scale = containerWidth > 0 ? containerWidth / page.getViewport({scale: 1.0}).width : 0;

            return (
                <div key={pageIndex} className="relative shadow-lg">
                    <PageRenderer page={page} scale={scale} />
                    {pageFields.map(field => {
                        const style = { position: 'absolute', left: `${field.x}px`, top: `${field.y}px`, width: `${field.width}px`, height: `${field.height}px`, border: '1px solid #3b82f6', background: 'rgba(59, 130, 246, 0.1)', fontSize: '14px' } as React.CSSProperties;
                        if (field.type === 'text') {
                        return <textarea key={field.name} value={fieldValues[field.name] as string || ''} onChange={(e) => handleFieldChange(field.name, e.target.value)} style={{...style, resize: 'none'}} />
                        }
                        if (field.type === 'checkbox') {
                            return <input key={field.name} type="checkbox" checked={fieldValues[field.name] as boolean || false} onChange={(e) => handleFieldChange(field.name, e.target.checked)} style={{...style, background: 'rgba(59, 130, 246, 0.2)'}} />
                        }
                        if (field.type === 'dropdown') {
                            return <select key={field.name} value={fieldValues[field.name] as string || ''} onChange={(e) => handleFieldChange(field.name, e.target.value)} style={style}>
                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        }
                        return null;
                    })}
                </div>
            )
            })}
        </div>
      )}
    </div>
  )
};