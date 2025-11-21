import { GoogleGenAI } from "@google/genai";
import { ChatMode, Attachment, ModelSettings } from "../types";

// Helper to safely get AI instance preventing crash if process is undefined
const getAI = () => {
  const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';
  if (!apiKey) {
    console.warn("API Key not found in process.env");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

/**
 * Generates text response (Standard, Fast, Thinking, or Vision)
 */
export const generateTextResponse = async (
  mode: ChatMode,
  prompt: string,
  attachments: Attachment[],
  settings: ModelSettings,
  onStream: (text: string) => void,
  signal?: AbortSignal
): Promise<string> => {
  const ai = getAI();
  
  // Default to Gemini 2.5 Flash (Standard)
  let modelName = 'gemini-2.5-flash'; 
  
  // Default Persona
  const defaultInstruction = "You are 'Cool boy ☺️'. You are a chill, friendly, and funny AI assistant. You like to joke around, use emojis, and keep the vibe positive. If the user jokes, you roast them back playfully. You are helpful but never boring.";

  // Apply user settings to config
  let config: any = {
    temperature: settings.temperature,
    topK: settings.topK,
    topP: settings.topP,
    // Use custom system instruction if provided, otherwise default
    systemInstruction: settings.systemInstruction?.trim() || defaultInstruction
  };

  if (mode === ChatMode.FAST) {
    // Use Flash Lite Latest
    modelName = 'gemini-flash-lite-latest'; 
  } else if (mode === ChatMode.THINKING) {
    // Use Gemini 3 Pro Preview
    modelName = 'gemini-3-pro-preview';
    // Ensure thinking budget is set for thinking model
    config.thinkingConfig = { thinkingBudget: 2048 }; 
  }

  // Prepare contents
  let contents: any = { parts: [] };
  
  // Add attachments (Images for vision)
  if (attachments.length > 0) {
    attachments.forEach(att => {
      contents.parts.push({
        inlineData: {
          mimeType: att.mimeType,
          data: att.data
        }
      });
    });
  }
  
  // Add text prompt
  contents.parts.push({ text: prompt });

  try {
    const resultStream = await ai.models.generateContentStream({
      model: modelName,
      contents: contents,
      config: config
    });

    let fullText = "";
    for await (const chunk of resultStream) {
      // Check for cancellation
      if (signal?.aborted) {
        throw new Error("ABORTED");
      }

      const text = chunk.text;
      if (text) {
        fullText += text;
        onStream(fullText);
      }
    }
    return fullText;
  } catch (error: any) {
    if (error.message === "ABORTED") {
      throw error;
    }
    console.error("Text generation error:", error);
    // Pass through specific API key errors if identifiable
    if (error.toString().includes("401") || error.toString().includes("API key")) {
       throw new Error("INVALID_API_KEY");
    }
    throw error;
  }
};

/**
 * Generates an Image using Imagen 4 (Text-to-Image) or Gemini 2.5 Flash Image (Image-to-Image)
 */
export const generateImage = async (
  prompt: string, 
  attachments: Attachment[], 
  aspectRatio: string = '1:1', 
  resolution?: string
): Promise<string> => {
  const ai = getAI();
  
  try {
    // IMAGE-TO-IMAGE / EDITING MODE
    if (attachments && attachments.length > 0) {
      // Use Gemini 2.5 Flash Image for editing
      const parts: any[] = [];
      
      // Add uploaded images
      attachments.forEach(att => {
        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data
          }
        });
      });

      // Logic to handle empty or weak prompts for editing
      let finalPromptText = prompt.trim();
      if (!finalPromptText || finalPromptText.length < 4 || ['edit', 'fix', 'improve', 'change'].includes(finalPromptText.toLowerCase())) {
        finalPromptText = "Apply a creative, high-quality artistic enhancement to this image. Maintain the subject but improve style and lighting.";
      }

      // Add prompt - ensure there is a STRONG instruction for the model to generate an image
      const instruction = `${finalPromptText}. \n\nIMPORTANT: You MUST generate an image as the response. Do not provide a text description or refusal. Output the result as an image file.`;
      
      parts.push({ text: instruction });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
          responseModalities: ['IMAGE'] as any, 
        },
      });

      // Check if we got an image
      const part = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
      if (part && part.inlineData) {
         return `data:image/png;base64,${part.inlineData.data}`;
      }
      
      // If no image, check if we got text (error message/refusal from model)
      const textPart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.text);
      if (textPart && textPart.text) {
        // If the model refuses, try to extract a meaningful reason or throw generic
        throw new Error(`Model response: ${textPart.text}`);
      }

      throw new Error("No image generated from edit request. Try a specific instruction like 'Make it cartoon style'.");

    } else {
      // TEXT-TO-IMAGE MODE (Imagen 4)
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
      });

      const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
      if (!base64ImageBytes) throw new Error("No image generated");
      
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
  } catch (error: any) {
    console.error("Image generation error:", error);
    if (error.toString().includes("401") || error.toString().includes("API key")) {
      throw new Error("INVALID_API_KEY");
   }
    throw error;
  }
};

/**
 * Enhances a short prompt into a detailed image generation prompt using Gemini
 */
export const enhancePrompt = async (input: string): Promise<string> => {
  const ai = getAI();
  // Use Flash for fast text manipulation
  const model = 'gemini-2.5-flash'; 
  
  const task = input.trim() 
    ? `You are an expert prompt engineer. Rewrite this concise description into a detailed, high-quality prompt for an AI image generator. Input: "${input}". Keep it under 3 sentences. Direct description only.`
    : "Generate a creative, highly detailed, and visually striking prompt for an AI image generator. Describe a specific scene, object, or character with attention to artistic style and lighting. Keep it under 3 sentences.";

  try {
    const result = await ai.models.generateContent({
      model: model,
      contents: task
    });
    return result.text?.trim() || input;
  } catch (e) {
    console.error("Prompt enhancement failed", e);
    return input; // Fallback to original
  }
};