
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

export const analyzeMentorVideo = async (input: File | string): Promise<EvaluationResult & { sources?: any[] }> => {
  // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });
  
  let parts: any[] = [];
  let tools: any[] | undefined = undefined;

  if (typeof input === 'string') {
    try {
      // Attempt to fetch direct video links first
      const fetchResponse = await fetch(input);
      if (!fetchResponse.ok) throw new Error("Could not fetch remote file");
      const blob = await fetchResponse.blob();
      const base64Data = await blobToBase64(blob);
      parts.push({
        inlineData: {
          mimeType: blob.type || "video/mp4",
          data: base64Data,
        },
      });
    } catch (e) {
      // Fallback to Search Grounding for platform URLs (YouTube, etc.) or CORS blocked files
      parts.push({
        text: `The user provided this video URL for analysis: ${input}. 
        Use Google Search to locate the video content, transcript, or a detailed description. 
        Then, evaluate the mentor based on any learner-mentor interactions found in that content.`
      });
      tools = [{ googleSearch: {} }];
    }
  } else {
    const base64Data = await blobToBase64(input);
    parts.push({
      inlineData: {
        mimeType: input.type,
        data: base64Data,
      },
    });
  }

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
    model: "gemini-3-pro-preview",
    contents: [{ parts }],
    config: {
      tools,
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
