'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { FileText, X, PlusCircle, UploadCloud, Loader2 } from 'lucide-react';
import type { Locale } from '@/i18n-config'; // We'll create this file next

// Define the shape of the dictionary for this page
interface MergeDict {
    title: string;
    subtitle: string;
    files_to_merge: string;
    add_more_files: string;
    merge_button: string;
    merging: string;
    success_message: string;
    download_button: string;
    dropzone_text: string;
    alert_at_least_two: string;
    alert_error_merging: string;
}

// The main page component is now separate and receives the dictionary as a prop
const MergePage = ({ dict }: { dict: MergeDict }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    setMergedPdfUrl(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop, noClick: true, noKeyboard: true,
    accept: { 'application/pdf': ['.pdf'] },
  });

  const removeFile = (index: number) => setFiles(files.filter((_, i) => i !== index));

  const handleMerge = async () => {
    if (files.length < 2) return alert(dict.alert_at_least_two);
    setIsMerging(true);
    setMergedPdfUrl(null);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const fileBytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert(dict.alert_error_merging);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{dict.title}</h1>
        <p className="text-md md:text-lg text-gray-600">{dict.subtitle}</p>
      </div>
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          {files.length === 0 ? (
            <div onClick={open} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
              <div className="flex flex-col items-center justify-center">
                <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg text-gray-600">{dict.dropzone_text}</p>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-4">{dict.files_to_merge}</h3>
              <div className="space-y-3 mb-6">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-md">
                    <div className="flex items-center"><FileText className="w-5 h-5 text-gray-500 mr-3" /><span className="font-medium text-gray-800">{file.name}</span></div>
                    <button onClick={() => removeFile(index)} className="p-1 rounded-full hover:bg-gray-200"><X className="w-5 h-5 text-red-500" /></button>
                  </div>
                ))}
              </div>
              <div className="flex justify-center items-center gap-4 mt-4">
                <button type="button" onClick={open} className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600">
                  <PlusCircle className="w-6 h-6 mr-2" />
                  {dict.add_more_files}
                </button>
              </div>
              <div className="flex justify-center mt-6">
                <button onClick={handleMerge} disabled={isMerging} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 text-lg">
                  {isMerging ? dict.merging : dict.merge_button}
                </button>
              </div>
            </div>
          )}
        </div>
        {mergedPdfUrl && (
          <div className="mt-8 text-center p-6 bg-green-50 border-green-200 rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 mb-4">{dict.success_message}</h3>
            <a href={mergedPdfUrl} download={`merged-${Date.now()}.pdf`} className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700">
              {dict.download_button}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// This is the default export for the page. It's a wrapper that handles data fetching.
export default function MergePageWrapper({ params: { lang } }: { params: { lang: Locale } }) {
    const [dictionary, setDictionary] = useState<MergeDict | null>(null);

    useEffect(() => {
        const getDictionary = async () => {
            const dictModule = await (lang === 'en' ? import('@/dictionaries/en.json') : import('@/dictionaries/es.json'));
            setDictionary(dictModule.default.merge_pdf);
        };
        getDictionary();
    }, [lang]);

    if (!dictionary) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="w-12 h-12 animate-spin" /></div>;
    }

    return <MergePage dict={dictionary} />;
}