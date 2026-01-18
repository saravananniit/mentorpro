
import { GoogleGenAI, Type } from "@google/genai";
import { EvaluationResult } from "../types";

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const analyzeMentorVideo = async (input: File): Promise<EvaluationResult & { sources?: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });
  let parts: any[] = [];

  const base64Data = await blobToBase64(input);
  parts.push({
    inlineData: {
      mimeType: input.type,
      data: base64Data,
    },
  });

  parts.push({
    text: `Analyze the mentoring session. Extract every specific instance where a learner asks a question and the mentor provides a response. 
    Focus ONLY on the conversational exchanges.
    
    Return a JSON object:
    - overallScore: integer (0-100)
    - metrics: { clarity: int, empathy: int, accuracy: int, pacing: int }
    - summary: string
    - interactions: Array of { 
        timestamp: string, 
        learnerQuestion: string, 
        mentorAnswer: string, 
        effectivenessScore: int, 
        analysis: string, 
        strengths: string[], 
        improvements: string[] 
      }`
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.INTEGER },
          metrics: {
            type: Type.OBJECT,
            properties: {
              clarity: { type: Type.INTEGER },
              empathy: { type: Type.INTEGER },
              accuracy: { type: Type.INTEGER },
              pacing: { type: Type.INTEGER }
            },
            required: ["clarity", "empathy", "accuracy", "pacing"]
          },
          summary: { type: Type.STRING },
          interactions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timestamp: { type: Type.STRING },
                learnerQuestion: { type: Type.STRING },
                mentorAnswer: { type: Type.STRING },
                effectivenessScore: { type: Type.INTEGER },
                analysis: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["timestamp", "learnerQuestion", "mentorAnswer", "effectivenessScore", "analysis", "strengths", "improvements"]
            }
          }
        },
        required: ["overallScore", "metrics", "summary", "interactions"]
      }
    }
  });

  const resultText = response.text;
  if (!resultText) throw new Error("No analysis generated");

  try {
    const parsed = JSON.parse(resultText) as EvaluationResult;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    return { ...parsed, sources };
  } catch (e) {
    throw new Error("Invalid analysis format received from AI.");
  }
};
