import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  Search, 
  MoreHorizontal, 
  Eye, 
  BrainCircuit,
  Clock, 
  LayoutGrid, 
  List, 
  Building2, 
  X, 
  Archive, 
  ArchiveRestore, 
  CheckCircle, 
  AlertCircle, 
  Briefcase, 
  Split, 
  Paperclip, 
  Image as ImageIcon, 
  FileText,
  ArrowUpRight,
  ShieldCheck,
  Layers,
  History,
  Sparkles,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { Ticket, TicketStatus, Priority, Category, EscalationRecord } from '../types';
import { analyzeTicketDescription } from '../geminiService';

export const QUEUE_N1 = 'N1 - Suporte Nível 1';
export const QUEUE_N2 = 'N2 - Suporte Nível 2';
export const QUEUE_N3 = 'N3 - Especialistas';

export const getEffectiveQueue = (ticket: Ticket): string => {
  // REGRA: Chamados no status de aberto devem estar na fila N1
  if (ticket.status === TicketStatus.OPEN) {
    return QUEUE_N1;
  }
  return ticket.queue || QUEUE_N1;
};

export const isTicketN1 = (ticket: Ticket): boolean => {
  return getEffectiveQueue(ticket).includes('N1');
};

export const isTicketN2 = (ticket: Ticket): boolean => {
  return getEffectiveQueue(ticket).includes('N2');
};

export const isTicketN3 = (ticket: Ticket): boolean => {
  return getEffectiveQueue(ticket).includes('N3');
};

interface TicketsViewProps {
  tickets: Ticket[];
  onUpdate: (id: string, updates: Partial<Ticket>) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onCreateProject: (ticket: Ticket) => void;
  onSplitTicket: (parentId: string, data: Partial<Ticket>) => void;
  onEscalateTicket?: (id: string, targetQueue: string, reason?: string) => void;
  currentUserName?: string;
  isAdmin?: boolean;
}

