
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Priority } from "./types";

const getApiKey = (): string => {
  try {
    return process.env.API_KEY || process.env.GEMINI_API_KEY || '';
  } catch {
    return '';
  }
};

export const analyzeTicketDescription = async (description: string) => {
  const apiKey = getApiKey();
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.warn("Gemini Analysis API Error, falling back to local ITIL heuristics:", error);
    }
  }

  // Fallback inteligente com heurísticas ITIL 4 caso a chave não esteja presente ou ocorra erro
  const descLower = (description || '').toLowerCase();
  let suggestedCategory = 'Incident';
  let suggestedPriority = 'Medium';
  let justification = 'Análise fundamentada nas boas práticas do ITIL 4 Service Desk.';
  let itilReference = 'ITIL 4 Service Management Practice';

  if (descLower.includes('banco') || descLower.includes('parou') || descLower.includes('servidor') || descLower.includes('queda') || descLower.includes('crític') || descLower.includes('erro 500')) {
    suggestedCategory = 'Incident';
    suggestedPriority = 'Critical';
    justification = 'Indisponibilidade ou falha grave em ambiente de produção; prioridade máxima e escalonamento célere N2/N3.';
    itilReference = 'ITIL 4 Incident Management - Major Incident';
  } else if (descLower.includes('software') || descLower.includes('acesso') || descLower.includes('solicita') || descLower.includes('licença') || descLower.includes('instalação')) {
    suggestedCategory = 'Request';
    suggestedPriority = 'Medium';
    justification = 'Solicitação de serviço padronizada para concessão de acesso ou instalação de ferramentas.';
    itilReference = 'ITIL 4 Service Request Management';
  } else if (descLower.includes('projeto') || descLower.includes('modernização') || descLower.includes('erp') || descLower.includes('módulo') || descLower.includes('desenvolvimento')) {
    suggestedCategory = 'Project';
    suggestedPriority = 'High';
    justification = 'Demanda de arquitetura ou evolução de sistema com necessidade de documentação e sprint.';
    itilReference = 'COBIT 2019 BAI01 / ITIL 4 Project Management';
  } else if (descLower.includes('recorrente') || descLower.includes('causa raiz') || descLower.includes('investigar') || descLower.includes('bug')) {
    suggestedCategory = 'Problem';
    suggestedPriority = 'High';
    justification = 'Identificação de causa raiz e plano de contorno para evitar reincidência de incidentes.';
    itilReference = 'ITIL 4 Problem Management';
  }

  return {
    suggestedCategory,
    suggestedPriority,
    justification,
    itilReference
  };
};

export const getGovernanceInsight = async (metrics: any) => {
  const apiKey = getApiKey();
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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
      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.warn("Gemini Governance API Error, using heuristic recommendations:", error);
    }
  }

  // Recomendações de governança COBIT 2019 pré-estruturadas para resiliência operacional
  return [
    {
      recommendation: "Manter a triagem rápida na Fila N1 com cumprimento rigoroso do primeiro atendimento.",
      impact: "Redução de até 35% no tempo de espera do usuário e aderência de 98%+ aos Acordos de Nível de Serviço (SLA).",
      cobitDomain: "DSS02 - Gestão de Requisições de Serviço e Incidentes"
    },
    {
      recommendation: "Registrar a justificativa técnica detalhada em todos os escalonamentos entre N1 ➔ N2 e N2 ➔ N3.",
      impact: "Fortalecimento da rastreabilidade para auditoria e enriquecimento da base de conhecimento da equipe técnica.",
      cobitDomain: "EDM04 - Assegurar a Otimização de Recursos"
    },
    {
      recommendation: "Converter demandas de grande porte em projetos estruturados com documentação técnica e tarefas.",
      impact: "Prevenção de escopo desordenado e alinhamento contínuo das entregas de tecnologia aos objetivos do negócio.",
      cobitDomain: "BAI01 - Gerenciar Programas e Projetos"
    }
  ];
};
