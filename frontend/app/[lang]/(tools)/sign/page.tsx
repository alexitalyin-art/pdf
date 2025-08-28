'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { UploadCloud, Loader2, Edit, Save, Trash2, Move, XCircle, ImageUp, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';
import SignatureCanvas from 'react-signature-canvas';
import { Rnd } from 'react-rnd';

const PDFCarouselViewer = dynamic(() => import('@/components/PDFCarouselViewer').then(mod => mod.PDFCarouselViewer), {
  ssr: false,
  loading: () => <div className="text-center py-20"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" /><p className="mt-4">Loading Viewer...</p></div>,
});

interface PlacedSignature {
  id: number;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  imgDataUrl: string;
}

export default function SignPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [placedSignatures, setPlacedSignatures] = useState<PlacedSignature[]>([]);
  const [isSigning, setIsSigning] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  const [sigMode, setSigMode] = useState<'draw' | 'upload'>('draw');
  const [uploadedSig, setUploadedSig] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setOutputPdfUrl(null);
      setSignatureDataUrl(null);
      setPlacedSignatures([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { 'application/pdf': ['.pdf'] } });

  const openSignatureModal = (mode: 'draw' | 'upload') => {
    setSigMode(mode);
    setIsSigning(true);
  };

  const clearSignature = () => sigCanvas.current?.clear();
  
  const saveSignature = () => {
    if (sigMode === 'draw') {
      const signaturePad = sigCanvas.current;
      if (!signaturePad || signaturePad.isEmpty()) return alert("Please draw a signature first.");
      const dataUrl = signaturePad.toDataURL('image/png');
      setSignatureDataUrl(dataUrl);
    } else {
      if (!uploadedSig) return alert("Please upload a signature image first.");
      setSignatureDataUrl(uploadedSig);
    }
    setIsSigning(false);
  };
  
  const handleReset = () => {
    setSignatureDataUrl(null);
    setPlacedSignatures([]);
    setUploadedSig(null);
    if(sigCanvas.current) {
        sigCanvas.current.clear();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setUploadedSig(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addSignatureToPage = () => {
    if (!signatureDataUrl) return;
    const newSignature: PlacedSignature = { id: Date.now(), page: currentPage, x: 50, y: 50, width: 150, height: 75, imgDataUrl: signatureDataUrl };
    setPlacedSignatures(prev => [...prev, newSignature]);
  };

  const deleteSignature = (idToDelete: number) => setPlacedSignatures(prev => prev.filter(sig => sig.id !== idToDelete));
  const updateSignaturePosition = (id: number, x: number, y: number) => setPlacedSignatures(prev => prev.map(sig => sig.id === id ? { ...sig, x, y } : sig));
  const updateSignatureSize = (id: number, width: number, height: number, x: number, y: number) => setPlacedSignatures(prev => prev.map(sig => sig.id === id ? { ...sig, width, height, x, y } : sig));

  const handleApplySignatures = async () => {
    if (!file || placedSignatures.length === 0) return alert('Please place at least one signature.');
    setIsProcessing(true);
    setOutputPdfUrl(null);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const viewerWidth = viewerContainerRef.current?.clientWidth || 600;

      for (const sig of placedSignatures) {
        const page = pdfDoc.getPage(sig.page - 1);
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        const pagePreviewInViewer = await (await pdfjsLib.getDocument({data: existingPdfBytes}).promise).getPage(sig.page);
        const scale = pageWidth / pagePreviewInViewer.getViewport({scale:1.0}).width;
        
        const sigImage = sig.imgDataUrl.startsWith('data:image/jpeg')
          ? await pdfDoc.embedJpg(sig.imgDataUrl)
          : await pdfDoc.embedPng(sig.imgDataUrl);
        
        page.drawImage(sigImage, {
          x: sig.x * scale,
          y: pageHeight - (sig.y * scale) - (sig.height * scale),
          width: sig.width * scale,
          height: sig.height * scale,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
    } catch (error) {
      console.error('Error applying signatures:', error);
      alert('An error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Sign PDF</h1>
        <p className="text-md md:text-lg text-gray-600">Draw, upload, and place your signature on the document.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-5xl mx-auto">
        {!file ? (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center"><UploadCloud className="w-12 h-12 text-gray-400 mb-4" /><p className="text-lg text-gray-600">Drag & drop a PDF here</p></div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow lg:w-2/3 relative" ref={viewerContainerRef}>
              <PDFCarouselViewer file={file} currentPage={currentPage} onPageChange={setCurrentPage} onPdfLoad={(pdf) => setTotalPages(pdf.numPages)} />
              {placedSignatures.filter(sig => sig.page === currentPage).map(sig => (
                <Rnd key={sig.id} size={{ width: sig.width, height: sig.height }} position={{ x: sig.x, y: sig.y }} onDragStop={(e, d) => updateSignaturePosition(sig.id, d.x, d.y)} onResizeStop={(e, direction, ref, delta, position) => updateSignatureSize(sig.id, parseFloat(ref.style.width), parseFloat(ref.style.height), position.x, position.y)} className="border-2 border-dashed border-blue-500 group">
                  <img src={sig.imgDataUrl} alt="signature" className="w-full h-full" />
                  <button onClick={() => deleteSignature(sig.id)} className="absolute -top-3 -right-3 z-10 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><XCircle size={20} /></button>
                </Rnd>
              ))}
            </div>
            <div className="lg:w-1/3 flex flex-col items-center">
              {!signatureDataUrl ? (
                <div className="w-full space-y-3">
                    <button onClick={() => openSignatureModal('draw')} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 w-full flex items-center justify-center gap-2"><Edit /> Draw Signature</button>
                    <button onClick={() => openSignatureModal('upload')} className="bg-gray-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-700 w-full flex items-center justify-center gap-2"><ImageUp /> Upload Signature</button>
                </div>
              ) : (
                <div className="w-full text-center">
                  <h3 className="text-lg font-semibold mb-2">Your Signature</h3>
                  <div className="p-2 bg-gray-100 border rounded-lg"><img src={signatureDataUrl} alt="Your saved signature" className="mx-auto" /></div>
                  <button onClick={() => openSignatureModal(sigMode)} className="text-sm text-blue-500 hover:underline mt-2">Change</button>
                  <button onClick={addSignatureToPage} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 w-full flex items-center justify-center gap-2 mt-4"><Move /> Place on Page</button>
                </div>
              )}
              <div className="w-full mt-auto pt-4">
                <button onClick={handleReset} disabled={!signatureDataUrl && placedSignatures.length === 0} className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 w-full flex items-center justify-center gap-2 mb-3">
                    <RotateCcw /> Reset
                </button>
                <button onClick={handleApplySignatures} disabled={isProcessing || placedSignatures.length === 0} className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 w-full flex items-center justify-center gap-2">
                  <Save /> Apply Signatures & Download
                </button>
              </div>
            </div>
          </div>
        )}
        {isSigning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">{sigMode === 'draw' ? 'Draw your signature' : 'Upload your signature'}</h2>
              {sigMode === 'draw' && (
                <div>
                  <div className="bg-gray-200 border border-gray-400 rounded"><SignatureCanvas ref={sigCanvas} canvasProps={{ width: 400, height: 200, className: 'sigCanvas w-full' }} /></div>
                  <button onClick={clearSignature} className="font-semibold text-blue-600 float-right mt-2">Clear</button>
                </div>
              )}
              {sigMode === 'upload' && (
                <div className="flex flex-col items-center justify-center h-[200px]">
                  <input type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} className="mb-4 p-2 border rounded" />
                  {uploadedSig && <img src={uploadedSig} alt="Signature preview" className="max-h-24 border" />}
                </div>
              )}
              <div className="flex justify-between mt-6 pt-4 border-t">
                <button onClick={() => setIsSigning(false)} className="text-gray-600 font-semibold">Cancel</button>
                <button onClick={saveSignature} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700">Save Signature</button>
              </div>
            </div>
          </div>
        )}
        {outputPdfUrl && (
          <div className="mt-8 text-center p-6 bg-green-50 border-green-200 rounded-lg">
            <h3 className="text-2xl font-semibold text-green-800 mb-4">Your Signed PDF is Ready!</h3>
            <a href={outputPdfUrl} download={`signed-${file?.name}`} className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700">Download Signed PDF</a>
          </div>
        )}
      </div>
    </div>
  );
}