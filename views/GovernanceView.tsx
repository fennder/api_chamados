
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Target, 
  Search, 
  Zap, 
  CheckCircle, 
  BarChart3,
  BrainCircuit,
  ChevronRight
} from 'lucide-react';
import { getGovernanceInsight } from '../geminiService';
import { Ticket } from '../types';

interface GovernanceViewProps {
  tickets: Ticket[];
}

const GovernanceView: React.FC<GovernanceViewProps> = ({ tickets }) => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    const criticalCount = tickets.filter(t => t.priority === 'Crítica').length;
    const metrics = {
      totalTickets: tickets.length,
      criticalIncidentRate: tickets.length > 0 ? (criticalCount / tickets.length) : 0,
      unassignedRate: tickets.length > 0 ? (tickets.filter(t => !t.assignedTo).length / tickets.length) : 0
    };
    const results = await getGovernanceInsight(metrics);
    if (results && results.length > 0) {
      setInsights(results);
    } else {
      setInsights([
        {
          cobitDomain: 'DSS02 - Gerenciar Requisições e Incidentes',
          impact: 'Alto',
          recommendation: 'Garantir que chamados no status Aberto sejam triados na Fila N1 e escalados para N2 e N3 apenas com diagnóstico registrado.'
        },
        {
          cobitDomain: 'BAI06 - Gerenciar Mudanças de TI',
          impact: 'Médio',
          recommendation: 'Exigir assinatura digital de aceite na documentação de requisitos antes da promoção de projetos e alterações em produção.'
        },
        {
          cobitDomain: 'APO12 - Gerenciar Riscos de TI',
          impact: 'Crítico',
          recommendation: 'Monitorar os incidentes de infraestrutura e estabelecer procedimentos operacionais padrão (SOP) para mitigar paradas nos bancos de dados corporativos.'
        }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, [tickets.length]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Governança, Risco e Compliance (GRC)</h1>
          <p className="text-slate-500">Métricas de conformidade COBIT 2019 e ITIL v4</p>
        </div>
        <button 
          onClick={fetchInsights}
          className="flex items-center space-x-2 bg-brand-50 text-brand-700 px-4 py-2 rounded-lg font-bold hover:bg-brand-100 transition-all border border-brand-200 shadow-sm"
        >
          <Zap size={18} />
          <span>{loading ? 'Analisando...' : 'Atualizar Insights IA'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Governance Scorecards */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center space-x-2">
              <Target size={20} className="text-brand-600" />
              <span>Objetivos de Governança (COBIT)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">DSS02 - Incidentes</span>
                  <CheckCircle size={16} className="text-emerald-500" />
                </div>
                <p className="text-lg font-bold text-emerald-900">92% Compliance</p>
                <div className="mt-2 w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600" style={{ width: '92%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">BAI06 - Mudanças</span>
                  <AlertTriangle size={16} className="text-amber-500" />
                </div>
                <p className="text-lg font-bold text-amber-900">74% Compliance</p>
                <div className="mt-2 w-full h-1.5 bg-amber-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600" style={{ width: '74%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-brand-500 rounded-lg">
                <BrainCircuit size={20} />
              </div>
              <h3 className="font-bold text-lg">Recomendações Estratégicas (GenAI)</h3>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                [1, 2].map(i => (
                  <div key={i} className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-800 rounded"></div>
                        <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                insights.map((insight, idx) => (
                  <div key={idx} className="p-4 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">{insight.cobitDomain}</span>
                      <span className="text-[10px] bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded">Impacto: {insight.impact}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-200">{insight.recommendation}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <FileText size={20} className="text-brand-600" />
              <span>Auditorias Recentes</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-slate-800">ISO 27001 Mensal</p>
                  <p className="text-xs text-slate-500">Há 2 dias • Status: OK</p>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-slate-800">SOC2 Type II</p>
                  <p className="text-xs text-slate-500">Há 1 semana • Pendente</p>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <BarChart3 size={20} className="text-brand-600" />
              <span>Riscos Emergentes</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-red-500"></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Vulnerabilidade Log4j</p>
                  <p className="text-xs text-slate-500">Detectado em 3 ativos críticos</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-amber-500"></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">SLA de Problemas</p>
                  <p className="text-xs text-slate-500">Atraso em 15% das causas raízes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernanceView;
