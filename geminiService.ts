
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Priority } from "./types";

// Always use process.env.API_KEY directly for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTicketDescription = async (description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise o seguinte chamado de TI e recomende uma categoria (Incident, Request, Change, Problem, Project, Development) e uma prioridade (Low, Medium, High, Critical) baseada nos frameworks ITIL e COBIT.
      
      Chamado: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedCategory: { type: Type.STRING },
            suggestedPriority: { type: Type.STRING },
            justification: { type: Type.STRING },
            itilReference: { type: Type.STRING }
          },
          required: ["suggestedCategory", "suggestedPriority", "justification", "itilReference"]
        }
      }
    });

    // Accessing response.text property directly
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};

export const getGovernanceInsight = async (metrics: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Aja como um consultor COBIT 2019. Analise estes KPIs de TI e forneça 3 recomendações de governança: ${JSON.stringify(metrics)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              recommendation: { type: Type.STRING },
              impact: { type: Type.STRING },
              cobitDomain: { type: Type.STRING }
            }
          }
        }
      }
    });
    // Accessing response.text property directly
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Governance Error:", error);
    return [];
  }
};
