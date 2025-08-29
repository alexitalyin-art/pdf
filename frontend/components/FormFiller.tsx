'use client';

import { useState, useEffect, useRef } from 'react';
import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2, Save } from 'lucide-react';
import { PageRenderer } from './PageRenderer';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { PDFDocumentProxy } from 'pdfjs-dist';

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
interface FormFillerProps {
    file: File;
    onReset: () => void;
    dictionary: any;
}

export const FormFiller = ({ file, onReset, dictionary }: FormFillerProps) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pdfJsDoc, setPdfJsDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageProxies, setPageProxies] = useState<pdfjsLib.PDFPageProxy[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [fieldValues, setFieldValues] = useState<{[key: string]: string | boolean}>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) setContainerWidth(containerRef.current.clientWidth);
    const handleResize = () => {
        if (containerRef.current) setContainerWidth(containerRef.current.clientWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!file) return;
    const processPdf = async () => {
      setIsProcessing(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      const [loadedPdfDoc, loadedPdfJsDoc] = await Promise.all([
        PDFDocument.load(pdfData),
        pdfjsLib.getDocument({ data: pdfData }).promise,
      ]);
      setPdfDoc(loadedPdfDoc);
      setPdfJsDoc(loadedPdfJsDoc);
      const pagePromises = Array.from({ length: loadedPdfJsDoc.numPages }, (_, i) => loadedPdfJsDoc.getPage(i + 1));
      const loadedPageProxies = await Promise.all(pagePromises);
      setPageProxies(loadedPageProxies);
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
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      uint8Array.set(pdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
    } catch (e) {
      alert('Failed to save PDF.');
    }
    setIsProcessing(false);
  };
  
  if (isProcessing && !pdfJsDoc) {
    return <div className="text-center py-10"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">{dictionary.analyzing_pdf}</p></div>
  }
  
  if (outputPdfUrl) {
    return (
        <div className="mt-8 text-center p-6 bg-green-50 dark:bg-green-900/20 border rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-4">{dictionary.success_message}</h3>
            <div className='flex justify-center items-center gap-4'>
                <Button asChild size="lg"><a href={outputPdfUrl} download={`filled-${file?.name}`}>{dictionary.download_button}</a></Button>
                <Button onClick={onReset} variant="outline" size="lg">Fill Another Form</Button>
            </div>
        </div>
    )
  }

  return (
    <div ref={containerRef}>
      <div className="flex justify-center mb-4">
          <Button onClick={handleSave} disabled={isProcessing} className="text-lg py-6">
            <Save className="mr-2 h-5 w-5" />
            {isProcessing ? dictionary.processing : dictionary.button_save}
          </Button>
      </div>
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
                        return <Checkbox key={field.name} checked={fieldValues[field.name] as boolean || false} onCheckedChange={(checked) => handleFieldChange(field.name, checked as boolean)} style={{...style, background: 'rgba(59, 130, 246, 0.2)', border: 'none'}} className="h-full w-full" />
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
    </div>
  )
};