import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Queue, Ticket, TicketStatus } from '../types';
import { Layers, PlusCircle, CheckCircle, XCircle, Edit2, ArrowRight, ShieldCheck, Ticket as TicketIcon } from 'lucide-react';
import { getEffectiveQueue } from './TicketsView';

interface QueuesViewProps {
  queues: Queue[];
  tickets?: Ticket[];
  onCreate: (queue: Partial<Queue>) => void;
  onUpdate: (id: string, updates: Partial<Queue>) => void;
}

const QueuesView: React.FC<QueuesViewProps> = ({ queues, tickets = [], onCreate, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQueueId, setEditingQueueId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  const handleOpenNew = () => {
    setEditingQueueId(null);
    setFormData({ name: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (queue: Queue) => {
    setEditingQueueId(queue.id);
    setFormData({ name: queue.name });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingQueueId) {
      onUpdate(editingQueueId, formData);
    } else {
      onCreate(formData);
    }
    setFormData({ name: '' });
    setIsModalOpen(false);
  };

  // Helper to count tickets in queue
  const getQueueStats = (queueName: string) => {
    const queueTickets = tickets.filter(t => !t.isArchived && getEffectiveQueue(t) === queueName);
    const openCount = queueTickets.filter(t => t.status === TicketStatus.OPEN).length;
    const inProgressCount = queueTickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length;
    return {
      total: queueTickets.length,
      open: openCount,
      inProgress: inProgressCount
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
            <Layers size={24} className="text-brand-600" />
            <span>Filas de Atendimento & Níveis de Suporte</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie a hierarquia de atendimento ITIL (N1 ➔ N2 ➔ N3)</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="flex items-center space-x-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <PlusCircle size={18} />
          <span>Nova Fila</span>
        </button>
      </div>

      {/* ITIL Escalation Policy Infobox */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center space-x-2 mb-3">
          <ShieldCheck size={20} className="text-emerald-400" />
          <h3 className="font-bold text-base">Fluxo de Escalonamento Contínuo</h3>
        </div>
        <p className="text-blue-100 text-xs sm:text-sm max-w-3xl leading-relaxed mb-4">
          Conforme a governança de serviços: todos os chamados no status <strong>Aberto</strong> entram compulsoriamente na <strong>Fila N1</strong>. 
          O técnico do N1 pode escalar a demanda para o <strong>N2</strong>, e o técnico do N2 pode escalar para os especialistas do <strong>N3</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-3 rounded-xl">
            <div className="flex items-center justify-between text-xs font-bold text-sky-300 mb-1">
              <span>Nível 1 (N1)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/30 text-sky-200">Entrada Padrão</span>
            </div>
            <p className="text-xs text-blue-100">Recepção de novos chamados em status "Aberto", triagem rápida e suporte básico.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-3 rounded-xl">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-1">
              <span>Nível 2 (N2)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/30 text-amber-200">Escalado do N1</span>
            </div>
            <p className="text-xs text-blue-100">Atendimento avançado de infraestrutura, redes, acessos privilegiados e incidentes complexos.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-3 rounded-xl">
            <div className="flex items-center justify-between text-xs font-bold text-purple-300 mb-1">
              <span>Nível 3 (N3)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/30 text-purple-200">Escalado do N2</span>
            </div>
            <p className="text-xs text-blue-100">Especialistas seniores, administradores de banco de dados, arquitetos e desenvolvedores.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Nome da Fila</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Chamados Ativos</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {queues.map(queue => {
              const stats = getQueueStats(queue.name);
              const isN1 = queue.name.includes('N1');
              const isN2 = queue.name.includes('N2');
              const isN3 = queue.name.includes('N3');

              return (
                <tr key={queue.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="font-semibold text-slate-900">{queue.name}</div>
                      {isN1 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                          Entrada Chamados Abertos
                        </span>
                      )}
                      {isN2 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          Escala N1 ➔ N2
                        </span>
                      )}
                      {isN3 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                          Escala N2 ➔ N3
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1.5">
                      {queue.isActive ? (
                        <><CheckCircle size={16} className="text-emerald-500" /><span className="text-xs font-medium text-emerald-600">Ativa</span></>
                      ) : (
                        <><XCircle size={16} className="text-slate-400" /><span className="text-xs font-medium text-slate-500">Inativa</span></>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900">{stats.total} chamados</span>
                      {stats.total > 0 && (
                        <span className="text-xs text-slate-500">
                          ({stats.open} abertos, {stats.inProgress} em atendimento)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <Link 
                        to="/tickets"
                        className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center space-x-1 mr-2"
                        title="Ver Chamados"
                      >
                        <TicketIcon size={14} />
                        <span>Ver Fila</span>
                      </Link>
                      <button 
                        onClick={() => handleOpenEdit(queue)}
                        className="text-slate-500 hover:text-brand-600 transition-colors p-1"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onUpdate(queue.id, { isActive: !queue.isActive })}
                        className={`text-xs font-medium ${queue.isActive ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-600 hover:text-emerald-800'}`}
                      >
                        {queue.isActive ? 'Inativar' : 'Ativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {queues.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  Nenhuma fila cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">{editingQueueId ? 'Editar Fila' : 'Nova Fila'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full"><XCircle size={20} className="text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Fila</label>
                <input 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm" 
                  value={formData.name} 
                  onChange={e => setFormData({ name: e.target.value })}
                  placeholder="Ex: N1 - Suporte Nível 1"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={!formData.name}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg font-medium shadow-sm hover:bg-brand-700 transition-colors disabled:opacity-50 text-sm"
              >
                Salvar Fila
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueuesView;
