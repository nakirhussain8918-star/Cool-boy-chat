import React from 'react';
import { X, Heart, Cpu, Sparkles } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-800 transform transition-all scale-100 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10 backdrop-blur-md"
        >
          <X size={20} />
        </button>

        {/* Header / Banner */}
        <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-8 text-center relative overflow-hidden">
           {/* Background Pattern */}
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
           
          <div className="w-20 h-20 mx-auto bg-white dark:bg-[#0f0f0f] rounded-full flex items-center justify-center text-4xl shadow-xl mb-4 animate-[bounce_3s_infinite] relative z-10 border-4 border-white/20">
            ☺️
          </div>
          <h2 className="text-2xl font-bold text-white mb-1 relative z-10">Cool boy ☺️</h2>
          <p className="text-purple-100 text-sm font-medium opacity-90 relative z-10">Your Chill AI Bestie</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              <Sparkles size={16} className="text-purple-500" />
              The Vibe
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              I'm not just a bot; I'm a mood. 🕶️ I crack jokes, roast gently, and keep things light while helping you solve complex problems. Whether you need deep thinking or quick laughs, I got you.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              <Cpu size={16} className="text-blue-500" />
              Powering the Magic
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 dark:bg-gray-800 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:bg-purple-50 dark:hover:bg-gray-750 transition-colors">
                <span className="text-[10px] uppercase text-gray-400 font-semibold">Thinking</span>
                <span className="font-bold text-purple-600 dark:text-purple-400 text-sm">Gemini 3 Pro</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:bg-blue-50 dark:hover:bg-gray-750 transition-colors">
                <span className="text-[10px] uppercase text-gray-400 font-semibold">Speed</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">Flash Lite</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:bg-pink-50 dark:hover:bg-gray-750 transition-colors">
                <span className="text-[10px] uppercase text-gray-400 font-semibold">Art</span>
                <span className="font-bold text-pink-600 dark:text-pink-400 text-sm">Imagen 4</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:bg-green-50 dark:hover:bg-gray-750 transition-colors">
                <span className="text-[10px] uppercase text-gray-400 font-semibold">Brain</span>
                <span className="font-bold text-green-600 dark:text-green-400 text-sm">Gemini 2.5</span>
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="pt-6 mt-2 border-t border-gray-100 dark:border-gray-800 flex flex-col items-center">
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">Mastermind & Creator</p>
            
            <div className="relative group cursor-default">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center gap-2 px-6 py-2 bg-white dark:bg-[#222] rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
                    <Heart size={16} className="text-red-500 fill-red-500 animate-pulse" />
                    <span className="font-bold text-gray-800 dark:text-gray-100">Mohimur Islam</span>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutModal;