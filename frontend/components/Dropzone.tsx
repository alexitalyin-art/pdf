'use client';

import { UploadCloud } from 'lucide-react';

interface DropzoneProps {
  getRootProps: any;
  getInputProps: any;
  isDragActive: boolean;
}

export const Dropzone = ({ getRootProps, getInputProps, isDragActive }: DropzoneProps) => {
  return (
    <div
      {...getRootProps()}
      className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center">
        <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-lg text-blue-600">Drop the files here ...</p>
        ) : (
          <p className="text-lg text-gray-600">Drag & drop files here, or click to select files</p>
        )}
      </div>
    </div>
  );
};