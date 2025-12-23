
import React from 'react';
import { MessageCircle, Camera, Sparkles, ChevronRight, BookOpen } from 'lucide-react';
import { AppView } from '../types';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
        <h2 className="text-xl font-bold text-orange-900 mb-2">早安，全家人</h2>
        <p className="text-sm text-orange-700 leading-relaxed">
          「家是避風港，也是力量的源泉。」今天有什麼想與 AI 分享或諮詢的嗎？
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-2 gap-4">
        <FeatureCard 
          icon={<MessageCircle className="text-blue-600" size={28} />}
          title="家庭諮詢師"
          desc="解決家事大小難題"
          color="bg-blue-50"
          onClick={() => onNavigate(AppView.CHAT)}
        />
        <FeatureCard 
          icon={<Camera className="text-purple-600" size={28} />}
          title="老照片回憶"
          desc="AI 說出泛黃的故事"
          color="bg-purple-50"
          onClick={() => onNavigate(AppView.MEMORY_ANALYZER)}
        />
        <FeatureCard 
          icon={<Sparkles className="text-red-600" size={28} />}
          title="長輩祝福語"
          desc="一鍵生成精美賀卡"
          color="bg-red-50"
          onClick={() => onNavigate(AppView.BLESSING_GENERATOR)}
        />
        <FeatureCard 
          icon={<BookOpen className="text-green-600" size={28} />}
          title="家族傳承"
          desc="記錄珍貴的家訓"
          color="bg-green-50"
          onClick={() => {}} // Placeholder for extension
        />
      </div>

      {/* Inspiration Quote */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-red-600 to-rose-500 text-white shadow-md">
        <p className="font-calligraphy text-2xl mb-4 italic text-center">
          「合家團圓，興旺昌盛」
        </p>
        <p className="text-xs opacity-90 text-center leading-loose">
          這不僅是名字，更是我們對每一個家庭最真摯的祝願。透過 AI 的智慧，讓傳統與科技共鳴。
        </p>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, color: string, onClick: () => void }> = ({ icon, title, desc, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`${color} p-4 rounded-2xl flex flex-col items-start gap-2 text-left border border-transparent hover:border-white hover:shadow-lg transition-all active:scale-95`}
  >
    {icon}
    <div>
      <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
      <p className="text-[10px] text-gray-500">{desc}</p>
    </div>
    <ChevronRight size={14} className="mt-auto ml-auto text-gray-400" />
  </button>
);

export default Dashboard;
