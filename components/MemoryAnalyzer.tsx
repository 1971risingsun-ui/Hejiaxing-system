
import React, { useState } from 'react';
import { Upload, Camera, Loader2, RefreshCw, Sparkle } from 'lucide-react';
import { analyzeFamilyPhoto } from '../services/geminiService';

const MemoryAnalyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const base64Data = image.split(',')[1];
      const result = await analyzeFamilyPhoto(base64Data, "");
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setAnalysis("暫時無法分析這張照片，請稍後再試。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">時光留影機</h2>
        <p className="text-sm text-gray-500 mt-2">上傳老照片或生活照，讓 AI 幫您發掘溫馨故事</p>
      </div>

      <div className="relative aspect-[4/3] bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt="Selected" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-8">
            <Camera size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-sm text-gray-400">點擊下方按鈕上傳照片</p>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <label className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-red-600 text-red-600 font-bold py-3 px-4 rounded-2xl cursor-pointer hover:bg-red-50 transition-colors">
          <Upload size={20} />
          上傳照片
          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
        </label>
        
        {image && !analysis && (
          <button 
            onClick={startAnalysis}
            disabled={isAnalyzing}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 px-4 rounded-2xl hover:bg-red-700 disabled:bg-gray-400 transition-colors shadow-lg"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Sparkle size={20} />}
            {isAnalyzing ? '正在品味回憶...' : '開始分析'}
          </button>
        )}
      </div>

      {analysis && (
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-inner animate-slideUp">
          <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
            <Sparkle size={18} />
            回憶物語：
          </h3>
          <p className="text-sm text-amber-800 leading-loose whitespace-pre-wrap">
            {analysis}
          </p>
          <button 
            onClick={() => { setImage(null); setAnalysis(null); }}
            className="mt-6 text-xs text-amber-600 flex items-center gap-1 hover:underline"
          >
            <RefreshCw size={12} />
            更換照片
          </button>
        </div>
      )}
    </div>
  );
};

export default MemoryAnalyzer;
