
import React from 'react';
import { Home, MessageSquare, Image, Heart, Settings } from 'lucide-react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  onViewChange: (view: AppView) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto bg-white shadow-xl relative overflow-hidden">
      {/* Header */}
      <header className="bg-red-700 text-white p-6 rounded-b-3xl shadow-lg z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-calligraphy font-bold tracking-wider">合家興</h1>
            <p className="text-xs opacity-80 mt-1 font-light italic">讓愛與智慧，代代相傳</p>
          </div>
          <div className="p-2 bg-red-600 rounded-full cursor-pointer hover:bg-red-500 transition-colors">
            <Heart size={20} fill="white" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 p-4">
        {children}
      </main>

      {/* Sticky Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white/90 backdrop-blur-md border-t border-red-50 px-6 py-3 flex justify-between items-center z-20">
        <NavButton 
          icon={<Home size={24} />} 
          label="首頁" 
          active={activeView === AppView.DASHBOARD} 
          onClick={() => onViewChange(AppView.DASHBOARD)} 
        />
        <NavButton 
          icon={<MessageSquare size={24} />} 
          label="家庭諮詢" 
          active={activeView === AppView.CHAT} 
          onClick={() => onViewChange(AppView.CHAT)} 
        />
        <NavButton 
          icon={<Image size={24} />} 
          label="回憶分析" 
          active={activeView === AppView.MEMORY_ANALYZER} 
          onClick={() => onViewChange(AppView.MEMORY_ANALYZER)} 
        />
        <NavButton 
          icon={<Heart size={24} />} 
          label="每日祝福" 
          active={activeView === AppView.BLESSING_GENERATOR} 
          onClick={() => onViewChange(AppView.BLESSING_GENERATOR)} 
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-red-700 scale-110' : 'text-gray-400 hover:text-red-300'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default Layout;
