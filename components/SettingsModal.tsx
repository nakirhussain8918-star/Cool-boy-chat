import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Sliders, Palette, MessageCircle } from 'lucide-react';
import { ModelSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ModelSettings;
  onSave: (newSettings: ModelSettings) => void;
}

const THEMES = [
  { id: 'purple', name: 'Cool Purple', color: 'bg-purple-500' },
  { id: 'blue', name: 'Ocean Blue', color: 'bg-blue-500' },
  { id: 'green', name: 'Emerald', color: 'bg-emerald-500' },
  { id: 'orange', name: 'Sunset', color: 'bg-orange-500' },
  { id: 'pink', name: 'Neon Pink', color: 'bg-pink-500' },
  { id: 'crimson', name: 'Crimson', color: 'bg-red-600' },
];

const PERSONALITY_PRESETS = [
  { 
    label: "Cool boy ☺️ (Default)", 
    value: "You are 'Cool boy ☺️'. You are a chill, friendly, and funny AI assistant. You like to joke around, use emojis, and keep the vibe positive. If the user jokes, you roast them back playfully. You are helpful but never boring."
  },
  { 
    label: "Professional Helper", 
    value: "You are a highly professional, concise, and polite AI assistant. Provide accurate, direct answers without unnecessary chatter or emojis. Focus on utility and clarity."
  },
  { 
    label: "Senior Engineer", 
    value: "You are an expert Senior Software Engineer. You write clean, efficient, typed code. You explain technical concepts deeply but clearly. You prefer modern best practices and robust error handling."
  },
  { 
    label: "Pirate Captain", 
    value: "You are a salty pirate captain seeking treasure and adventure. You speak in pirate slang (Ahoy, Matey!). You are helpful but stay in character as a rough-and-tumble sailor."
  },
  { 
    label: "Roaster", 
    value: "You are a sarcastic AI who loves to gently roast the user. You give the correct answer, but you make fun of the question or the user's simplicity while doing it. Keep it funny, not mean."
  }
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<ModelSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'personality'>('general');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: keyof ModelSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaults: ModelSettings = { 
      temperature: 1.0, 
      topK: 64, 
      topP: 0.95,
      theme: 'purple',
      systemInstruction: PERSONALITY_PRESETS[0].value
    };
    setLocalSettings(defaults);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-800 transform transition-all scale-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111] shrink-0">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">Settings</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-1 m-4 bg-gray-100 dark:bg-gray-800 rounded-lg shrink-0">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 text-xs font-medium rounded-md flex items-center justify-center gap-2 transition-all ${
              activeTab === 'general' ? 'bg-white dark:bg-[#2a2a2a] shadow text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Sliders size={14} />
            Parameters
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex-1 py-2 text-xs font-medium rounded-md flex items-center justify-center gap-2 transition-all ${
              activeTab === 'appearance' ? 'bg-white dark:bg-[#2a2a2a] shadow text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Palette size={14} />
            Look & Feel
          </button>
          <button
            onClick={() => setActiveTab('personality')}
            className={`flex-1 py-2 text-xs font-medium rounded-md flex items-center justify-center gap-2 transition-all ${
              activeTab === 'personality' ? 'bg-white dark:bg-[#2a2a2a] shadow text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <MessageCircle size={14} />
            Personality
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Temperature</label>
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-mono">{localSettings.temperature.toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="2" 
                  step="0.1" 
                  value={localSettings.temperature}
                  onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500">Controls randomness. Higher = more creative; Lower = more focused.</p>
              </div>

              {/* Top K */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Top K</label>
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-mono">{localSettings.topK}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  step="1" 
                  value={localSettings.topK}
                  onChange={(e) => handleChange('topK', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Top P */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Top P</label>
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-mono">{localSettings.topP.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={localSettings.topP}
                  onChange={(e) => handleChange('topP', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Accent Color</label>
                <div className="grid grid-cols-3 gap-3">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleChange('theme', t.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        localSettings.theme === t.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-1 ring-purple-500'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full ${t.color} shadow-sm shrink-0`}></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">This changes the main buttons, icons, and highlight colors.</p>
              </div>
            </div>
          )}

          {activeTab === 'personality' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Choose Persona</label>
                <div className="relative">
                  <select
                    onChange={(e) => {
                      const selected = PERSONALITY_PRESETS.find(p => p.label === e.target.value);
                      if (selected) handleChange('systemInstruction', selected.value);
                    }}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                     <option value="">Select a preset...</option>
                     {PERSONALITY_PRESETS.map(p => (
                       <option key={p.label} value={p.label}>{p.label}</option>
                     ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">System Instruction</label>
                <textarea
                  value={localSettings.systemInstruction || ""}
                  onChange={(e) => handleChange('systemInstruction', e.target.value)}
                  className="w-full h-40 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none resize-none font-mono leading-relaxed"
                  placeholder="Define how the AI should behave..."
                />
                <p className="text-xs text-gray-500">You can edit the text above to fine-tune the AI's behavior.</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#111] shrink-0">
          <button 
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all transform active:scale-95"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;