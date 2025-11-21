import React from 'react';
import { Mic, X, ShieldCheck } from 'lucide-react';

interface VoicePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const VoicePermissionModal: React.FC<VoicePermissionModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 dark:border-gray-800 relative transform transition-all scale-100">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="p-8 flex flex-col items-center text-center space-y-6 relative z-0">
          
          {/* Animated Icon Container */}
          <div className="relative mt-4">
             <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
             <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/30 relative group cursor-pointer transition-transform hover:scale-105 duration-300">
                <Mic size={40} className="text-white" />
                
                {/* Ripple Animations */}
                <div className="absolute w-full h-full border-2 border-purple-500/40 rounded-full animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                <div className="absolute w-full h-full border-2 border-indigo-500/40 rounded-full animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite_0.8s]"></div>
             </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Enable Voice Chat</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed px-2">
              Cool boy ☺️ wants to hear you! Enable microphone access to chat hands-free and vibe with the AI.
            </p>
          </div>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-800">
            <ShieldCheck size={12} className="text-green-500" />
            <span>Private & Secure Connection</span>
          </div>

          {/* Action Button */}
          <div className="w-full space-y-3 pt-2">
            <button 
              onClick={onConfirm}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-purple-900/20 transform transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group"
            >
              <span>Let's Talk</span>
              <Mic size={18} className="group-hover:animate-bounce" />
            </button>
            
            <button 
              onClick={onClose}
              className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors pb-2"
            >
              Maybe later
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VoicePermissionModal;