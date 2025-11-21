import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { User, Bot, AlertTriangle, Copy, Check, Trash2, Download, Loader2, Sparkles, Smile } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onDelete: (id: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showDownload, setShowDownload] = useState(false);
  const isUser = message.role === 'user';

  // Simulate progress for image generation
  useEffect(() => {
    let interval: any;
    if (message.isLoading && message.isImageGen) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          // Slow down as it gets higher to simulate "thinking"
          const increment = prev < 40 ? 4 : prev < 70 ? 2 : 0.5;
          return Math.min(prev + increment, 98);
        });
      }, 150);
    } else if (!message.isLoading) {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [message.isLoading, message.isImageGen]);

  const handleCopy = async () => {
    if (!message.content) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `coolboy-gen-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`flex gap-4 p-4 md:p-6 transition-colors duration-300 group ${
      isUser 
        ? 'bg-white dark:bg-[#0f0f0f]' 
        : 'bg-gray-50 dark:bg-[#161616]'
    }`}>
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300">
            <User size={18} />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/30">
            <Smile size={18} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${isUser ? 'text-gray-700 dark:text-gray-300' : 'text-purple-600 dark:text-purple-400'}`}>
              {isUser ? 'You' : 'Cool boy ☺️'}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-600">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Copy Button */}
            {!message.isLoading && message.content && (
              <button
                onClick={handleCopy}
                className={`p-1.5 rounded-md transition-all duration-200 ${
                  copied 
                    ? 'text-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'text-gray-400 hover:text-purple-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100'
                }`}
                title="Copy to clipboard"
                aria-label="Copy message text"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            )}

            {/* Delete Button */}
            <button
              onClick={() => onDelete(message.id)}
              className="p-1.5 rounded-md transition-all duration-200 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100"
              title="Delete message"
              aria-label="Delete message"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Text Content */}
        {message.content && (
          <div className="prose prose-sm max-w-none leading-relaxed 
            text-gray-800 dark:text-gray-300 
            prose-strong:text-gray-900 dark:prose-strong:text-gray-100 
            prose-code:text-pink-600 dark:prose-code:text-pink-400
            prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800
            prose-pre:text-gray-800 dark:prose-pre:text-gray-200
            prose-a:text-blue-600 dark:prose-a:text-blue-400
          ">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {/* User Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {message.attachments.map((att, idx) => (
              <div key={idx} className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-w-xs">
                <img 
                  src={`data:${att.mimeType};base64,${att.data}`} 
                  alt="Attachment" 
                  className="max-h-48 object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Generated Image Output */}
        {message.imageOutput && (
          <div className="mt-4 relative group/image inline-block max-w-md w-full animate-in fade-in duration-500">
            <div 
              className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-2xl shadow-purple-900/10 relative cursor-pointer"
              onClick={() => setShowDownload(!showDownload)}
            >
              <img 
                src={message.imageOutput} 
                alt="Generated Art" 
                className="w-full h-auto block"
              />
              
              {/* Conditional Download Button - Appears on Click */}
              {showDownload && (
                <div className="absolute bottom-3 right-3 z-10 animate-in fade-in zoom-in duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(message.imageOutput!);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-black/80 hover:bg-white dark:hover:bg-black text-gray-900 dark:text-white rounded-full shadow-lg backdrop-blur-sm transition-all transform hover:scale-105 active:scale-95 font-medium text-xs sm:text-sm border border-gray-200 dark:border-gray-700"
                    title="Download Image"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>
            {/* Hint for user to click */}
            <div className="text-center mt-1 opacity-0 group-hover/image:opacity-100 transition-opacity text-[10px] text-gray-400">
              Click image to download
            </div>
          </div>
        )}

        {/* Loading States */}
        {message.isLoading && (
           <div className="mt-3">
             {message.isImageGen ? (
               <div className="w-full max-w-sm space-y-2">
                 {/* Visual Progress Bar */}
                 <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700 shadow-inner relative">
                   <div 
                     className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(168,85,247,0.5)] relative"
                     style={{ width: `${progress}%` }}
                   >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_1s_infinite] transform skew-x-12" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
                   </div>
                 </div>
                 
                 <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium animate-pulse">
                      <Sparkles size={12} />
                      <span>Cooking up magic...</span>
                    </div>
                    <span className="font-mono text-gray-500 dark:text-gray-500">{Math.round(progress)}%</span>
                 </div>
               </div>
             ) : (
               <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full w-fit animate-in fade-in duration-300 border border-gray-200 dark:border-gray-700">
                 <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
             )}
           </div>
        )}

        {/* Error State */}
        {message.error && (
          <div className="mt-2 flex items-start gap-2 text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/10 p-3 rounded border border-red-100 dark:border-red-900/30 animate-in fade-in">
             <AlertTriangle size={18} className="mt-0.5 shrink-0" />
             <div className="flex flex-col gap-1">
               <span className="font-medium">Oops!</span>
               <span>{message.errorMessage || "Something glitched. Try again."}</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;