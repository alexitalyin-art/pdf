'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { FileText, UploadCloud, Save } from 'lucide-react';

interface Metadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
}

export default function EditMetadataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata>({ title: '', author: '', subject: '', keywords: '' });
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setOutputPdfUrl(null);
      setMetadata({ title: '', author: '', subject: '', keywords: '' });
    }
  }, []);

  useEffect(() => {
    if (!file) return;

    const readMetadata = async () => {
      try {
        const existingPdfBytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes, { updateMetadata: false });
        
        setMetadata({
          title: pdfDoc.getTitle() || '',
          author: pdfDoc.getAuthor() || '',
          subject: pdfDoc.getSubject() || '',
          keywords: pdfDoc.getKeywords() || '',
        });
      } catch (error) {
        console.error("Failed to read metadata", error);
        alert("Could not read metadata from this PDF. It might be corrupted or protected.");
      }
    };
    
    readMetadata();
  }, [file]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { 'application/pdf': ['.pdf'] } });

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetadata(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!file) return;
    setIsProcessing(true);
    setOutputPdfUrl(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      pdfDoc.setTitle(metadata.title);
      pdfDoc.setAuthor(metadata.author);
      pdfDoc.setSubject(metadata.subject);
      pdfDoc.setKeywords(metadata.keywords.split(',').map(k => k.trim()));
      pdfDoc.setModificationDate(new Date());

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
    } catch (error) {
      console.error('Error updating metadata:', error);
      alert('An error occurred while updating metadata.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Edit PDF Metadata</h1>
        <p className="text-md md:text-lg text-gray-600">Change the Title, Author, Subject, and Keywords of your PDF.</p>
      </div>
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
        {!file ? (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center"><UploadCloud className="w-12 h-12 text-gray-400 mb-4" /><p className="text-lg text-gray-600">Drag & drop a PDF here</p></div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-md mb-6">
              <div className="flex items-center"><FileText className="w-5 h-5 text-gray-500 mr-3" /><span className="font-medium text-gray-800">{file.name}</span></div>
              <button onClick={() => setFile(null)} className="text-sm text-red-500 hover:underline">Choose a different file</button>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-lg font-semibold mb-2">Title</label>
                    <input type="text" name="title" value={metadata.title} onChange={handleMetadataChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                    <label htmlFor="author" className="block text-lg font-semibold mb-2">Author</label>
                    <input type="text" name="author" value={metadata.author} onChange={handleMetadataChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                    <label htmlFor="subject" className="block text-lg font-semibold mb-2">Subject</label>
                    <input type="text" name="subject" value={metadata.subject} onChange={handleMetadataChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                    <label htmlFor="keywords" className="block text-lg font-semibold mb-2">Keywords</label>
                    <input type="text" name="keywords" value={metadata.keywords} onChange={handleMetadataChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Comma, separated, values" />
                </div>
            </div>

            <div className="flex justify-center mt-8">
              <button onClick={handleSave} disabled={isProcessing} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2">
                <Save />
                {isProcessing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
        {outputPdfUrl && (
          <div className="mt-8 text-center p-6 bg-green-50 border-green-200 rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 mb-4">Metadata Updated!</h3>
            <a href={outputPdfUrl} download={`metadata-updated-${file?.name}`} className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700">Download Updated PDF</a>
          </div>
        )}
      </div>
    </div>
  );
}