const QueueBadge: React.FC<{ queue: string; size?: 'sm' | 'md' }> = ({ queue, size = 'sm' }) => {
  const isN1 = queue.includes('N1');
  const isN2 = queue.includes('N2');
  const isN3 = queue.includes('N3');

  const padding = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  if (isN1) {
    return (
      <span className={`inline-flex items-center space-x-1.5 font-bold rounded-md bg-sky-50 text-sky-700 border border-sky-200 ${padding}`}>
        <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
        <span>Fila N1 (1º Nível)</span>
      </span>
    );
  }

  if (isN2) {
    return (
      <span className={`inline-flex items-center space-x-1.5 font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200 ${padding}`}>
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <span>Fila N2 (2º Nível)</span>
      </span>
    );
  }

  if (isN3) {
    return (
      <span className={`inline-flex items-center space-x-1.5 font-bold rounded-md bg-purple-50 text-purple-700 border border-purple-200 ${padding}`}>
        <span className="w-2 h-2 rounded-full bg-purple-500" />
        <span>Fila N3 (Especialistas)</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center space-x-1.5 font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${padding}`}>
      <Layers size={12} className="text-slate-500" />
      <span>{queue}</span>
    </span>
  );
};

const EscalateModal: React.FC<{
  ticket: Ticket | null;
  targetQueue: string;
  onClose: () => void;
  onConfirm: (ticketId: string, targetQueue: string, reason: string) => void;
}> = ({ ticket, targetQueue, onClose, onConfirm }) => {
  if (!ticket) return null;

  const currentQueue = getEffectiveQueue(ticket);
  const isToN2 = targetQueue.includes('N2');
  const [reason, setReason] = useState('');

  const quickReasons = isToN2
    ? [
        'Não solucionado em 1º nível (N1)',
        'Demanda acesso privilegiado / infraestrutura',
        'Complexidade técnica intermediária',
        'Incidente recorrente em análise de nível 2'
      ]
    : [
        'Complexidade de arquitetura / banco de dados',
        'Necessária atuação de especialista fiscal/ERP',
        'Falha crítica de engenharia de software',
        'Demanda parecer técnico sênior N3'
      ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(ticket.id, targetQueue, reason.trim() || `Escalonamento aprovado de ${currentQueue} para ${targetQueue}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isToN2 ? 'bg-amber-50/70 border-amber-100' : 'bg-purple-50/70 border-purple-100'}`}>
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${isToN2 ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
              <ArrowUpRight size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isToN2 ? 'Escalar do N1 para o N2' : 'Escalar do N2 para o N3'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">Chamado: {ticket.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200/50 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Stepper overview */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Transição de Fila ITIL</div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Origem</span>
                <span className="text-xs font-bold text-slate-700">{currentQueue}</span>
              </div>
              <div className="flex flex-col items-center justify-center px-1 text-slate-400">
                <ArrowUpRight size={20} className={isToN2 ? 'text-amber-500' : 'text-purple-500'} />
              </div>
              <div className={`flex-1 p-3 rounded-lg border text-center ${isToN2 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-purple-50 border-purple-200 text-purple-800'}`}>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Novo Nível</span>
                <span className="text-xs font-bold">{targetQueue}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Motivo do Escalonamento <span className="text-slate-400 font-normal text-xs">(Registro de Governança ITIL)</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {quickReasons.map((qr) => (
                <button
                  type="button"
                  key={qr}
                  onClick={() => setReason(qr)}
                  className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 rounded-full transition-colors border border-slate-200"
                >
                  + {qr}
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              placeholder="Descreva por que o chamado está sendo transferido para este nível..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start space-x-2 text-xs text-blue-800">
            <CheckCircle2 size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <span>
              Ao confirmar, a fila do chamado será atualizada e seu status passará para <strong>Em Atendimento</strong> para que a equipe de {isToN2 ? 'N2' : 'N3'} dê andamento imediato.
            </span>
          </div>

          <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-6 py-2 text-white font-bold rounded-lg shadow-md transition-all flex items-center space-x-2 ${
                isToN2 
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' 
                  : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
              }`}
            >
              <ArrowUpRight size={18} />
              <span>Confirmar Escalar para {isToN2 ? 'N2' : 'N3'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SplitTicketModal: React.FC<{
  parentTicket: Ticket | null;
  onClose: () => void;
  onSave: (parentId: string, data: Partial<Ticket>) => void;
}> = ({ parentTicket, onClose, onSave }) => {
  if (!parentTicket) return null;

  const [formData, setFormData] = useState({
    title: `[Desmembrado] ${parentTicket.title}`,
    description: '',
    priority: parentTicket.priority,
    category: Category.INCIDENT
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center space-x-2 text-brand-700">
            <Split size={20} />
            <h3 className="text-lg font-bold">Desmembrar Chamado</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título do Novo Chamado</label>
            <input 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Área/Categoria</label>
              <select 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as Category})}
              >
                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
              <select 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value as Priority})}
              >
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição Específica</label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Descreva o que esta área precisa fazer..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium">Cancelar</button>
          <button 
            onClick={() => {
              onSave(parentTicket.id, formData);
              onClose();
            }}
            className="px-6 py-2 bg-brand-600 text-white rounded-lg font-bold shadow-md hover:bg-brand-700"
          >
            Criar Chamado Desmembrado (Fila N1)
          </button>
        </div>
      </div>
    </div>
  );
};

const TicketDetailModal: React.FC<{ 
  ticket: Ticket | null; 
  onClose: () => void; 
  onUpdate: (id: string, updates: Partial<Ticket>) => void;
  onRequestEscalate: (ticket: Ticket, targetQueue: string) => void;
  onCreateProject: (ticket: Ticket) => void;
  onSplitClick: () => void;
  isAdmin?: boolean;
}> = ({ ticket, onClose, onUpdate, onRequestEscalate, onCreateProject, onSplitClick, isAdmin }) => {
  if (!ticket) return null;

  const currentQueue = getEffectiveQueue(ticket);
  const canEscalateToN2 = isTicketN1(ticket) && ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.CLOSED;
  const canEscalateToN3 = isTicketN2(ticket) && ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.CLOSED;
  const isN3 = isTicketN3(ticket);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-brand-600 font-bold bg-brand-50 px-2 py-1 rounded border border-brand-200">{ticket.id}</span>
            <QueueBadge queue={currentQueue} size="md" />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>

        {/* Content body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-snug">{ticket.title}</h3>
          </div>

          {/* ITIL Escalation Pipeline Stepper */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <Layers size={14} className="text-brand-600" />
                <span>Nível de Atendimento & Governança ITIL</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {ticket.status === TicketStatus.OPEN && 'Chamados em "Aberto" pertencem à Fila N1'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Step 1: N1 */}
              <div className={`p-3 rounded-xl border transition-all ${
                isTicketN1(ticket)
                  ? 'bg-sky-50 border-sky-300 shadow-sm ring-2 ring-sky-400/20'
                  : 'bg-white border-slate-200 opacity-80'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-sky-800">1. Fila N1</span>
                  {isTicketN1(ticket) ? (
                    <span className="text-[10px] font-bold bg-sky-500 text-white px-1.5 py-0.5 rounded">Fila Atual</span>
                  ) : (
                    <CheckCircle size={14} className="text-emerald-500" />
                  )}
                </div>
                <p className="text-xs text-slate-600">Suporte Nível 1 & Triagem de Abertura</p>
              </div>

              {/* Step 2: N2 */}
              <div className={`p-3 rounded-xl border transition-all ${
                isTicketN2(ticket)
                  ? 'bg-amber-50 border-amber-300 shadow-sm ring-2 ring-amber-400/20'
                  : isTicketN3(ticket)
                  ? 'bg-white border-slate-200 opacity-80'
                  : 'bg-slate-50/60 border-dashed border-slate-200 text-slate-400'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${isTicketN2(ticket) ? 'text-amber-800' : 'text-slate-700'}`}>2. Fila N2</span>
                  {isTicketN2(ticket) && (
                    <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded">Fila Atual</span>
                  )}
                  {isTicketN3(ticket) && <CheckCircle size={14} className="text-emerald-500" />}
                </div>
                <p className="text-xs text-slate-600">Suporte Nível 2 & Infraestrutura</p>
              </div>

              {/* Step 3: N3 */}
              <div className={`p-3 rounded-xl border transition-all ${
                isN3
                  ? 'bg-purple-50 border-purple-300 shadow-sm ring-2 ring-purple-400/20'
                  : 'bg-slate-50/60 border-dashed border-slate-200 text-slate-400'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${isN3 ? 'text-purple-800' : 'text-slate-700'}`}>3. Fila N3</span>
                  {isN3 && (
                    <span className="text-[10px] font-bold bg-purple-600 text-white px-1.5 py-0.5 rounded">Fila Atual</span>
                  )}
                </div>
                <p className="text-xs text-slate-600">Especialistas N3 & Arquitetura Sênior</p>
              </div>
            </div>

            {/* Escalation Action Banner inside detail */}
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                {canEscalateToN2 && (
                  <span>Demanda não resolvida no N1? Permite escalar imediatamente para a Fila N2.</span>
                )}
                {canEscalateToN3 && (
                  <span>Demanda exige especialista de banco/arquitetura? Permite escalar para a Fila N3.</span>
                )}
                {isN3 && (
                  <span className="font-semibold text-purple-700 flex items-center space-x-1">
                    <ShieldCheck size={14} />
                    <span>Chamado no nível máximo de atendimento técnico (N3).</span>
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {canEscalateToN2 && (
                  <button
                    onClick={() => onRequestEscalate(ticket, QUEUE_N2)}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all"
                  >
                    <ArrowUpRight size={16} />
                    <span>Escalar para N2</span>
                  </button>
                )}

                {canEscalateToN3 && (
                  <button
                    onClick={() => onRequestEscalate(ticket, QUEUE_N3)}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all"
                  >
                    <ArrowUpRight size={16} />
                    <span>Escalar para N3</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descrição da Demanda</h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Solicitante</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
                      {ticket.requester.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{ticket.requester}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Empresa Cliente</h4>
                  <div className="flex items-center space-x-2">
                    <Building2 size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">{ticket.company}</span>
                  </div>
                </div>
              </div>

              {/* Escalation Trail / History */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <History size={14} className="text-slate-500" />
                  <span>Trilha de Escalonamento ITIL</span>
                </h4>
                {ticket.escalations && ticket.escalations.length > 0 ? (
                  <div className="space-y-2">
                    {ticket.escalations.map((esc) => (
                      <div key={esc.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center justify-between text-slate-600 font-semibold mb-1">
                          <span className="flex items-center space-x-1">
                            <span>{esc.fromQueue}</span>
                            <ArrowUpRight size={14} className="text-brand-500" />
                            <span className="text-brand-700 font-bold">{esc.toQueue}</span>
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(esc.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <div className="text-slate-600 mt-1">
                          <span className="font-medium text-slate-700">Por:</span> {esc.escalatedBy}
                        </div>
                        {esc.reason && (
                          <div className="mt-1 text-slate-500 italic bg-white p-2 rounded border border-slate-100">
                            "{esc.reason}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500">
                    Chamado em fila inicial N1 (sem escalonamentos anteriores registrados).
                  </div>
                )}
              </div>

              {ticket.attachments && ticket.attachments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Anexos</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {ticket.attachments.map(att => (
                      <a key={att.id} href={att.url} download={att.name} className="flex items-center space-x-2 p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                        {att.type.includes('image') ? <ImageIcon size={16} className="text-brand-500 flex-shrink-0" /> : <FileText size={16} className="text-rose-500 flex-shrink-0" />}
                        <span className="text-xs font-medium text-slate-700 truncate">{att.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Status management */}
            <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 h-fit">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gerenciar Status</h4>
                <div className="space-y-2">
                  {Object.values(TicketStatus).map(status => (
                    <button 
                      key={status}
                      onClick={() => { onUpdate(ticket.id, { status }); onClose(); }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        ticket.status === status 
                          ? 'bg-brand-600 text-white shadow-md font-bold' 
                          : 'bg-white text-slate-600 hover:bg-brand-50 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{status}</span>
                        {status === TicketStatus.OPEN && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-normal">Fila N1</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  * Chamados marcados como "Aberto" retornam automaticamente à <strong>Fila N1</strong> conforme a política ITIL.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <div className="flex space-x-2">
            {isAdmin && (
              <button 
                onClick={() => { onCreateProject(ticket); onClose(); }}
                className="flex items-center space-x-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-300 transition-all text-sm"
              >
                <Briefcase size={16} />
                <span>Gerar Projeto</span>
              </button>
            )}
            <button 
              onClick={onSplitClick}
              className="flex items-center space-x-2 bg-brand-100 text-brand-700 px-4 py-2 rounded-lg font-bold hover:bg-brand-200 transition-all text-sm"
            >
              <Split size={16} />
              <span>Desmembrar</span>
            </button>
          </div>
          <button 
            onClick={() => { onUpdate(ticket.id, { status: TicketStatus.RESOLVED }); onClose(); }}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2 rounded-lg font-bold shadow-lg hover:bg-emerald-700 transition-all text-sm"
          >
            <CheckCircle size={16} />
            <span>Resolver Chamado</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const TicketsView: React.FC<TicketsViewProps> = ({ 
  tickets, 
  onUpdate, 
  onArchive, 
  onUnarchive, 
  onCreateProject, 
  onSplitTicket, 
  onEscalateTicket,
  currentUserName = 'Operador',
  isAdmin 
}) => {
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [groupByCompany, setGroupByCompany] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedQueueFilter, setSelectedQueueFilter] = useState<'ALL' | 'N1' | 'N2' | 'N3'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [escalatingTarget, setEscalatingTarget] = useState<{ ticket: Ticket; targetQueue: string } | null>(null);
  const [aiAnalysisModal, setAiAnalysisModal] = useState<{ ticket: Ticket, result: any } | null>(null);
  const [ticketToArchive, setTicketToArchive] = useState<string | null>(null);
  const [ticketToUnarchive, setTicketToUnarchive] = useState<string | null>(null);
  const [ticketToSplit, setTicketToSplit] = useState<Ticket | null>(null);

  const handleAnalyze = async (ticket: Ticket) => {
    setAnalyzingId(ticket.id);
    const result = await analyzeTicketDescription(ticket.description);
    
    setAnalyzingId(null);
    if (result) {
      setAiAnalysisModal({ ticket, result });
    }
  };

  const applyAiAnalysis = () => {
    if (!aiAnalysisModal) return;
    const { ticket, result } = aiAnalysisModal;
    
    const categoryMap: any = { 
      'Incident': Category.INCIDENT, 
      'Request': Category.REQUEST, 
      'Change': Category.CHANGE, 
      'Problem': Category.PROBLEM,
      'Project': Category.PROJECT,
      'Development': Category.DEVELOPMENT
    };
    const priorityMap: any = {
      'Low': Priority.LOW,
      'Medium': Priority.MEDIUM,
      'High': Priority.HIGH,
      'Critical': Priority.CRITICAL
    };

    onUpdate(ticket.id, { 
      category: categoryMap[result.suggestedCategory] || ticket.category,
      priority: priorityMap[result.suggestedPriority] || ticket.priority,
      tags: [...ticket.tags, 'IA-Verified']
    });
    
    setAiAnalysisModal(null);
  };

  const handleConfirmEscalation = (ticketId: string, targetQueue: string, reason: string) => {
    if (onEscalateTicket) {
      onEscalateTicket(ticketId, targetQueue, reason);
    } else {
      const ticket = tickets.find(t => t.id === ticketId);
      const currentQueue = ticket ? getEffectiveQueue(ticket) : QUEUE_N1;
      const record: EscalationRecord = {
        id: `ESC-${Date.now()}`,
        fromQueue: currentQueue,
        toQueue: targetQueue,
        timestamp: new Date(),
        escalatedBy: currentUserName,
        reason
      };
      onUpdate(ticketId, {
        queue: targetQueue,
        status: ticket?.status === TicketStatus.OPEN ? TicketStatus.IN_PROGRESS : ticket?.status,
        escalations: [...(ticket?.escalations || []), record]
      });
    }
    // Update selectedTicket if open
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(prev => prev ? {
        ...prev,
        queue: targetQueue,
        status: prev.status === TicketStatus.OPEN ? TicketStatus.IN_PROGRESS : prev.status
      } : null);
    }
  };

  // Queue counts for badges
  const queueCounts = useMemo(() => {
    const active = tickets.filter(t => !t.isArchived);
    return {
      all: active.length,
      n1: active.filter(isTicketN1).length,
      n2: active.filter(isTicketN2).length,
      n3: active.filter(isTicketN3).length
    };
  }, [tickets]);

  const groupedTickets = useMemo(() => {
    let filtered = tickets.filter(t => showArchived ? t.isArchived : !t.isArchived);
    
    // Apply queue filter
    if (selectedQueueFilter === 'N1') {
      filtered = filtered.filter(isTicketN1);
    } else if (selectedQueueFilter === 'N2') {
      filtered = filtered.filter(isTicketN2);
    } else if (selectedQueueFilter === 'N3') {
      filtered = filtered.filter(isTicketN3);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(lower) ||
        t.id.toLowerCase().includes(lower) ||
        t.description.toLowerCase().includes(lower) ||
        t.requester.toLowerCase().includes(lower) ||
        t.company.toLowerCase().includes(lower) ||
        t.tags.some(tag => tag.toLowerCase().includes(lower))
      );
    }
    
    if (!groupByCompany) return { "Todos os Chamados": filtered };
    
    return filtered.reduce((acc, ticket) => {
      const company = ticket.company;
      if (!acc[company]) acc[company] = [];
      acc[company].push(ticket);
      acc[company].sort((a, b) => {
        const priorities = { [Priority.CRITICAL]: 4, [Priority.HIGH]: 3, [Priority.MEDIUM]: 2, [Priority.LOW]: 1 };
        return priorities[b.priority] - priorities[a.priority];
      });
      return acc;
    }, {} as Record<string, Ticket[]>);
  }, [tickets, groupByCompany, showArchived, selectedQueueFilter]);

  const getStatusStyle = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN: return 'bg-sky-50 text-sky-700 border-sky-100';
      case TicketStatus.IN_PROGRESS: return 'bg-brand-50 text-brand-700 border-brand-100';
      case TicketStatus.RESOLVED: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case TicketStatus.PENDING: return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case Priority.CRITICAL: return 'text-red-600 bg-red-100 border-red-200';
      case Priority.HIGH: return 'text-orange-600 bg-orange-100 border-orange-200';
      case Priority.MEDIUM: return 'text-brand-600 bg-brand-100 border-brand-200';
      default: return 'text-slate-500 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Demandas & Filas</h1>
          <p className="text-slate-500">Escalonamento multinível ITIL: N1 ➔ N2 ➔ N3</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button 
              onClick={() => setShowArchived(false)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${!showArchived ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <span>Ativos</span>
            </button>
            <button 
              onClick={() => setShowArchived(true)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${showArchived ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <span>Arquivados</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button 
              onClick={() => setGroupByCompany(true)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${groupByCompany ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Por Empresa</span>
            </button>
            <button 
              onClick={() => setGroupByCompany(false)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${!groupByCompany ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <List size={16} />
              <span className="hidden sm:inline">Lista Simples</span>
            </button>
          </div>
        </div>
      </div>

      {/* Queue Filter Tabs Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center space-x-1">
            <Layers size={14} className="text-brand-600" />
            <span>Filas:</span>
          </span>

          <button
            onClick={() => setSelectedQueueFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              selectedQueueFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Todas as Filas</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">{queueCounts.all}</span>
          </button>

          <button
            onClick={() => setSelectedQueueFilter('N1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              selectedQueueFilter === 'N1'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
            }`}
          >
            <span>Fila N1 (Abertos)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedQueueFilter === 'N1' ? 'bg-white/20' : 'bg-sky-200 text-sky-800'}`}>
              {queueCounts.n1}
            </span>
          </button>

          <button
            onClick={() => setSelectedQueueFilter('N2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              selectedQueueFilter === 'N2'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span>Fila N2 (Suporte Avançado)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedQueueFilter === 'N2' ? 'bg-white/20' : 'bg-amber-200 text-amber-800'}`}>
              {queueCounts.n2}
            </span>
          </button>

          <button
            onClick={() => setSelectedQueueFilter('N3')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              selectedQueueFilter === 'N3'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <span>Fila N3 (Especialistas)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedQueueFilter === 'N3' ? 'bg-white/20' : 'bg-purple-200 text-purple-800'}`}>
              {queueCounts.n3}
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por ID, título, solicitante..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium hidden xl:flex items-center space-x-1.5 whitespace-nowrap">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Status <strong>Aberto</strong> ➔ Fila N1</span>
          </div>
        </div>
      </div>

      {/* Main Groups / List */}
      <div className="space-y-8">
        {(Object.entries(groupedTickets) as [string, Ticket[]][]).map(([groupName, groupItems]) => (
          <div key={groupName} className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
            {groupByCompany && (
              <div className="flex items-center space-x-3 px-2">
                <div className="p-2 bg-brand-100 text-brand-700 rounded-lg">
                  <Building2 size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">{groupName}</h2>
                <span className="text-sm font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {groupItems.length} chamados
                </span>
              </div>
            )}
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Chamado</th>
                      {!groupByCompany && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Empresa</th>}
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fila / Nível</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Prioridade</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">SLA</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groupItems.map((ticket) => {
                      const effectiveQueue = getEffectiveQueue(ticket);
                      const canEscalateN1 = isTicketN1(ticket) && ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.CLOSED;
                      const canEscalateN2 = isTicketN2(ticket) && ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.CLOSED;

                      return (
                        <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-mono text-brand-600 font-bold">{ticket.id}</span>
                                {ticket.tags.includes('IA-Verified') && <BrainCircuit size={12} className="text-brand-400" />}
                              </div>
                              <span className="text-sm font-semibold text-slate-900 truncate max-w-xs">{ticket.title}</span>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase font-bold">{ticket.category}</span>
                                <span className="text-[10px] text-slate-400">Solicitante: {ticket.requester}</span>
                              </div>
                            </div>
                          </td>
                          {!groupByCompany && (
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2 text-sm text-slate-600 font-medium">
                                <Building2 size={14} className="text-slate-400" />
                                <span>{ticket.company}</span>
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <QueueBadge queue={effectiveQueue} />
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusStyle(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-md text-[11px] font-bold border ${getPriorityStyle(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-1.5">
                              <Clock size={14} className={ticket.priority === Priority.CRITICAL ? 'text-red-500' : 'text-slate-400'} />
                              <span className={`text-xs font-medium ${ticket.priority === Priority.CRITICAL ? 'text-red-600 animate-pulse' : 'text-slate-500'}`}>
                                {ticket.status === TicketStatus.RESOLVED ? 'OK' : (ticket.priority === Priority.CRITICAL ? 'URGENTE' : '2h 15m')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {/* Quick Escalation Buttons */}
                              {canEscalateN1 && (
                                <button
                                  onClick={() => setEscalatingTarget({ ticket, targetQueue: QUEUE_N2 })}
                                  className="flex items-center space-x-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold transition-all shadow-2xs"
                                  title="Escalar do N1 para o N2"
                                >
                                  <ArrowUpRight size={14} />
                                  <span>Escalar N2</span>
                                </button>
                              )}

                              {canEscalateN2 && (
                                <button
                                  onClick={() => setEscalatingTarget({ ticket, targetQueue: QUEUE_N3 })}
                                  className="flex items-center space-x-1 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition-all shadow-2xs"
                                  title="Escalar do N2 para o N3"
                                >
                                  <ArrowUpRight size={14} />
                                  <span>Escalar N3</span>
                                </button>
                              )}

                              <button 
                                onClick={() => handleAnalyze(ticket)}
                                disabled={analyzingId === ticket.id}
                                className={`p-2 rounded-lg transition-colors ${analyzingId === ticket.id ? 'bg-brand-50' : 'text-brand-600 hover:bg-brand-50'}`}
                                title="Análise IA"
                              >
                                {analyzingId === ticket.id ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-600 border-t-transparent" /> : <BrainCircuit size={18} />}
                              </button>
                              <button 
                                onClick={() => setSelectedTicket(ticket)}
                                className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"
                                title="Ver Detalhes"
                              >
                                <Eye size={18} />
                              </button>
                              {showArchived ? (
                                <button 
                                  onClick={() => setTicketToUnarchive(ticket.id)}
                                  className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"
                                  title="Restaurar"
                                >
                                  <ArchiveRestore size={18} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => setTicketToArchive(ticket.id)}
                                  className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"
                                  title="Arquivar"
                                >
                                  <Archive size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {groupItems.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                          Nenhum chamado encontrado com os filtros selecionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TicketDetailModal 
        ticket={selectedTicket} 
        onClose={() => setSelectedTicket(null)} 
        onUpdate={onUpdate}
        onRequestEscalate={(ticket, targetQueue) => setEscalatingTarget({ ticket, targetQueue })}
        onCreateProject={onCreateProject}
        onSplitClick={() => {
          setTicketToSplit(selectedTicket);
          setSelectedTicket(null);
        }}
        isAdmin={isAdmin}
      />

      <EscalateModal
        ticket={escalatingTarget?.ticket || null}
        targetQueue={escalatingTarget?.targetQueue || ''}
        onClose={() => setEscalatingTarget(null)}
        onConfirm={handleConfirmEscalation}
      />

      <SplitTicketModal
        parentTicket={ticketToSplit}
        onClose={() => setTicketToSplit(null)}
        onSave={onSplitTicket}
      />

      {aiAnalysisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-brand-50">
              <div className="flex items-center space-x-2 text-brand-700">
                <BrainCircuit size={20} />
                <h3 className="text-lg font-bold">Análise da IA</h3>
              </div>
              <button onClick={() => setAiAnalysisModal(null)} className="p-1 hover:bg-brand-100 rounded-full text-brand-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Categoria Sugerida</span>
                  <span className="font-medium text-slate-800">{aiAnalysisModal.result.suggestedCategory}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Prioridade Sugerida</span>
                  <span className="font-medium text-slate-800">{aiAnalysisModal.result.suggestedPriority}</span>
                </div>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase mb-2">Justificativa</span>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {aiAnalysisModal.result.justification}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button 
                onClick={() => setAiAnalysisModal(null)} 
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
              >
                Ignorar
              </button>
              <button 
                onClick={applyAiAnalysis}
                className="px-6 py-2 bg-brand-600 text-white rounded-lg font-bold shadow-md hover:bg-brand-700 transition-colors"
              >
                Aplicar Mudanças
              </button>
            </div>
          </div>
        </div>
      )}

      {ticketToArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <Archive size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Arquivar Chamado?</h3>
              <p className="text-slate-500">
                Este chamado não aparecerá mais nas listas ativas.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center space-x-3">
              <button 
                onClick={() => setTicketToArchive(null)} 
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  onArchive(ticketToArchive);
                  setTicketToArchive(null);
                }}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg font-bold shadow-md hover:bg-amber-700 transition-colors"
              >
                Arquivar
              </button>
            </div>
          </div>
        </div>
      )}

      {ticketToUnarchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <ArchiveRestore size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Restaurar Chamado?</h3>
              <p className="text-slate-500">
                Este chamado voltará a aparecer nas listas ativas.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center space-x-3">
              <button 
                onClick={() => setTicketToUnarchive(null)} 
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  onUnarchive(ticketToUnarchive);
                  setTicketToUnarchive(null);
                }}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold shadow-md hover:bg-emerald-700 transition-colors"
              >
                Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsView;
