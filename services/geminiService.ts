
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Initialize AI with the environment API key
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeFamilyPhoto = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = getAIClient();
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { 
      parts: [
        imagePart, 
        { text: prompt || "這是一張家庭照片，請幫我分析其中的氛圍，並嘗試講述一段溫馨的家庭故事或建議。" }
      ] 
    },
    config: {
      systemInstruction: "你是一位充滿溫情、專業且博學的家庭諮詢師。你的目標是通過照片觀察細節，給予溫暖的回饋，並提供正向的家庭關係建議。請使用繁體中文。"
    }
  });

  return response.text || "抱歉，我無法分析這張照片。";
};

export const chatWithFamilyAdvisor = async (history: { role: string; parts: { text: string }[] }[], message: string) => {
  const ai = getAIClient();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "你是『合家興』AI 家庭助手。你擅長處理家庭矛盾、傳承家族文化、提供健康飲食建議以及情感支持。你的語氣應該像是一位睿智且溫和的長輩或家庭導師。請使用繁體中文。"
    }
  });

  // Since chat history is handled externally in this helper, 
  // we just simulate a multi-turn call or use standard generateContent for simplicity
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      ...history,
      { role: 'user', parts: [{ text: message }] }
    ]
  });

  return response.text;
};

export const generateFamilyBlessing = async (topic: string): Promise<{ text: string; imageBase64: string }> => {
  const ai = getAIClient();
  
  // 1. Generate meaningful text first
  const textResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `請生成一段關於「${topic}」的家庭祝福語，適合發在親友群組中。字數約 30-50 字，語氣溫馨，充滿正能量。請使用繁體中文。`,
  });

  const blessingText = textResponse.text || "祝大家平安喜樂。";

  // 2. Generate a thematic image
  const imageResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `A beautiful, serene, and warm Chinese traditional aesthetic background for a family blessing image. Theme: ${topic}. Soft colors, high quality, peaceful. No text inside the image.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  let imageBase64 = "";
  for (const part of imageResponse.candidates[0].content.parts) {
    if (part.inlineData) {
      imageBase64 = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  return { text: blessingText, imageBase64 };
};
