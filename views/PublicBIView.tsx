import React, { useState, useMemo } from 'react';
import { Ticket, Project, User, Company, TicketStatus, Priority } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Printer, Filter, Building2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface PublicBIViewProps {
  tickets: Ticket[];
  projects: Project[];
  users: User[];
  companies: Company[];
}

const COLORS = ['#005b9e', '#3385c2', '#85b8db', '#b3d1e8', '#e0ebf5', '#f0f5fa'];
const STATUS_COLORS = {
  [TicketStatus.OPEN]: '#f59e0b',
  [TicketStatus.IN_PROGRESS]: '#3b82f6',
  [TicketStatus.PENDING]: '#8b5cf6',
  [TicketStatus.RESOLVED]: '#10b981',
  [TicketStatus.CLOSED]: '#64748b'
};

const PublicBIView: React.FC<PublicBIViewProps> = ({ tickets, projects, users, companies }) => {
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d' | '1y'>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');

  const filteredTickets = useMemo(() => {
    let filtered = [...tickets];
    
    // Filter by date
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (dateRange === '7d') cutoff.setDate(now.getDate() - 7);
      if (dateRange === '30d') cutoff.setDate(now.getDate() - 30);
      if (dateRange === '90d') cutoff.setDate(now.getDate() - 90);
      if (dateRange === '1y') cutoff.setFullYear(now.getFullYear() - 1);
      
      filtered = filtered.filter(t => new Date(t.createdAt) >= cutoff);
    }
    
    // Filter by company
    if (selectedCompany !== 'all') {
      const companyObj = companies.find(c => c.id === selectedCompany);
      const companyName = companyObj?.name || selectedCompany;
      filtered = filtered.filter(t => t.company === companyName || (t as any).companyId === selectedCompany);
    }
    
    // Filter by assignee
    if (selectedAssignee !== 'all') {
      const userObj = users.find(u => u.id === selectedAssignee);
      const userName = userObj?.name || selectedAssignee;
      filtered = filtered.filter(t => t.assignedTo === userName || t.assignedTo?.includes(userName) || (t as any).assigneeId === selectedAssignee);
    }
    
    return filtered;
  }, [tickets, dateRange, selectedCompany, selectedAssignee]);

  const ticketsByStatus = useMemo(() => {
    const counts = Object.values(TicketStatus).reduce((acc, status) => ({ ...acc, [status]: 0 }), {} as Record<string, number>);
    filteredTickets.forEach(t => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(item => item.value > 0);
  }, [filteredTickets]);

  const ticketsByPriority = useMemo(() => {
    const counts = Object.values(Priority).reduce((acc, prio) => ({ ...acc, [prio]: 0 }), {} as Record<string, number>);
    filteredTickets.forEach(t => {
      counts[t.priority] = (counts[t.priority] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(item => item.value > 0);
  }, [filteredTickets]);

  const ticketsByQueue = useMemo(() => {
    const queueMap: Record<string, number> = {
      'Fila N1': 0,
      'Fila N2': 0,
      'Fila N3': 0,
      'Outras': 0
    };

    filteredTickets.forEach(t => {
      const q = t.status === TicketStatus.OPEN ? 'N1' : (t.queue || 'N1');
      if (q.includes('N1')) queueMap['Fila N1']++;
      else if (q.includes('N2')) queueMap['Fila N2']++;
      else if (q.includes('N3')) queueMap['Fila N3']++;
      else queueMap['Outras']++;
    });

    return Object.entries(queueMap).map(([name, value]) => ({ name, value })).filter(item => item.value > 0);
  }, [filteredTickets]);

  const ticketsByMonth = useMemo(() => {
    const months: Record<string, number> = {};
    filteredTickets.forEach(t => {
      const d = new Date(t.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months).sort((a, b) => a[0].localeCompare(b[0])).map(([name, Total]) => ({ name, Total }));
  }, [filteredTickets]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans print:bg-white overflow-y-auto">
      {/* Header */}
      <header className="bg-brand-900 text-white p-6 print:py-4 print:px-0 print:bg-white print:text-black print:border-b print:border-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/logo.svg" alt="Abrindo Portas Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Relatório BI - Abrindo Portas</h1>
              <p className="text-brand-200 print:text-slate-500 text-sm mt-1">Dashboard Analítico de Serviços e Projetos</p>
            </div>
          </div>
          <div className="print:hidden">
            <button 
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Printer size={18} />
              <span>Imprimir Relatório</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 print:p-0 print:py-6">
        {/* Filters - Hidden on print */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-slate-200 print:hidden flex flex-wrap gap-4 items-end">
          <div className="flex items-center text-slate-500 w-full mb-2">
            <Filter size={18} className="mr-2" />
            <span className="font-medium">Filtros do Relatório</span>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">Período</label>
            <select 
              value={dateRange} 
              onChange={e => setDateRange(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              <option value="all">Todos os períodos</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="1y">Último ano</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">Empresa</label>
            <select 
              value={selectedCompany} 
              onChange={e => setSelectedCompany(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              <option value="all">Todas as empresas</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">Responsável</label>
            <select 
              value={selectedAssignee} 
              onChange={e => setSelectedAssignee(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              <option value="all">Todos os responsáveis</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Applied Filters Info - Only visible on print */}
        <div className="hidden print:block mb-8 text-sm text-slate-600">
          <p><strong>Período:</strong> {dateRange === 'all' ? 'Todos os períodos' : dateRange === '7d' ? 'Últimos 7 dias' : dateRange === '30d' ? 'Últimos 30 dias' : dateRange === '90d' ? 'Últimos 90 dias' : 'Último ano'}</p>
          <p><strong>Empresa:</strong> {selectedCompany === 'all' ? 'Todas' : companies.find(c => c.id === selectedCompany)?.name}</p>
          <p><strong>Responsável:</strong> {selectedAssignee === 'all' ? 'Todos' : users.find(u => u.id === selectedAssignee)?.name}</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-slate-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 font-medium">Total de Chamados</h3>
              <div className="p-2 bg-brand-50 text-brand-600 rounded-lg"><AlertCircle size={24} /></div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{filteredTickets.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-slate-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 font-medium">Chamados Abertos</h3>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={24} /></div>
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {filteredTickets.filter(t => t.status === TicketStatus.OPEN || t.status === TicketStatus.IN_PROGRESS).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-slate-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 font-medium">Resolvidos/Fechados</h3>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 size={24} /></div>
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {filteredTickets.filter(t => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-slate-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 font-medium">Total de Projetos</h3>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Building2 size={24} /></div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{projects.length}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 print:block print:space-y-8">
          {/* Status Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-slate-300 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Chamados por Status</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {ticketsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Queue Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-slate-300 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Carga por Nível / Fila (ITIL)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ticketsByQueue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {ticketsByQueue.map((entry, index) => {
                      const queueColor = entry.name.includes('N1') ? '#0284c7' : entry.name.includes('N2') ? '#d97706' : entry.name.includes('N3') ? '#7c3aed' : '#64748b';
                      return <Cell key={`cell-q-${index}`} fill={queueColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-slate-300 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Chamados por Prioridade</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ticketsByPriority}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {ticketsByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Volume Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2 print:shadow-none print:border-slate-300 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Volume de Chamados por Mês</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ticketsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="Total" stroke="#005b9e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-sm print:fixed print:bottom-0 print:w-full print:bg-white print:text-slate-500 print:border-t print:border-slate-300 print:py-4">
        <p>&copy; {new Date().getFullYear()} Abrindo Portas - Todos os direitos reservados.</p>
        <p className="mt-1">Documento gerado em {new Date().toLocaleString()}</p>
      </footer>
    </div>
  );
};

export default PublicBIView;
