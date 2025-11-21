import React, { useState, useRef, useEffect } from 'react';
import { ChatMode, Attachment, AspectRatio } from '../types';
import { Send, Paperclip, X, Zap, Brain, Image as ImageIcon, MessageSquare, Mic, Square, RectangleHorizontal, RectangleVertical, Wand2, Sparkles, ChevronDown, Check, StopCircle, History, Monitor, Tablet, Palette, Maximize2 } from 'lucide-react';
import { enhancePrompt } from '../services/geminiService';
import VoicePermissionModal from './VoicePermissionModal';

interface ChatInputProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  onSendMessage: (text: string, mode: ChatMode, attachments: Attachment[], aspectRatio?: AspectRatio, resolution?: string) => void;
  onStopGeneration?: () => void;
  isLoading: boolean;
}

const IMAGE_SUGGESTIONS = [
  { label: "Cyberpunk City", prompt: "A futuristic city at night, drenched in neon rain, towering skyscrapers with holographic advertisements, cyberpunk atmosphere, cinematic lighting, photorealistic, 8k." },
  { label: "Bioluminescent Forest", prompt: "Enchanted forest at night, glowing mushrooms and plants, bioluminescent blue and purple light, fireflies, magical atmosphere, 3D render style." },
  { label: "Knitted Cat", prompt: "A close-up macro shot of a tiny cat made of knitted wool, sitting on a wooden table, soft warm lighting, cozy atmosphere, shallow depth of field." },
  { label: "Epic Fantasy", prompt: "A majestic dragon perched on a crumbling castle spire, sunset background, volumetric lighting, digital fantasy art, highly detailed scales." },
  { label: "Abstract Fluid", prompt: "Swirling colorful fluids, ink in water, macro photography, vibrant orange and blue contrast, abstract art, 4k wallpaper." },
  { label: "Isometric Room", prompt: "Isometric view of a cozy gamer room, neon lighting, detailed computer setup, plants, posters, low poly 3D style." }
];

const MODEL_OPTIONS = [
  {
    id: ChatMode.STANDARD,
    label: 'Gemini 2.5 Flash',
    description: 'Balanced speed and intelligence',
    icon: MessageSquare
  },
  {
    id: ChatMode.FAST,
    label: 'Flash Lite',
    description: 'Lightning fast responses',
    icon: Zap
  },
  {
    id: ChatMode.THINKING,
    label: 'Gemini 3 Pro',
    description: 'Deep reasoning & complex tasks',
    icon: Brain
  },
  {
    id: ChatMode.IMAGE_GEN,
    label: 'Imagen 4',
    description: 'High-quality image generation',
    icon: ImageIcon
  }
];

const ASPECT_OPTIONS = [
  { val: '1:1', icon: Square, label: 'Square (1:1)', desc: '1:1' },
  { val: '16:9', icon: RectangleHorizontal, label: 'Wide (16:9)', desc: '16:9' },
  { val: '9:16', icon: RectangleVertical, label: 'Tall (9:16)', desc: '9:16' },
  { val: '4:3', icon: Monitor, label: 'Standard (4:3)', desc: '4:3' },
  { val: '3:4', icon: Tablet, label: 'Portrait (3:4)', desc: '3:4' }
];

const RESOLUTION_OPTIONS = [
  { val: '1024x1024', label: '1024px' },
  { val: '512x512', label: '512px' },
  { val: '256x256', label: '256px' },
];

const IMAGE_STYLES = [
  { id: 'cartoon', label: 'Cartoon' },
  { id: 'none', label: 'No Style' },
  { id: 'photorealistic', label: 'Photorealistic' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'anime', label: 'Anime' },
  { id: 'fantasy-art', label: 'Fantasy Art' },
  { id: 'digital-art', label: 'Digital Art' },
  { id: '3d-render', label: '3D Render' },
  { id: 'oil-painting', label: 'Oil Painting' },
  { id: 'sketch', label: 'Pencil Sketch' },
  { id: 'isometric', label: 'Isometric' },
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'pixel-art', label: 'Pixel Art' },
  { id: 'pop-art', label: 'Pop Art' },
];

