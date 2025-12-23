
import React, { useState } from 'react';
import { Send, Download, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { generateFamilyBlessing } from '../services/geminiService';

const BlessingGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ text: string, imageBase64: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const topics = ['週末愉快', '健康平安', '早安祝福', '勵志正能量', '家庭團圓'];

  const handleGenerate = async (selectedTopic?: string) => {
    const finalTopic = selectedTopic || topic;
    if (!finalTopic.trim()) return;
    
    setIsGenerating(true);
    setResult(null);
    try {
      const data = await generateFamilyBlessing(finalTopic);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyText = () => {
    if (result) {
      navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">溫馨祝福生成</h2>
        <p className="text-sm text-gray-500 mt-2">為親友群組製作專屬的「有溫度」長輩圖</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {topics.map(t => (
          <button
            key={t}
            onClick={() => handleGenerate(t)}
            className="px-4 py-2 rounded-full border border-red-200 text-xs text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input 
          type="text" 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="或者輸入自定義主題..."
          className="flex-1 p-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button 
          onClick={() => handleGenerate()}
          disabled={isGenerating || !topic.trim()}
          className="p-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 disabled:bg-gray-300 transition-all shadow-md"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
      </div>

      {isGenerating && (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-400">
          <Loader2 className="animate-spin" size={40} />
          <p className="text-sm font-medium animate-pulse">正在為您繪製美好時刻...</p>
        </div>
      )}

      {result && (
        <div className="space-y-4 animate-slideUp">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
            <img src={result.imageBase64} alt="Blessing card" className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center p-8 text-center">
              <p className="text-white font-calligraphy text-2xl drop-shadow-lg leading-relaxed">
                {result.text}
              </p>
            </div>
            <button className="absolute bottom-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all">
              <Download size={20} />
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">配文</span>
              <button onClick={copyText} className="flex items-center gap-1 text-xs text-red-600 font-medium">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? '已複製' : '複製文字'}
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed italic">
              「{result.text}」
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlessingGenerator;
