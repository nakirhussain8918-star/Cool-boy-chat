export enum ChatMode {
  STANDARD = 'STANDARD', // Gemini 2.5 Flash
  FAST = 'FAST', // Flash Lite Latest
  THINKING = 'THINKING', // Gemini 3 Pro Preview
  IMAGE_GEN = 'IMAGE_GEN', // Imagen 4
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface Attachment {
  mimeType: string;
  data: string; // Base64
  name: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string; // Text content or description
  timestamp: number;
  isLoading?: boolean;
  isImageGen?: boolean; // Flag to identify image generation requests
  error?: boolean;
  errorMessage?: string; // Specific error details
  
  // Specific output types
  imageOutput?: string; // Base64 data URI
  
  // Inputs
  attachments?: Attachment[];
}

export interface ModelSettings {
  temperature: number;
  topK: number;
  topP: number;
  theme?: string; // 'purple', 'blue', 'green', 'orange', 'pink'
  systemInstruction?: string; // Custom persona
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    AIStudio: {
       hasSelectedApiKey: () => Promise<boolean>;
       openSelectKey: () => Promise<void>;
    }
  }
}