const ChatInput: React.FC<ChatInputProps> = ({ mode, onModeChange, onSendMessage, onStopGeneration, isLoading }) => {
  const [text, setText] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [resolution, setResolution] = useState('1024x1024');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  
  // Image Gen Features
  const [selectedStyle, setSelectedStyle] = useState('none');
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [isResMenuOpen, setIsResMenuOpen] = useState(false);
  
  // Prompt History State
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [showHistory, setShowHistory] = useState(false);

  // Voice Permission Modal State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyMenuRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [text]);

  // Load History from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chat_prompt_history');
      if (saved) setPromptHistory(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load prompts", e);
    }
  }, []);

  // Save History to LocalStorage
  useEffect(() => {
    localStorage.setItem('chat_prompt_history', JSON.stringify(promptHistory));
  }, [promptHistory]);

  // Click outside to close history/style menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyMenuRef.current && !historyMenuRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
      if (isStyleMenuOpen && !(event.target as Element).closest('.style-selector')) {
        setIsStyleMenuOpen(false);
      }
       if (isResMenuOpen && !(event.target as Element).closest('.res-selector')) {
        setIsResMenuOpen(false);
      }
    };
    if (showHistory || isStyleMenuOpen || isResMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHistory, isStyleMenuOpen, isResMenuOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = (event.target?.result as string).split(',')[1];
        setAttachments(prev => [...prev, {
          name: file.name,
          mimeType: file.type,
          data: base64String
        }]);
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    
    const trimmedText = text.trim();

    if (trimmedText) {
      setPromptHistory(prev => {
         const filtered = prev.filter(p => p !== trimmedText);
         return [trimmedText, ...filtered].slice(0, 50);
      });
    }
    
    let finalPrompt = text;
    if (mode === ChatMode.IMAGE_GEN && selectedStyle !== 'none') {
      const styleLabel = IMAGE_STYLES.find(s => s.id === selectedStyle)?.label;
      if (styleLabel) {
        finalPrompt = text ? `${text}, in ${styleLabel} style` : `Generate an image in ${styleLabel} style`;
      }
    }

    onSendMessage(finalPrompt, mode, attachments, aspectRatio, resolution);
    setText('');
    setAttachments([]);
    setHistoryIndex(-1);
    setShowHistory(false);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
      return;
    }
    if (e.key === 'ArrowUp') {
      if (!text || historyIndex >= 0) {
        if (historyIndex < promptHistory.length - 1) {
          e.preventDefault();
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setText(promptHistory[newIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex >= 0) {
        e.preventDefault();
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        if (newIndex === -1) {
          setText('');
        } else {
          setText(promptHistory[newIndex]);
        }
      }
    }
  };

  const selectHistoryItem = (item: string) => {
    setText(item);
    setShowHistory(false);
    setHistoryIndex(-1); 
  };

  const handleEnhance = async () => {
    if (isEnhancing) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(text);
      setText(enhanced);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnhancing(false);
    }
  };

  // ---- Core Logic for Starting Speech Recognition ----
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText(prev => prev + (prev ? ' ' : '') + transcript);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Recognition start failed", e);
      setIsListening(false);
    }
  };

  // ---- Handle User Click on Mic ----
  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    // Check if we already asked the user nicely
    const hasAsked = localStorage.getItem('coolboy_mic_intro_shown');
    
    if (!hasAsked) {
      // First time? Show the fancy professional modal
      setIsVoiceModalOpen(true);
    } else {
      // Experienced user? Just start listening (browser native prompt may still appear if not granted)
      startListening();
    }
  };

  // ---- Handle Confirmation from Modal ----
  const handleVoiceConfirm = () => {
    localStorage.setItem('coolboy_mic_intro_shown', 'true');
    setIsVoiceModalOpen(false);
    startListening();
  };

  return (
    <>
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f0f] p-4 pb-6 sticky bottom-0 z-10 transition-colors duration-300 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.3)]">
        <div className="max-w-4xl mx-auto">
          
          {/* Model Selector & Tools Row */}
          <div className="flex flex-wrap justify-between items-end gap-2 mb-3">
            {/* Model Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-900 dark:text-gray-100 group"
              >
                {(() => {
                  const current = MODEL_OPTIONS.find(o => o.id === mode);
                  const Icon = current?.icon || MessageSquare;
                  return (
                    <>
                      <div className={`p-1 rounded-full ${mode === ChatMode.THINKING ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                        <Icon size={16} className={mode === ChatMode.THINKING ? "animate-pulse" : ""} />
                      </div>
                      <span>{current?.label}</span>
                      <ChevronDown size={14} className={`ml-1 text-gray-500 transition-transform duration-200 ${isModelMenuOpen ? 'rotate-180' : ''}`} />
                    </>
                  );
                })()}
              </button>

              {isModelMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsModelMenuOpen(false)} />
                  <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden p-2 z-20 animate-in fade-in slide-in-from-bottom-2">
                    {MODEL_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          onModeChange(option.id as ChatMode);
                          setIsModelMenuOpen(false);
                        }}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${
                          mode === option.id 
                            ? 'bg-purple-50 dark:bg-purple-900/20' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className={`mt-0.5 p-1.5 rounded-lg ${mode === option.id ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                          <option.icon size={18} />
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-bold ${mode === option.id ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-gray-100'}`}>
                            {option.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {option.description}
                          </div>
                        </div>
                        {mode === option.id && (
                            <div className="self-center text-purple-600 dark:text-purple-400">
                              <Check size={16} />
                            </div>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Image Gen Tools */}
            {mode === ChatMode.IMAGE_GEN && (
              <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-bottom-2 pb-1">
                
                {/* Style Selector */}
                <div className="relative style-selector">
                  <button
                    type="button"
                    onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                      selectedStyle !== 'none'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    title="Select Artistic Style"
                  >
                    <Palette size={16} />
                    <span className="hidden sm:inline">{selectedStyle === 'none' ? 'Style' : IMAGE_STYLES.find(s => s.id === selectedStyle)?.label}</span>
                    <ChevronDown size={12} />
                  </button>

                  {isStyleMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-bottom-2">
                      {IMAGE_STYLES.map(style => (
                        <button
                          key={style.id}
                          onClick={() => {
                            setSelectedStyle(style.id);
                            setIsStyleMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                            selectedStyle === style.id
                              ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resolution Selector */}
                <div className="relative res-selector">
                  <button
                    type="button"
                    onClick={() => setIsResMenuOpen(!isResMenuOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-colors bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Select Image Resolution"
                  >
                    <Maximize2 size={16} />
                    <span className="hidden sm:inline">{RESOLUTION_OPTIONS.find(r => r.val === resolution)?.label || '1024px'}</span>
                    <ChevronDown size={12} />
                  </button>
                  {isResMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-32 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
                      {RESOLUTION_OPTIONS.map(opt => (
                        <button
                          key={opt.val}
                          onClick={() => {
                            setResolution(opt.val);
                            setIsResMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                            resolution === opt.val
                              ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

                {/* Aspect Ratio Buttons - DESIGN SIZE CIRCLE */}
                <div className="flex items-center gap-2">
                  {ASPECT_OPTIONS.map((ratio) => (
                    <button
                      key={ratio.val}
                      type="button"
                      onClick={() => setAspectRatio(ratio.val as AspectRatio)}
                      title={ratio.label}
                      className={`w-9 h-9 flex items-center justify-center rounded-full transition-all border-2 relative overflow-hidden flex-shrink-0 ${
                        aspectRatio === ratio.val 
                          ? 'border-purple-600 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 scale-110 z-10 shadow-lg shadow-purple-500/20' 
                          : 'border-gray-200 dark:border-gray-700 bg-transparent text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-600 dark:hover:text-gray-200'
                      }`}
                    >
                      <ratio.icon size={18} strokeWidth={aspectRatio === ratio.val ? 2.5 : 1.5} />
                      {aspectRatio === ratio.val && (
                          <span className="absolute -bottom-1 right-0 w-2.5 h-2.5 bg-purple-600 rounded-full border-2 border-white dark:border-[#0f0f0f]"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggestion Chips for Image Gen */}
          {mode === ChatMode.IMAGE_GEN && !text.trim() && attachments.length === 0 && !isLoading && (
            <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1 animate-in fade-in slide-in-from-bottom-2">
              {IMAGE_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setText(s.prompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 text-xs font-medium text-purple-700 dark:text-purple-300 whitespace-nowrap hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors flex-shrink-0"
                >
                  <Sparkles size={12} />
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex gap-2 mb-2 flex-wrap">
              {attachments.map((att, idx) => (
                <div key={idx} className="relative bg-gray-100 dark:bg-gray-800 rounded-md p-2 pr-8 flex items-center gap-2 border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                  <div className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{att.name}</div>
                  <button 
                    onClick={() => removeAttachment(idx)}
                    className="absolute right-1 top-1.5 text-gray-500 hover:text-red-500 transition-colors"
                    title="Remove attachment"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* History Dropdown */}
          {showHistory && (
            <div ref={historyMenuRef} className="absolute bottom-full mb-2 left-0 w-full md:w-96 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 z-30 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="p-2 bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Prompts</span>
                <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={14} />
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto p-1">
                {promptHistory.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No history yet</div>
                ) : (
                  promptHistory.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectHistoryItem(item)}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 truncate transition-colors group flex items-center gap-2"
                    >
                      <History size={14} className="text-gray-400 group-hover:text-purple-500" />
                      <span className="truncate flex-1">{item}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-end gap-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-2 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all shadow-inner dark:shadow-none">
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className={`p-2 rounded-full transition-colors ${
                  isLoading
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-400 hover:text-purple-600 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
                title="Attach an image for analysis"
              >
                <Paperclip size={20} />
              </button>

              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-full transition-colors ${
                  showHistory
                    ? 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'text-gray-400 hover:text-purple-600 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
                title="Prompt History (Arrow Up/Down)"
              >
                <History size={20} />
              </button>

              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
                placeholder={
                  mode === ChatMode.IMAGE_GEN ? "Describe an image or edit..." :
                  "Ask Cool boy ☺️ anything... (Use ↑ for history)"
                }
                className="w-full bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm p-2 resize-none outline-none max-h-32 min-h-[40px] self-center overflow-y-auto scrollbar-hide"
                rows={1}
                onKeyDown={handleKeyDown}
              />

              {/* Prompt Enhancer Button (Only for Image Gen) */}
              {mode === ChatMode.IMAGE_GEN && (
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={isLoading || isEnhancing}
                  className={`p-2 rounded-full transition-colors ${
                    isEnhancing 
                      ? 'text-purple-500 animate-spin' 
                      : 'text-gray-400 hover:text-purple-600 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                  title={text.trim() ? "Enhance prompt with AI" : "Surprise me with a random prompt"}
                >
                  <Wand2 size={20} />
                </button>
              )}

              {/* Send or Stop Button */}
              {isLoading ? (
                <button
                  type="button"
                  onClick={onStopGeneration}
                  className="p-2 rounded-full mb-0.5 bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-900/20 cursor-pointer animate-in fade-in zoom-in duration-200"
                  title="Stop generation"
                >
                  <StopCircle size={18} className="animate-pulse" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleMicClick}
                    className={`p-2 rounded-full transition-colors ${
                      isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-purple-600 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                    title={isListening ? "Listening..." : "Use Microphone"}
                  >
                    <Mic size={20} />
                  </button>
                  <button
                    type="submit"
                    disabled={!text.trim() && attachments.length === 0}
                    title="Send message"
                    className={`p-2 rounded-full mb-0.5 transition-all ${
                      (!text.trim() && attachments.length === 0)
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                        : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/20 cursor-pointer'
                    }`}
                  >
                    <Send size={18} />
                  </button>
                </>
              )}
            </div>
          </form>
          
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400 dark:text-gray-600">
              AI can make mistakes. Review generated code and info.
            </p>
          </div>
        </div>
      </div>
      
      {/* Voice Permission Modal */}
      <VoicePermissionModal 
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onConfirm={handleVoiceConfirm}
      />
    </>
  );
};

export default ChatInput;