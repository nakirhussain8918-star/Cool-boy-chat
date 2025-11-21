import React, { useState, useRef, useEffect } from 'react';
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';
import { Message, ChatMode, Attachment, ModelSettings, AspectRatio } from './types';
import { generateTextResponse, generateImage } from './services/geminiService';
import { Trash2, Sun, Moon, Settings, ArrowDown, Brain, Sparkles, Smile, Info } from 'lucide-react';

const App: React.FC = () => {
  // State for current mode
  const [mode, setMode] = useState<ChatMode>(ChatMode.STANDARD);

  // Store separate histories for each mode
  const [histories, setHistories] = useState<Record<ChatMode, Message[]>>(() => {
    try {
      const saved = localStorage.getItem('coolboy_histories_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load histories", e);
    }
    // Default initial state
    const defaultMsg = (text: string): Message => ({
      id: 'welcome', role: 'model', content: text, timestamp: Date.now()
    });
    
    return {
      [ChatMode.STANDARD]: [defaultMsg("Yo! I'm Cool boy ☺️. I'm chill, intelligent, and I love a good joke. What's popping?")],
      [ChatMode.FAST]: [defaultMsg("Zoom zoom! 🏎️ I'm Cool boy Lite. Fast answers only. Hit me!")],
      [ChatMode.THINKING]: [defaultMsg("Time to use the big brain. 🧠 I'm Cool boy Pro. Give me the complex stuff.")],
      [ChatMode.IMAGE_GEN]: [defaultMsg("I'm the artist of the group 🎨. Describe a pic or upload one to edit!")],
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Get current messages based on active mode
  const messages = histories[mode] || [];

  // Default Model Settings (including Theme and Personality)
  const [settings, setSettings] = useState<ModelSettings>(() => {
     try {
       const savedSettings = localStorage.getItem('coolboy_settings');
       if (savedSettings) return JSON.parse(savedSettings);
     } catch(e) {}
     return {
       temperature: 1.0,
       topK: 64,
       topP: 0.95,
       theme: 'purple',
       systemInstruction: "You are 'Cool boy ☺️'. You are a chill, friendly, and funny AI assistant. You like to joke around, use emojis, and keep the vibe positive. If the user jokes, you roast them back playfully. You are helpful but never boring."
     };
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Apply Settings and Themes
  useEffect(() => {
    localStorage.setItem('coolboy_settings', JSON.stringify(settings));
    
    // Apply Theme Colors
    const root = document.documentElement;
    const themes: any = {
      purple: {
        50: '250 245 255', 100: '243 232 255', 200: '233 213 255', 300: '216 180 254',
        400: '192 132 252', 500: '168 85 247', 600: '147 51 234', 700: '126 34 206',
        800: '107 33 168', 900: '88 28 135', 950: '59 7 100'
      },
      blue: {
        50: '239 246 255', 100: '219 234 254', 200: '191 219 254', 300: '147 197 253',
        400: '96 165 250', 500: '59 130 246', 600: '37 99 235', 700: '29 78 216',
        800: '30 64 175', 900: '30 58 138', 950: '23 37 84'
      },
      green: {
        50: '236 253 245', 100: '209 250 229', 200: '167 243 208', 300: '110 231 183',
        400: '52 211 153', 500: '16 185 129', 600: '5 150 105', 700: '4 120 87',
        800: '6 95 70', 900: '6 78 59', 950: '2 44 34'
      },
      orange: {
        50: '255 247 237', 100: '255 237 213', 200: '254 215 170', 300: '253 186 116',
        400: '251 146 60', 500: '249 115 22', 600: '234 88 12', 700: '194 65 12',
        800: '154 52 18', 900: '124 45 18', 950: '67 20 7'
      },
      pink: {
        50: '253 242 248', 100: '252 231 243', 200: '251 207 232', 300: '249 168 212',
        400: '244 114 182', 500: '236 72 153', 600: '219 39 119', 700: '190 24 93',
        800: '157 23 77', 900: '131 24 67', 950: '80 7 36'
      },
      crimson: {
        50: '254 242 242', 100: '254 226 226', 200: '254 202 202', 300: '252 165 165',
        400: '248 113 113', 500: '239 68 68', 600: '220 38 38', 700: '185 28 28',
        800: '153 27 27', 900: '127 29 29', 950: '69 10 10'
      }
    };

    const selectedTheme = themes[settings.theme || 'purple'] || themes.purple;

    // Set CSS Variables for the theme
    Object.keys(selectedTheme).forEach(key => {
      root.style.setProperty(`--color-primary-${key}`, selectedTheme[key]);
    });

  }, [settings]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll when messages change or mode switches
  useEffect(() => {
    scrollToBottom();
  }, [messages, mode]);

  // Persist histories to localStorage with ADVANCED Quota Handling
  useEffect(() => {
    const saveToStorage = () => {
      try {
        localStorage.setItem('coolboy_histories_v1', JSON.stringify(histories));
      } catch (e: any) {
        // Check for QuotaExceededError
        if (
          e.name === 'QuotaExceededError' || 
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || 
          e.code === 22 || 
          e.code === 1014
        ) {
          console.warn("LocalStorage quota exceeded. Attempting emergency cleanup...");
          
          try {
            // Strategy 1: Trim to last 5 messages
            const trimmedHistories = {} as Record<ChatMode, Message[]>;
            (Object.keys(histories) as ChatMode[]).forEach((key) => {
              trimmedHistories[key] = histories[key].slice(-5); 
            });
            localStorage.setItem('coolboy_histories_v1', JSON.stringify(trimmedHistories));
          } catch (retryError) {
            console.warn("Trimmed history still too large. Removing image data from saved history...");
            // Strategy 2: Keep last 5 messages BUT STRIP IMAGE DATA from storage
            try {
              const minimalHistories = {} as Record<ChatMode, Message[]>;
              (Object.keys(histories) as ChatMode[]).forEach((key) => {
                minimalHistories[key] = histories[key].slice(-5).map(msg => ({
                  ...msg,
                  // Remove large base64 strings from storage
                  imageOutput: undefined, 
                  attachments: msg.attachments?.map(a => ({...a, data: ''})) 
                })); 
              });
              localStorage.setItem('coolboy_histories_v1', JSON.stringify(minimalHistories));
            } catch (finalError) {
              console.error("Critical storage failure", finalError);
            }
          }
        }
      }
    };

    // Debounce saving to prevent excessive writes and blocking UI
    const timeoutId = setTimeout(saveToStorage, 1000);
    return () => clearTimeout(timeoutId);
  }, [histories]);

  // Handle Scroll to show/hide bottom button
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleDeleteMessage = (id: string) => {
    setHistories(prev => ({
      ...prev,
      [mode]: prev[mode].filter(msg => msg.id !== id)
    }));
  };

  // Helper to update messages for the CURRENT mode
  const updateCurrentMessages = (updater: (msgs: Message[]) => Message[]) => {
    setHistories(prev => ({
      ...prev,
      [mode]: updater(prev[mode] || [])
    }));
  };

  const handleSendMessage = async (text: string, activeMode: ChatMode, attachments: Attachment[], aspectRatio?: AspectRatio, resolution?: string) => {
    // Ensure we are using the mode passed from input (though it should match state)
    if (activeMode !== mode) setMode(activeMode);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMsgId = Date.now().toString();
    const aiMsgId = (Date.now() + 1).toString();

    // 1. Add User Message
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments: attachments
    };

    updateCurrentMessages(prev => [...prev, userMsg]);

    // 2. Add Placeholder AI Message
    updateCurrentMessages(prev => [...prev, {
      id: aiMsgId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      isLoading: true,
      isImageGen: activeMode === ChatMode.IMAGE_GEN
    }]);

    setIsLoading(true);
    if (activeMode === ChatMode.THINKING) setIsThinking(true);

    const ac = new AbortController();
    abortControllerRef.current = ac;

    try {
      if (activeMode === ChatMode.IMAGE_GEN) {
        const imageUrl = await generateImage(text, attachments, aspectRatio, resolution);
        
        if (ac.signal.aborted) throw new Error("ABORTED");

        updateCurrentMessages(prev => prev.map(msg => 
          msg.id === aiMsgId ? { 
            ...msg, 
            isLoading: false, 
            content: attachments.length > 0 
              ? `Here is your edited masterpiece based on: "${text || 'your image'}" ✨` 
              : `Fresh from the studio: "${text}" 🎨`, 
            imageOutput: imageUrl 
          } : msg
        ));
      } 
      else {
        // Text/Thinking/Fast Modes
        await generateTextResponse(activeMode, text, attachments, settings, (streamedText) => {
          updateCurrentMessages(prev => prev.map(msg => 
            msg.id === aiMsgId ? { ...msg, content: streamedText, isLoading: true } : msg
          ));
        }, ac.signal);
        
        updateCurrentMessages(prev => prev.map(msg => 
          msg.id === aiMsgId ? { ...msg, isLoading: false } : msg
        ));
      }

    } catch (error: any) {
      if (error.message === "ABORTED" || error.name === 'AbortError') {
        updateCurrentMessages(prev => prev.map(msg => 
          msg.id === aiMsgId ? { 
            ...msg, 
            isLoading: false,
            content: msg.content ? msg.content + " (Stopped)" : "Generation stopped." 
          } : msg
        ));
      } else {
        console.error("Generation error:", error);
        
        // --- User-Friendly Error Handling ---
        let errorMsg = "My bad, something went wrong. Try again?";
        const errString = error.toString();

        if (error.message === "INVALID_API_KEY" || errString.includes("401") || errString.includes("API key")) {
          errorMsg = "🔑 Invalid API Key. Please check your key in the code or environment.";
        } 
        else if (errString.includes("429") || errString.includes("QuotaExceeded")) {
          errorMsg = "⏳ Whoa, slow down! You hit the rate limit. Give me a minute to cool down.";
        } 
        else if (errString.includes("503") || errString.includes("Overloaded")) {
          errorMsg = "😵 I'm a bit overwhelmed right now! Too many fans. Try again in a few seconds.";
        } 
        else if (errString.includes("404")) {
          errorMsg = "🚫 That specific model is taking a nap (Not Found). Try switching to a different mode.";
        } 
        else if (errString.includes("SAFETY") || errString.includes("blocked")) {
          errorMsg = "🛡️ Safety filters blocked this request. Try rephrasing your prompt to be more PG.";
        }
        else if (error.message) {
          errorMsg = `Error: ${error.message}`;
        }

        updateCurrentMessages(prev => prev.map(msg => 
          msg.id === aiMsgId ? { 
            ...msg, 
            isLoading: false, 
            error: true,
            errorMessage: errorMsg,
            content: msg.content || "" 
          } : msg
        ));
      }
    } finally {
      setIsLoading(false);
      setIsThinking(false);
      abortControllerRef.current = null;
    }
  };

  const clearHistory = () => {
    setHistories(prev => ({
      ...prev,
      [mode]: [{
        id: Date.now().toString(),
        role: 'model',
        content: "History cleared! Fresh start. 🧹✨",
        timestamp: Date.now()
      }]
    }));
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#0f0f0f] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
        {/* Header */}
        <header className="bg-white dark:bg-[#0f0f0f] border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center sticky top-0 z-20 shadow-sm dark:shadow-black/20">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg shadow-lg shadow-purple-900/50 transition-colors ${mode === ChatMode.IMAGE_GEN ? 'bg-gradient-to-br from-pink-500 to-purple-600' : 'bg-gradient-to-br from-purple-600 to-indigo-600'}`}>
              {mode === ChatMode.IMAGE_GEN ? (
                <Sparkles size={24} className="text-white" />
              ) : (
                /* Display Emoji directly instead of Icon to fix white issue */
                <div className="w-6 h-6 flex items-center justify-center text-2xl leading-none select-none">☺️</div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                {/* Separated Emoji from Gradient Text to prevent it from becoming white/invisible */}
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 dark:from-blue-400 dark:to-purple-400">
                  Cool boy
                </h1>
                <span className="text-xl">☺️</span>
                
                {isThinking && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/50 dark:text-purple-300 px-2 py-0.5 rounded-full animate-pulse border border-purple-200 dark:border-purple-800">
                    <Brain size={10} /> THINKING
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">
                {mode === ChatMode.STANDARD && "Gemini 2.5 Flash"}
                {mode === ChatMode.FAST && "Flash Lite"}
                {mode === ChatMode.THINKING && "Gemini 3 Pro"}
                {mode === ChatMode.IMAGE_GEN && "Imagen 4 / Editor"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
              onClick={() => setIsAboutOpen(true)}
              className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
              title="About Cool boy ☺️"
            >
              <Info size={20} />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={clearHistory}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
              title="Clear Current Chat"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <main 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto scroll-smooth relative"
          onScroll={handleScroll}
        >
          <div className="max-w-4xl mx-auto min-h-full flex flex-col">
            {messages.length === 0 && (
               <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                 Say hi to Cool boy! 👋
               </div>
            )}
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                onDelete={handleDeleteMessage}
              />
            ))}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-24 right-6 md:right-10 lg:right-20 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg shadow-black/20 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 transition-all animate-in fade-in slide-in-from-bottom-4 z-30 border border-gray-200 dark:border-gray-700"
              title="Scroll to bottom"
            >
              <ArrowDown size={20} />
            </button>
          )}
        </main>

        {/* Input Area - Mode is passed down */}
        <ChatInput 
           mode={mode}
           onModeChange={setMode}
           onSendMessage={handleSendMessage} 
           onStopGeneration={handleStopGeneration}
           isLoading={isLoading} 
        />
        
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSave={setSettings}
        />

        <AboutModal
          isOpen={isAboutOpen}
          onClose={() => setIsAboutOpen(false)}
        />
      </div>
    </div>
  );
};

export default App;