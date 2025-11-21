import React, { useState, useCallback } from 'react';
import { FileData, AppState } from './types';
import { ImageUpload } from './components/ImageUpload';
import { NamesInput } from './components/NamesInput';
import { generateFilenamesFromImage } from './services/geminiService';
import { generateAndDownloadZip } from './utils/zipUtils';
import { Download, FileArchive, Info } from 'lucide-react';

const App: React.FC = () => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [namesInput, setNamesInput] = useState<string>('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileData({
        file,
        previewUrl: e.target?.result as string,
        extension: file.name.split('.').pop() || 'jpg',
      });
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleClearFile = useCallback(() => {
    setFileData(null);
    setNamesInput('');
    setErrorMessage(null);
  }, []);

  const handleAutoGenerate = async () => {
    if (!fileData) return;
    
    setAppState(AppState.GENERATING_NAMES);
    setErrorMessage(null);
    try {
      const suggestions = await generateFilenamesFromImage(fileData.file);
      if (suggestions.length > 0) {
        setNamesInput((prev) => {
            const cleanPrev = prev.trim();
            return cleanPrev ? `${cleanPrev}\n${suggestions.join('\n')}` : suggestions.join('\n');
        });
      }
    } catch (error) {
      setErrorMessage("Failed to generate names. Please check your API key or try again.");
    } finally {
      setAppState(AppState.IDLE);
    }
  };

  const handleDownload = async () => {
    if (!fileData || !namesInput.trim()) return;

    setAppState(AppState.PROCESSING_ZIP);
    setErrorMessage(null);
    try {
      const namesList = namesInput
        .split('\n')
        .map(n => n.trim())
        .filter(n => n.length > 0);
      
      if (namesList.length === 0) {
          setErrorMessage("Please enter at least one valid filename.");
          setAppState(AppState.IDLE);
          return;
      }

      await generateAndDownloadZip(fileData.file, namesList, fileData.extension);
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred while creating the ZIP file.");
    } finally {
      setAppState(AppState.IDLE);
    }
  };

  const fileCount = namesInput.split('\n').filter(l => l.trim()).length;
  const canDownload = fileData !== null && fileCount > 0 && appState === AppState.IDLE;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <FileArchive className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Zip<span className="text-indigo-600">Genie</span>
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Info size={14} />
              Client-side processing only
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm animate-fade-in">
             <Info size={18} className="shrink-0" />
             {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full">
          {/* Left Column: Upload */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">1. Source Image</h2>
              <ImageUpload 
                fileData={fileData} 
                onFileSelect={handleFileSelect} 
                onClear={handleClearFile} 
              />
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Upload the image you want to replicate. We will create copies of this file inside the generated ZIP archive.
              </p>
            </div>
            
            {/* Desktop Helper for AI */}
            <div className="hidden md:block bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                <h3 className="font-semibold mb-2 relative z-10">Need Ideas?</h3>
                <p className="text-indigo-100 text-sm relative z-10 mb-4">
                   Use our AI Magic to automatically analyze your image and suggest SEO-friendly filenames instantly.
                </p>
                <button 
                    onClick={handleAutoGenerate}
                    disabled={!fileData || appState !== AppState.IDLE}
                    className="relative z-10 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Try AI Suggestions
                </button>
            </div>
          </div>

          {/* Right Column: Names Input */}
          <div className="md:col-span-7 flex flex-col h-full">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-grow flex flex-col">
              <div className="mb-1">
                  <h2 className="text-lg font-semibold text-slate-800">2. Target Filenames</h2>
                  <p className="text-sm text-slate-500 mb-4">Enter the list of names for the new files (one per line).</p>
              </div>
              <div className="flex-grow min-h-[300px]">
                 <NamesInput 
                    value={namesInput} 
                    onChange={setNamesInput} 
                    onAutoGenerate={handleAutoGenerate}
                    isGenerating={appState === AppState.GENERATING_NAMES}
                    hasFile={!!fileData}
                 />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Sticky Action Bar */}
      <div className="bg-white border-t border-slate-200 sticky bottom-0 z-20 pb-safe">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-900">
              {fileCount} {fileCount === 1 ? 'file' : 'files'} ready
            </p>
            <p className="text-xs text-slate-500">
              Total estimated size: {fileData ? ((fileData.file.size * fileCount) / 1024 / 1024).toFixed(2) : '0.00'} MB
            </p>
          </div>
          
          <button
            onClick={handleDownload}
            disabled={!canDownload}
            className={`
              w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95
              ${canDownload 
                ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-600/30' 
                : 'bg-slate-300 cursor-not-allowed shadow-none'
              }
            `}
          >
            {appState === AppState.PROCESSING_ZIP ? (
               <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Zipping...
               </>
            ) : (
               <>
                <Download size={20} />
                Download ZIP
               </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
