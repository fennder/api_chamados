
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Activity
} from 'lucide-react';
import { Ticket, TicketStatus, Priority, Project } from '../types';

interface DashboardViewProps {
  tickets: Ticket[];
  projects: Project[];
  isAdmin?: boolean;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const DashboardView: React.FC<DashboardViewProps> = ({ tickets, projects, isAdmin = false }) => {
  const activeTickets = tickets.filter(t => t.status !== TicketStatus.CLOSED && t.status !== TicketStatus.RESOLVED);
  const activeProjects = projects.filter(p => p.status !== 'Concluído' && p.status !== 'Cancelado');
  const slaCritical = activeTickets.filter(t => t.priority === Priority.CRITICAL).length;
  
  const statusData = [
    { name: 'Aberto', value: activeTickets.filter(t => t.status === TicketStatus.OPEN).length },
    { name: 'Andamento', value: activeTickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length },
    { name: 'Pendente', value: activeTickets.filter(t => t.status === TicketStatus.PENDING).length },
  ];

  const n1Count = activeTickets.filter(t => t.status === TicketStatus.OPEN || (!t.queue?.includes('N2') && !t.queue?.includes('N3'))).length;
  const n2Count = activeTickets.filter(t => t.status !== TicketStatus.OPEN && t.queue?.includes('N2')).length;
  const n3Count = activeTickets.filter(t => t.status !== TicketStatus.OPEN && t.queue?.includes('N3')).length;

  const trendData = [
    { name: 'Seg', chamados: 12 },
    { name: 'Ter', chamados: 19 },
    { name: 'Qua', chamados: 15 },
    { name: 'Qui', chamados: 22 },
    { name: 'Sex', chamados: 30 },
    { name: 'Sáb', chamados: 10 },
    { name: 'Dom', chamados: 5 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Executivo</h1>
          <p className="text-slate-500">Visão geral do ecossistema de TI sob ITIL/COBIT</p>
        </div>
        <div className="flex space-x-3">
          <a 
            href="/#/bi" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-brand-50 border border-brand-200 text-brand-700 hover:bg-brand-100 hover:text-brand-800 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Activity size={16} />
            <span className="text-sm font-medium">Acessar BI Público</span>
          </a>
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg flex items-center space-x-2 shadow-sm hidden md:flex">
            <Clock size={16} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Última atualização: Hoje, 14:00</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${isAdmin ? '5' : '4'} gap-6`}>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
              <Activity size={24} />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12% vs mês ant.</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Chamados Ativos</h3>
          <p className="text-2xl font-bold text-slate-900">{activeTickets.length}</p>
        </div>

        {isAdmin && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Activity size={24} />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Em andamento</span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">Projetos Ativos</h3>
            <p className="text-2xl font-bold text-slate-900">{activeProjects.length}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">98.5% compliance</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">SLA de Atendimento</h3>
          <p className="text-2xl font-bold text-slate-900">14.2m</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={24} />
            </div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Meta: 4h</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Tempo Médio Resolução</h3>
          <p className="text-2xl font-bold text-slate-900">3h 45m</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertCircle size={24} />
            </div>
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">Urgente</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Incidentes Críticos</h3>
          <p className="text-2xl font-bold text-slate-900">{slaCritical}</p>
        </div>
      </div>

      {/* ITIL Queue Workload Overview */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Carga de Trabalho por Fila de Atendimento</h3>
            <p className="text-xs text-slate-500">Distribuição nos níveis de suporte ITIL (N1 ➔ N2 ➔ N3)</p>
          </div>
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full self-start sm:self-auto">
            Abertos obrigatoriamente no N1
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-sky-50/60 border border-sky-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-sky-800 uppercase tracking-wide block">Fila N1 (1º Nível)</span>
              <span className="text-xs text-slate-500">Entrada de novos chamados abertos</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-sky-700">{n1Count}</span>
              <span className="text-xs text-sky-600 block">chamados</span>
            </div>
          </div>

          <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide block">Fila N2 (2º Nível)</span>
              <span className="text-xs text-slate-500">Escalados da Fila N1</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-amber-700">{n2Count}</span>
              <span className="text-xs text-amber-600 block">chamados</span>
            </div>
          </div>

          <div className="bg-purple-50/60 border border-purple-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wide block">Fila N3 (Especialistas)</span>
              <span className="text-xs text-slate-500">Escalados da Fila N2</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-purple-700">{n3Count}</span>
              <span className="text-xs text-purple-600 block">chamados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center space-x-2">
              <TrendingUp size={20} className="text-brand-600" />
              <span>Tendência de Chamados</span>
            </h3>
            <select className="text-xs bg-slate-50 border-slate-200 rounded-md py-1 px-2 text-slate-500">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#6366f1' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="chamados" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6">Distribuição por Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {statusData.map((item, index) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs text-slate-500 font-medium">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
