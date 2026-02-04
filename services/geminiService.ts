import { GoogleGenAI, Type } from "@google/genai";
import { CoupletData } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is not set. Please check your .env.local file.");
}

const ai = new GoogleGenAI({ apiKey });

// System instruction for the text generation model
const SYSTEM_INSTRUCTION = `You are a Chinese culture expert and poet specializing in Spring Festival couplets (Chunlian). 
Your task is to generate traditional Chinese couplets based on a recipient and a theme.
The couplet should follow strict rules of parallelism and tonal patterns.
The output must be valid JSON.`;

export const generateCoupletText = async (recipient: string, theme: string): Promise<CoupletData> => {
  try {
    const prompt = `Generate a Chinese New Year couplet for a ${recipient} with the theme of "${theme}".
    Return the result in JSON format with three fields: 'upper' (Upper Scroll/上联), 'lower' (Lower Scroll/下联), and 'horizontal' (Horizontal Scroll/横批).
    Ensure the content is festive, culturally appropriate, and concise (7-9 characters per scroll preferred).`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            upper: { type: Type.STRING },
            lower: { type: Type.STRING },
            horizontal: { type: Type.STRING },
          },
          required: ["upper", "lower", "horizontal"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini.");

    const data = JSON.parse(text) as CoupletData;
    return data;
  } catch (error) {
    console.error("Error generating couplet text:", error);
    throw error;
  }
};

export const generateCoupletImage = async (couplet: CoupletData): Promise<string> => {
  try {
    const prompt = `A high-quality, photorealistic close-up of traditional Chinese Spring Festival couplets hanging on a wooden door frame.
    
    The scene features:
    1. A vertical red paper scroll on the LEFT containing the Chinese calligraphy text: "${couplet.upper}".
    2. A vertical red paper scroll on the RIGHT containing the Chinese calligraphy text: "${couplet.lower}".
    3. A horizontal red paper scroll on the TOP containing the Chinese calligraphy text: "${couplet.horizontal}".
    
    The calligraphy should be in traditional black or gold ink. The paper is bright red with subtle gold flecks.
    Background includes festive elements like glowing red lanterns and a warm atmosphere.
    Focus specifically on the text legibility and the texture of the paper.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
      config: {
        // No specific image config needed for basic generation, defaulting to square usually works well or we can specify aspect ratio.
        // Let's try to keep it simple.
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in response.");
  } catch (error) {
    console.error("Error generating couplet image:", error);
    throw error;
  }
};
