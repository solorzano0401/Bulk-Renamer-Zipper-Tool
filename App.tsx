import React, { useState, useCallback, useEffect } from 'react';
import { FileData, AppState } from './types';
import { ImageUpload } from './components/ImageUpload';
import { NamesInput } from './components/NamesInput';
import { generateFilenamesFromImage } from './services/geminiService';
import { generateAndDownloadZip } from './utils/zipUtils';
import { 
  Download, 
  Check, 
  Moon, 
  Sun, 
  Loader2, 
  FileType, 
  AlertCircle,
  Archive,
  ImageIcon,
  Scaling,
  LayoutGrid
} from 'lucide-react';

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'renamer' | 'encoder' | 'resizer'>('renamer');

  // Renamer Logic State
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [namesInput, setNamesInput] = useState<string>('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Extension State
  const [targetExtension, setTargetExtension] = useState<string>('jpg');
  const [extensionError, setExtensionError] = useState<string | null>(null);

  // Initialize Dark Mode from Local Storage or System Preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader();
    const ext = file.name.split('.').pop() || 'jpg';
    reader.onload = (e) => {
      setFileData({
        file,
        previewUrl: e.target?.result as string,
        extension: ext,
      });
      setTargetExtension(ext); // Set default extension based on uploaded file
      setExtensionError(null);
      setErrorMessage(null);
      setDownloadSuccess(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleClearFile = useCallback(() => {
    setFileData(null);
    setNamesInput('');
    setErrorMessage(null);
    setDownloadSuccess(false);
    setTargetExtension('jpg');
    setExtensionError(null);
  }, []);

  const handleExtensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Strict Validation
    if (val.length === 0) {
      setExtensionError("Requerido");
    } else if (val.length > 5) {
      setExtensionError("Máx 5 letras");
    } else if (!/^[a-zA-Z0-9]+$/.test(val)) {
      setExtensionError("Solo letras/nums");
    } else {
      setExtensionError(null);
    }

    setTargetExtension(val.toLowerCase());
  };

  const handleAutoGenerate = async () => {
    if (!fileData) return;
    
    setAppState(AppState.GENERATING_NAMES);
    setErrorMessage(null);
    setDownloadSuccess(false);
    try {
      const suggestions = await generateFilenamesFromImage(fileData.file);
      if (suggestions.length > 0) {
        setNamesInput((prev) => {
            const cleanPrev = prev.trim();
            return cleanPrev ? `${cleanPrev}\n${suggestions.join('\n')}` : suggestions.join('\n');
        });
      }
    } catch (error) {
      setErrorMessage("Error al generar nombres. Verifica tu API key.");
    } finally {
      setAppState(AppState.IDLE);
    }
  };

  const handleDownload = async () => {
    if (!fileData || !namesInput.trim() || extensionError) return;

    setAppState(AppState.PROCESSING_ZIP);
    setProgress(0);
    setErrorMessage(null);
    setDownloadSuccess(false);

    try {
      const namesList = namesInput
        .split('\n')
        .map(n => n.trim())
        .filter(n => n.length > 0);
      
      if (namesList.length === 0) {
          setErrorMessage("Por favor ingresa al menos un nombre válido.");
          setAppState(AppState.IDLE);
          return;
      }

      await generateAndDownloadZip(
        fileData.file, 
        namesList, 
        targetExtension, 
        (percent) => setProgress(Math.round(percent))
      );
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      setErrorMessage("Ocurrió un error al crear el archivo ZIP.");
    } finally {
      setAppState(AppState.IDLE);
      setProgress(0);
    }
  };

  const rawFileCount = namesInput.split('\n').filter(l => l.trim()).length;
  const totalFileCount = rawFileCount;
  const canDownload = fileData !== null && rawFileCount > 0 && appState === AppState.IDLE && !extensionError;

  // --- RENDER HELPERS ---

  const renderRenamerContent = () => (
    <div className="flex flex-col h-full">
       <div className="flex-grow w-full max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8">
        
        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border-l-2 border-red-500 rounded-r-sm">
             {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          {/* Left Column: Upload */}
          <div className="lg:col-span-4 h-full">
            <div className="flex flex-col h-full">
              <div className="flex items-center h-[34px] mb-4">
                <div className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center text-[10px] font-bold mr-2">1</div>
                <h2 className="text-xs font-bold tracking-wider uppercase text-neutral-900 dark:text-neutral-100">Imagen de Origen</h2>
              </div>
              
              <label className="text-[10px] uppercase font-semibold text-neutral-400 dark:text-neutral-500 mb-2 ml-1 block">
                Vista Previa
              </label>
              
              <div>
                <ImageUpload 
                  fileData={fileData} 
                  onFileSelect={handleFileSelect} 
                  onClear={handleClearFile} 
                />
              </div>

              {/* Extension Selector */}
              {fileData && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                   <div className="flex items-center justify-between mb-2 ml-1">
                      <label className="text-[10px] uppercase font-semibold text-neutral-400 dark:text-neutral-500">
                        Extensión de Salida
                      </label>
                      {extensionError && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                           <AlertCircle size={10} /> {extensionError}
                        </span>
                      )}
                   </div>
                  <div className={`flex items-center gap-2 bg-white dark:bg-neutral-900 border p-3 rounded-none shadow-sm transition-colors ${extensionError ? 'border-red-500 dark:border-red-500' : 'border-neutral-200 dark:border-neutral-800'}`}>
                     <div className={`p-2 rounded-full transition-colors ${extensionError ? 'bg-red-50 dark:bg-red-900/20' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
                        <FileType size={16} className={`${extensionError ? 'text-red-500' : 'text-neutral-500 dark:text-neutral-400'}`} />
                     </div>
                     <div className="flex-grow flex items-center gap-1">
                        <span className="text-neutral-400 dark:text-neutral-600 font-mono select-none">.</span>
                        <input 
                          type="text" 
                          value={targetExtension}
                          onChange={handleExtensionChange}
                          className={`w-full bg-transparent border-none focus:ring-0 text-sm font-bold font-mono p-0 placeholder:text-neutral-300 ${extensionError ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-100'}`}
                          placeholder="jpg"
                        />
                     </div>
                  </div>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-600 mt-2 leading-tight">
                    Modifica esto si deseas convertir la extensión (ej. png, webp).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Names Input */}
          <div className="lg:col-span-8 flex flex-col h-full">
             <NamesInput 
                header={
                  <div className="flex items-center h-full">
                    <div className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center text-[10px] font-bold mr-2">2</div>
                    <h2 className="text-xs font-bold tracking-wider uppercase text-neutral-900 dark:text-neutral-100">Nuevos Nombres</h2>
                  </div>
                }
                value={namesInput} 
                onChange={setNamesInput} 
                onAutoGenerate={handleAutoGenerate}
                isGenerating={appState === AppState.GENERATING_NAMES}
                hasFile={!!fileData}
                fileExtension={!extensionError ? targetExtension : '...'} 
             />
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky bottom-0 z-20 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              {totalFileCount} {totalFileCount === 1 ? 'archivo' : 'archivos'} a generar
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-600">
              {fileData ? ((fileData.file.size * totalFileCount) / 1024 / 1024).toFixed(2) : '0.00'} MB estimado
            </span>
          </div>
          
          <button
            onClick={handleDownload}
            disabled={!canDownload && !downloadSuccess}
            className={`
              relative w-full sm:w-auto min-w-[280px] overflow-hidden flex items-center justify-center gap-3 px-10 py-4 text-lg font-black tracking-wider transition-all duration-300 rounded-md shadow-xl
              ${downloadSuccess 
                ? 'bg-emerald-500 text-white shadow-emerald-200/50 dark:shadow-emerald-900/20 transform scale-105 cursor-default'
                : (canDownload || appState === AppState.PROCESSING_ZIP)
                  ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-200/50 dark:shadow-green-900/20 transform hover:-translate-y-1' 
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed shadow-none'
              }
            `}
          >
            {/* Progress Bar Background */}
            {appState === AppState.PROCESSING_ZIP && (
              <div className="absolute inset-0 bg-green-800" />
            )}
            
            {/* Progress Bar Fill */}
            {appState === AppState.PROCESSING_ZIP && (
              <div 
                className="absolute left-0 top-0 bottom-0 bg-green-500 transition-all duration-200 ease-out" 
                style={{ width: `${progress}%` }}
              />
            )}

            {/* Content */}
            <div className="relative z-10 flex items-center gap-2">
              {appState === AppState.PROCESSING_ZIP ? (
                 <>
                  <Loader2 size={20} strokeWidth={3} className="animate-spin" />
                  <span className="tabular-nums">COMPRIMIENDO... {progress}%</span>
                 </>
              ) : downloadSuccess ? (
                 <div className="flex items-center gap-2 animate-in zoom-in duration-300">
                   <Check size={28} strokeWidth={4} />
                   <span>¡DESCARGADO!</span>
                 </div>
              ) : (
                 <>
                  <Download size={24} strokeWidth={3} />
                  DESCARGAR ZIP
                 </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPlaceholder = (title: string, icon: any) => (
    <div className="flex-grow flex flex-col items-center justify-center h-full text-neutral-300 dark:text-neutral-700 p-12">
      <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-4">
        {React.createElement(icon, { size: 48, strokeWidth: 1.5 })}
      </div>
      <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">{title}</h3>
      <p className="max-w-md text-center text-neutral-500 dark:text-neutral-500">
        Esta herramienta está en desarrollo. Pronto estará disponible.
      </p>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, mobileLabel }: { id: typeof activeTab, label: string, icon: any, mobileLabel?: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
        flex items-center gap-2 px-3 md:px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 relative z-10 whitespace-nowrap flex-1 md:flex-none justify-center
        ${activeTab === id 
          ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm ring-1 ring-black/5 dark:ring-white/5' 
          : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-white/50 dark:hover:bg-neutral-800/50'
        }
      `}
    >
      <Icon size={16} strokeWidth={2} className={activeTab === id ? 'text-neutral-900 dark:text-neutral-100' : 'opacity-70'} />
      <span className="hidden md:inline">{label}</span>
      <span className="md:hidden">{mobileLabel || label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      
      {/* Header Navigation */}
      <header className="flex-shrink-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 flex flex-col md:block transition-all duration-300">
        <div className="h-16 flex items-center justify-between px-4 md:px-6 relative">
          {/* Logo Area */}
          <div className="flex items-center gap-3">
             <div className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 p-1.5 rounded-lg shadow-sm">
               <LayoutGrid size={20} strokeWidth={2.5} />
             </div>
             <div className="flex flex-col leading-none">
               <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">Tools<span className="text-neutral-400 dark:text-neutral-500">Kit</span></span>
               <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-600">v1.0.0</span>
             </div>
          </div>

          {/* Center Tabs (Desktop) */}
          <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
             <TabButton id="renamer" label="Renombrador Zip" icon={Archive} />
             <TabButton id="encoder" label="Codificador" icon={ImageIcon} />
             <TabButton id="resizer" label="Img Resizer" icon={Scaling} />
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors focus:outline-none border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
              aria-label="Toggle Dark Mode"
              title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Tabs (Bottom Row) */}
        <div className="md:hidden px-4 pb-3 w-full overflow-x-auto scrollbar-none">
           <nav className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 min-w-full">
              <TabButton id="renamer" label="Renombrador Zip" mobileLabel="Renombrador" icon={Archive} />
              <TabButton id="encoder" label="Codificador" icon={ImageIcon} />
              <TabButton id="resizer" label="Img Resizer" icon={Scaling} />
           </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
         <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800 scrollbar-track-transparent">
            {activeTab === 'renamer' && renderRenamerContent()}
            {activeTab === 'encoder' && renderPlaceholder('Codificador de Imágenes', ImageIcon)}
            {activeTab === 'resizer' && renderPlaceholder('Img Resizer', Scaling)}
         </div>
      </main>

    </div>
  );
};

export default App;