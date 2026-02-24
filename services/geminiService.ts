
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { AgeGroup, DinoGroup, ImageType, ArtStyle, AspectRatio } from "../types";

const API_KEY = process.env.API_KEY || "";

// Decoding and Encoding helpers as per guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateDinoImage = async (
  age: AgeGroup,
  group: DinoGroup,
  type: ImageType,
  style: ArtStyle,
  aspect: AspectRatio
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  let visualPrompt = `An accurate but cute and friendly depiction of a specific dinosaur species from the ${group} category for kids aged ${age}. `;
  
  if (type === ImageType.COLORING_PAGE) {
    visualPrompt += `Black and white line art, thick bold outlines, very clean white background, strictly no shading or gradients, simple coloring page for toddlers. `;
  } else {
    visualPrompt += `Vibrant and colorful, soft friendly aesthetics, scientific-based but kid-friendly anatomy, no scary teeth, no gore. Style: ${style}. `;
  }
  
  visualPrompt += `Reference: authentic prehistoric biology simplified for children. Background: a lush Mesozoic landscape with ferns, soft mountains, and natural environment. No text. High resolution.`;

  const ratioMap: Record<AspectRatio, string> = {
    [AspectRatio.A4_PORTRAIT]: "3:4",
    [AspectRatio.A4_LANDSCAPE]: "4:3",
    [AspectRatio.SQUARE]: "1:1",
    [AspectRatio.MOBILE]: "9:16",
    [AspectRatio.WIDESCREEN]: "16:9",
    [AspectRatio.LANDSCAPE_43]: "4:3"
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: visualPrompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: ratioMap[aspect] as any || "1:1",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate image");
};

export const generateDinoInfo = async (group: DinoGroup, age: AgeGroup): Promise<{ question: string; name: string }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Hãy gợi ý tên 1 loài khủng long thật sự thuộc nhóm ${group} và 1 câu hỏi tương tác khám phá đơn giản dành cho trẻ mầm non ${age}. 
    Ví dụ: 'Bạn Khủng Long Cổ Dài Brachiosaurus có mấy chân?'. Hãy trả lời bằng JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          question: { type: Type.STRING }
        },
        required: ["name", "question"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const playDinoAudio = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Chào các bé, đây là bạn ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1,
    );
    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioContext.destination);
    source.start();
  }
};
