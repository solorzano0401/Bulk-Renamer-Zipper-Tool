import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { FileData } from '../types';

interface ImageUploadProps {
  fileData: FileData | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ fileData, onFileSelect, onClear }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (fileData) {
    return (
      <div className="relative w-full h-64 bg-slate-100 rounded-xl border-2 border-slate-200 overflow-hidden group shadow-sm">
        <img
          src={fileData.previewUrl}
          alt="Preview"
          className="w-full h-full object-contain p-4"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={onClear}
            className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/20 transition-colors"
          >
            <X size={18} />
            Remove Image
          </button>
        </div>
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-slate-600 text-xs px-2 py-1 rounded-md font-medium shadow-sm">
          {fileData.file.type.split('/')[1].toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="w-full h-64 bg-white rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer flex flex-col items-center justify-center group shadow-sm"
    >
      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
        <div className="p-4 bg-slate-100 rounded-full group-hover:bg-indigo-100 transition-colors mb-3">
          <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </div>
        <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF</p>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleInputChange}
        />
      </label>
    </div>
  );
};
