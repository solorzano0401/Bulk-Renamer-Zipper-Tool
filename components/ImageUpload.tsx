import React, { useCallback, useState, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { FileData } from '../types';

interface ImageUploadProps {
  fileData: FileData | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ fileData, onFileSelect, onClear }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Reset processing state when fileData updates (image loaded)
  useEffect(() => {
    if (fileData) {
      setIsProcessing(false);
    }
  }, [fileData]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          setIsProcessing(true);
          // Defer call slightly to allow UI to render loader
          requestAnimationFrame(() => {
             onFileSelect(file);
          });
        }
      }
    },
    [onFileSelect]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsProcessing(true);
      onFileSelect(e.target.files[0]);
    }
  };

  if (fileData) {
    return (
      <div className="relative w-full h-[500px] bg-neutral-50 dark:bg-neutral-900 rounded-none border border-neutral-200 dark:border-neutral-800 overflow-hidden group">
        <img
          src={fileData.previewUrl}
          alt="Preview"
          className="w-full h-full object-contain p-6 opacity-90"
        />
        <div className="absolute inset-0 bg-white/80 dark:bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={onClear}
            className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full flex items-center gap-2 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors text-sm font-medium"
          >
            <X size={16} />
            Eliminar imagen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        w-full h-[500px] rounded-none border border-dashed transition-all cursor-pointer flex flex-col items-center justify-center group
        ${isDragOver 
          ? 'border-black dark:border-white bg-neutral-50 dark:bg-neutral-800' 
          : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800'
        }
      `}
    >
      {isProcessing ? (
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
           <Loader2 className="w-8 h-8 text-neutral-400 dark:text-neutral-500 animate-spin mb-3" />
           <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Procesando imagen...</p>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
          <div className={`p-4 rounded-full mb-2 transition-transform duration-300 ${isDragOver ? 'scale-110' : 'group-hover:scale-110'}`}>
            <Upload 
               className={`w-8 h-8 transition-colors ${isDragOver ? 'text-black dark:text-white' : 'text-neutral-300 dark:text-neutral-600 group-hover:text-black dark:group-hover:text-white'}`} 
               strokeWidth={1.5} 
            />
          </div>
          <p className={`text-sm font-medium mb-1 transition-colors ${isDragOver ? 'text-black dark:text-white' : 'text-neutral-900 dark:text-neutral-300'}`}>
             {isDragOver ? 'Suelta la imagen aquí' : 'Sube tu imagen'}
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-600">Arrastra o haz clic para explorar</p>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleInputChange}
          />
        </label>
      )}
    </div>
  );
};