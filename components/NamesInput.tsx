import React from 'react';
import { Sparkles, List, AlertCircle } from 'lucide-react';

interface NamesInputProps {
  value: string;
  onChange: (value: string) => void;
  onAutoGenerate: () => void;
  isGenerating: boolean;
  hasFile: boolean;
}

export const NamesInput: React.FC<NamesInputProps> = ({ 
  value, 
  onChange, 
  onAutoGenerate, 
  isGenerating,
  hasFile 
}) => {
  const lineCount = value.split('\n').filter(line => line.trim() !== '').length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <List className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-800">Target Filenames</h2>
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
          {lineCount} {lineCount === 1 ? 'file' : 'files'}
        </span>
      </div>

      <div className="relative flex-grow">
        <textarea
          className="w-full h-64 md:h-full p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none font-mono leading-relaxed shadow-sm transition-all"
          placeholder={`Enter names here, one per line...\n\nExample:\nsummer-vacation-01\nbeach-sunset\nfamily-photo`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        
        {!hasFile && (
           <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl pointer-events-none">
             <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2 text-slate-500 text-sm">
               <AlertCircle size={16} />
               Upload an image first
             </div>
           </div>
        )}
      </div>

      <div className="mt-3 flex justify-end">
        <button
          onClick={onAutoGenerate}
          disabled={!hasFile || isGenerating}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${!hasFile 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : isGenerating
                ? 'bg-indigo-50 text-indigo-400 cursor-wait'
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700'
            }
          `}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Suggest Names with AI
            </>
          )}
        </button>
      </div>
    </div>
  );
};
