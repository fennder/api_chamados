
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket as TicketIcon, 
  Settings, 
  ShieldCheck, 
  Briefcase, 
  ChevronRight, 
  Bell, 
  Search,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  Paperclip,
  FileText,
  Split,
  Image as ImageIcon,
  Users,
  Layers,
  Menu,
  Palette
} from 'lucide-react';
import DashboardView from './views/DashboardView';
import TicketsView from './views/TicketsView';
import ProjectsView from './views/ProjectsView';
import GovernanceView from './views/GovernanceView';
import CompaniesView from './views/CompaniesView';
import SettingsView from './views/SettingsView';
import UsersView from './views/UsersView';
import AnnouncementsView from './views/AnnouncementsView';
import QueuesView from './views/QueuesView';
import PublicBIView from './views/PublicBIView';
import OnboardingGuide from './components/OnboardingGuide';
import { Ticket, TicketStatus, Priority, Category, Company, AppSettings, Project, Attachment, AppNotification, User, UserRole, Announcement, Queue, EscalationRecord } from './types';

const INITIAL_COMPANIES: Company[] = [
  { id: 'COMP-1', name: 'Alpha Corp', isActive: true, createdAt: new Date() },
  { id: 'COMP-2', name: 'Beta Soft', isActive: true, createdAt: new Date() },
  { id: 'COMP-3', name: 'Gamma Logistics', isActive: true, createdAt: new Date() },
];

const INITIAL_USERS: User[] = [
  { id: 'USR-1', name: 'Admin Master', email: 'admin@sistema.com', role: UserRole.ADMIN, companyIds: [], isActive: true, createdAt: new Date(), accessCount: 5 },
  { id: 'USR-2', name: 'João Responsável', email: 'joao@alpha.com', role: UserRole.MANAGER, companyIds: ['COMP-1'], isActive: true, createdAt: new Date(), accessCount: 0 },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ANN-1',
    title: 'Atualização do Sistema',
    message: 'Lançamos a nova Central de Avisos para melhorar a comunicação com todos os responsáveis.',
    targetRole: 'ALL',
    createdAt: new Date(),
    isSystem: true,
    createdBy: 'Sistema'
  }
];

export const QUEUE_N1 = 'N1 - Suporte Nível 1';
export const QUEUE_N2 = 'N2 - Suporte Nível 2';
export const QUEUE_N3 = 'N3 - Especialistas';
export const QUEUE_DEV = 'Desenvolvimento';

const INITIAL_SETTINGS: AppSettings = {
  categorySlas: {
    [Category.INCIDENT]: 4,
    [Category.REQUEST]: 24,
    [Category.CHANGE]: 48,
    [Category.PROBLEM]: 72,
    [Category.PROJECT]: 168,
    [Category.DEVELOPMENT]: 168
  },
  categoryQueues: {
    [Category.INCIDENT]: QUEUE_N1,
    [Category.REQUEST]: QUEUE_N1,
    [Category.CHANGE]: 'Change Management',
    [Category.PROBLEM]: QUEUE_N3,
    [Category.PROJECT]: 'PMO',
    [Category.DEVELOPMENT]: QUEUE_DEV
  }
};

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TICK-1001',
    title: 'Falha no servidor de banco de dados produção',
    description: 'O servidor de banco de dados parou de responder a conexões externas.',
    company: 'Alpha Corp',
    status: TicketStatus.IN_PROGRESS,
    priority: Priority.CRITICAL,
    category: Category.INCIDENT,
    requester: 'Admin Redes',
    assignedTo: 'Carlos Dev',
    queue: QUEUE_N2,
    escalations: [
      {
        id: 'ESC-1',
        fromQueue: QUEUE_N1,
        toQueue: QUEUE_N2,
        timestamp: new Date(Date.now() - 3600000),
        escalatedBy: 'Admin Redes',
        reason: 'Falha crítica de banco em produção; triagem N1 concluída e escalada para infraestrutura N2.'
      }
    ],
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(),
    slaDeadline: new Date(Date.now() + 7200000),
    tags: ['Infraestrutura'],
    isArchived: false
  },
  {
    id: 'TICK-1002',
    title: 'Solicitação de novo software - Adobe Creative Cloud',
    description: 'O time de design necessita de licenças.',
    company: 'Beta Soft',
    status: TicketStatus.OPEN,
    priority: Priority.MEDIUM,
    category: Category.REQUEST,
    requester: 'Ana Designer',
    assignedTo: 'Suporte N1',
    queue: QUEUE_N1,
    escalations: [],
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(),
    slaDeadline: new Date(Date.now() + 86400000 * 3),
    tags: ['Software'],
    isArchived: false
  },
  {
    id: 'TICK-1003',
    title: 'Modernização ERP - Módulo Fiscal',
    description: 'Projeto para atualizar o módulo fiscal do ERP.',
    company: 'Alpha Corp',
    status: TicketStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    category: Category.PROJECT,
    requester: 'João Silva',
    assignedTo: 'Eduardo Silva',
    queue: QUEUE_N3,
    escalations: [
      {
        id: 'ESC-2',
        fromQueue: QUEUE_N1,
        toQueue: QUEUE_N2,
        timestamp: new Date(Date.now() - 2500000),
        escalatedBy: 'João Silva',
        reason: 'Triagem de escopo de ERP iniciada no N1 e encaminhada para N2.'
      },
      {
        id: 'ESC-3',
        fromQueue: QUEUE_N2,
        toQueue: QUEUE_N3,
        timestamp: new Date(Date.now() - 1500000),
        escalatedBy: 'Carlos Dev',
        reason: 'Complexidade de regras fiscais e SEFAZ; necessária intervenção de Especialistas N3.'
      }
    ],
    createdAt: new Date(Date.now() - 1800000),
    updatedAt: new Date(),
    slaDeadline: new Date(Date.now() + 14400000),
    tags: ['ERP', 'Fiscal'],
    isArchived: false
  }
];

const INITIAL_QUEUES: Queue[] = [
  { id: 'Q-1', name: QUEUE_N1, isActive: true, createdAt: new Date() },
  { id: 'Q-2', name: QUEUE_N2, isActive: true, createdAt: new Date() },
  { id: 'Q-3', name: QUEUE_N3, isActive: true, createdAt: new Date() },
  { id: 'Q-4', name: QUEUE_DEV, isActive: true, createdAt: new Date() },
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'PROJ-1001',
    ticketId: 'TICK-1003',
    title: 'Modernização ERP - Módulo Fiscal',
    description: 'Projeto para atualizar o módulo fiscal do ERP.',
    company: 'Alpha Corp',
    status: 'Em Andamento',
    progress: 30,
    manager: 'Eduardo Silva',
    createdAt: new Date(Date.now() - 86400000 * 5),
    deadline: new Date(Date.now() + 86400000 * 30),
    documentation: {
      requirements: '1. Atualizar alíquotas\n2. Integrar com SEFAZ\n3. Relatórios mensais',
      prototypeLink: 'https://figma.com/file/12345',
      isSigned: false
    },
    isArchived: false,
    tasks: []
  }
];

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string, onClick?: () => void }> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        isActive ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const NewTicketModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (t: Partial<Ticket>) => void, companies: Company[] }> = ({ isOpen, onClose, onSave, companies }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: companies.length > 0 ? companies[0].name : '',
    priority: Priority.MEDIUM,
    category: Category.INCIDENT
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (isOpen && companies.length > 0 && !formData.company) {
      setFormData(prev => ({ ...prev, company: companies[0].name }));
    }
  }, [isOpen, companies]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          url: event.target?.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSave = () => {
    onSave({ ...formData, attachments });
    setFormData({
      title: '',
      description: '',
      company: companies.length > 0 ? companies[0].name : '',
      priority: Priority.MEDIUM,
      category: Category.INCIDENT
    });
    setAttachments([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Novo Chamado</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
            <input 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
              <select 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                value={formData.company}
                onChange={e => setFormData({...formData, company: e.target.value})}
              >
                {companies.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Anexos (Imagens e PDFs)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Paperclip className="w-6 h-6 mb-2 text-slate-400" />
                  <p className="text-xs text-slate-500"><span className="font-semibold">Clique para anexar</span> ou arraste</p>
                </div>
                <input type="file" className="hidden" multiple accept="image/*,application/pdf" onChange={handleFileUpload} />
              </label>
            </div>
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map(att => (
                  <div key={att.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      {att.type.includes('image') ? <ImageIcon size={16} className="text-brand-500 flex-shrink-0" /> : <FileText size={16} className="text-rose-500 flex-shrink-0" />}
                      <span className="text-xs font-medium text-slate-700 truncate">{att.name}</span>
                    </div>
                    <button onClick={() => removeAttachment(att.id)} className="text-slate-400 hover:text-red-500">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium">Cancelar</button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-brand-600 text-white rounded-lg font-bold shadow-md hover:bg-brand-700"
          >
            Abrir Chamado
          </button>
        </div>
      </div>
    </div>
  );
};

const THEMES: Record<string, Record<string, string>> = {
  blue: {
    50: '#f0f5fa',
    100: '#e0ebf5',
    200: '#b3d1e8',
    300: '#85b8db',
    400: '#3385c2',
    500: '#005b9e',
    600: '#004f8c',
    700: '#003e6e',
    800: '#003057',
    900: '#13294b',
    950: '#0a172a',
  },
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
    950: '#4c0519',
  },
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  }
};

const App: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [queues, setQueues] = useState<Queue[]>(INITIAL_QUEUES);
  const [currentUserId, setCurrentUserId] = useState<string>('USR-1');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [readAnnouncements, setReadAnnouncements] = useState<Record<string, string[]>>({});
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const [showNotifications, setShowNotifications] = useState(false);

  const allNotifications = useMemo(() => {
    const userReadAnns = readAnnouncements[currentUser.id] || [];
    const annNotifs = announcements
      .filter(a => a.targetRole === 'ALL' || a.targetRole === currentUser.role)
      .map(a => ({
        id: a.id,
        title: a.title,
        message: a.message,
        read: userReadAnns.includes(a.id),
        createdAt: a.createdAt,
        type: 'announcement' as const
      }));

    return [...notifications, ...annNotifs].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [notifications, announcements, currentUser.id, currentUser.role, readAnnouncements]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setReadAnnouncements(prev => {
      const userRead = prev[currentUser.id] || [];
      const newRead = announcements
        .filter(a => a.targetRole === 'ALL' || a.targetRole === currentUser.role)
        .map(a => a.id);
      return {
        ...prev,
        [currentUser.id]: Array.from(new Set([...userRead, ...newRead]))
      };
    });
  };

  useEffect(() => {
    // Check onboarding
    if (currentUser.accessCount !== undefined && currentUser.accessCount < 5) {
      setShowOnboarding(true);
    }
    
    // Apply user theme if set
    const userTheme = currentUser.themeColor || 'blue';
    const themeColors = THEMES[userTheme] || THEMES['blue'];
    const root = document.documentElement;
    Object.keys(themeColors).forEach(weight => {
      root.style.setProperty(`--brand-${weight}`, themeColors[weight]);
    });
  }, [currentUserId, currentUser.themeColor]);

  const handleThemeChange = (color: string) => {
    setUsers(prev => prev.map(u => u.id === currentUserId ? { ...u, themeColor: color } : u));
    setShowThemePicker(false);
  };

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false);
    setUsers(prev => prev.map(u => 
      u.id === currentUserId ? { ...u, accessCount: (u.accessCount || 0) + 1 } : u
    ));
  };

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  useEffect(() => {
    const checkResolvedTickets = () => {
      setTickets(prevTickets => {
        const now = new Date();
        let hasChanges = false;
        const updated = prevTickets.map(ticket => {
          if (ticket.status === TicketStatus.RESOLVED && !ticket.isArchived) {
            let count = 0;
            let curDate = new Date(ticket.updatedAt.getTime());
            while (curDate < now) {
              const dayOfWeek = curDate.getDay();
              if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
              curDate.setDate(curDate.getDate() + 1);
            }
            if (count >= 5) {
              hasChanges = true;
              return { ...ticket, status: TicketStatus.CLOSED, isArchived: true, updatedAt: new Date() };
            }
          }
          return ticket;
        });
        return hasChanges ? updated : prevTickets;
      });
    };

    checkResolvedTickets();
    const interval = setInterval(checkResolvedTickets, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateCompany = (data: Partial<Company>) => {
    const newCompany: Company = {
      id: `COMP-${1000 + companies.length + 1}`,
      name: data.name || 'Nova Empresa',
      cnpj: data.cnpj,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      isActive: data.isActive ?? true,
      createdAt: new Date()
    };
    setCompanies([...companies, newCompany]);
    setAlertMessage('Empresa cadastrada com sucesso!');
  };

  const handleUpdateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    setAlertMessage('Empresa atualizada com sucesso!');
  };

  const handleDeleteCompany = (id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
  };

  useEffect(() => {
    // Auto-archive tickets closed for more than 48 hours
    const interval = setInterval(() => {
      setTickets(prev => {
        let changed = false;
        const now = Date.now();
        const updated = prev.map(t => {
          if (t.status === TicketStatus.CLOSED && t.closedAt && !t.isArchived) {
            if (now - t.closedAt.getTime() > 48 * 60 * 60 * 1000) {
              changed = true;
              return { ...t, isArchived: true, updatedAt: new Date() };
            }
          }
          return t;
        });
        return changed ? updated : prev;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateTicket = (data: Partial<Ticket>) => {
    const category = data.category || Category.INCIDENT;
    const slaHours = appSettings.categorySlas[category] || 4;

    const newTicket: Ticket = {
      id: `TICK-${1000 + tickets.length + 1}`,
      title: data.title || 'Sem título',
      description: data.description || '',
      company: data.company || (companies.length > 0 ? companies[0].name : 'Alpha Corp'),
      status: TicketStatus.OPEN,
      priority: data.priority || Priority.MEDIUM,
      category: category,
      requester: currentUser.name,
      assignedTo: QUEUE_N1,
      queue: QUEUE_N1, // Chamados no status de aberto devem estar na fila N1
      escalations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      slaDeadline: new Date(Date.now() + slaHours * 3600000),
      tags: [],
      isArchived: false,
      attachments: data.attachments || []
    };
    setTickets([newTicket, ...tickets]);
    setIsModalOpen(false);
    setAlertMessage(`Chamado ${newTicket.id} aberto e posicionado na Fila N1!`);
  };

  const handleUpdateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets(prev => {
      const ticket = prev.find(t => t.id === id);
      if (!ticket) return prev;

      const finalUpdates = { ...updates };

      // REGRA: Chamados no status de aberto devem estar na fila N1
      if (updates.status === TicketStatus.OPEN && ticket.queue !== QUEUE_N1) {
        finalUpdates.queue = QUEUE_N1;
      }

      if (updates.status && updates.status !== ticket.status) {
        const queueNote = finalUpdates.queue && finalUpdates.queue !== ticket.queue ? ` (Fila: ${finalUpdates.queue})` : '';
        const newNotif: AppNotification = {
          id: `NOTIF-${Date.now()}`,
          message: `O chamado ${ticket.id} mudou o status para ${updates.status}${queueNote}.`,
          ticketId: id,
          read: false,
          createdAt: new Date()
        };
        setNotifications(n => [newNotif, ...n]);
      }
      
      let closedAtUpdate = {};
      if (updates.status === TicketStatus.CLOSED && ticket?.status !== TicketStatus.CLOSED) {
        closedAtUpdate = { closedAt: new Date() };
      } else if (updates.status && updates.status !== TicketStatus.CLOSED && ticket?.status === TicketStatus.CLOSED) {
        closedAtUpdate = { closedAt: undefined };
      }

      return prev.map(t => t.id === id ? { ...t, ...finalUpdates, ...closedAtUpdate, updatedAt: new Date() } : t);
    });
    if (updates.status) setAlertMessage('Status do chamado atualizado.');
    else setAlertMessage('Chamado atualizado com sucesso.');
  };

  const handleEscalateTicket = (id: string, targetQueue: string, reason?: string) => {
    setTickets(prev => {
      const ticket = prev.find(t => t.id === id);
      if (!ticket) return prev;

      const currentQueue = ticket.queue || QUEUE_N1;
      const escalationRecord: EscalationRecord = {
        id: `ESC-${Date.now()}`,
        fromQueue: currentQueue,
        toQueue: targetQueue,
        timestamp: new Date(),
        escalatedBy: currentUser.name,
        reason: reason || `Escalonamento de ${currentQueue} para ${targetQueue}`
      };

      // Ao escalar do N1 ou N2, se o status for Aberto, atualiza para Em Atendimento
      const newStatus = ticket.status === TicketStatus.OPEN ? TicketStatus.IN_PROGRESS : ticket.status;

      const newNotif: AppNotification = {
        id: `NOTIF-${Date.now()}`,
        message: `Chamado ${ticket.id} foi escalado de ${currentQueue} para ${targetQueue} por ${currentUser.name}.`,
        ticketId: id,
        read: false,
        createdAt: new Date(),
        type: 'ticket'
      };
      setNotifications(n => [newNotif, ...n]);

      return prev.map(t => t.id === id ? {
        ...t,
        queue: targetQueue,
        status: newStatus,
        assignedTo: targetQueue,
        escalations: [...(t.escalations || []), escalationRecord],
        updatedAt: new Date()
      } : t);
    });

    setAlertMessage(`Chamado ${id} escalado com sucesso para ${targetQueue}!`);
  };

  const handleSplitTicket = (parentId: string, data: Partial<Ticket>) => {
    const parentTicket = tickets.find(t => t.id === parentId);
    if (!parentTicket) return;

    const category = data.category || Category.INCIDENT;
    const slaHours = appSettings.categorySlas[category] || 4;

    const newTicket: Ticket = {
      id: `TICK-${1000 + tickets.length + 1}`,
      title: data.title || `[Desmembrado] ${parentTicket.title}`,
      description: data.description || '',
      company: parentTicket.company,
      status: TicketStatus.OPEN,
      priority: data.priority || parentTicket.priority,
      category: category,
      requester: parentTicket.requester,
      assignedTo: QUEUE_N1,
      queue: QUEUE_N1, // Chamados no status de aberto devem estar na fila N1
      escalations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      slaDeadline: new Date(Date.now() + slaHours * 3600000),
      tags: [...parentTicket.tags, 'Desmembrado'],
      isArchived: false,
      parentId: parentId
    };
    setTickets([newTicket, ...tickets]);
    setAlertMessage(`Chamado desmembrado com sucesso na Fila N1! Novo ticket: ${newTicket.id}`);
  };

  const handleArchiveTicket = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, isArchived: true, updatedAt: new Date() } : t));
  };

  const handleUnarchiveTicket = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, isArchived: false, updatedAt: new Date() } : t));
  };

  const handleCreateProjectFromTicket = (ticket: Ticket) => {
    // Check if project already exists for this ticket
    if (projects.some(p => p.ticketId === ticket.id)) {
      setAlertMessage('Já existe um projeto vinculado a este chamado.');
      return;
    }

    const newProject: Project = {
      id: `PROJ-${1000 + projects.length + 1}`,
      ticketId: ticket.id,
      title: ticket.title,
      description: ticket.description,
      company: ticket.company,
      status: 'Planejado',
      progress: 0,
      manager: 'Não atribuído',
      createdAt: new Date(),
      deadline: new Date(Date.now() + 86400000 * 30), // 30 days from now
      documentation: {
        requirements: '## Levantamento de Requisitos\n\n**1. Objetivo do Projeto:**\n[Descreva o objetivo principal]\n\n**2. Escopo:**\n[O que está incluído e o que não está]\n\n**3. Requisitos Funcionais:**\n- [Requisito 1]\n- [Requisito 2]\n\n**4. Requisitos Não Funcionais:**\n- [Desempenho, segurança, etc.]\n\n**5. Critérios de Aceite:**\n[Como saberemos que o projeto foi concluído com sucesso?]',
        prototypeLink: '',
        isSigned: false
      },
      isArchived: false,
      tasks: []
    };
    setProjects([newProject, ...projects]);
    setAlertMessage('Projeto gerado com sucesso a partir do chamado!');
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleArchiveProject = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isArchived: true } : p));
  };

  const handleUnarchiveProject = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isArchived: false } : p));
  };

  const handleCreateUser = (data: Partial<User>) => {
    const newUser: User = {
      id: `USR-${Date.now()}`,
      name: data.name || '',
      email: data.email || '',
      role: data.role || UserRole.MANAGER,
      companyIds: data.companyIds || [],
      isActive: true,
      createdAt: new Date()
    };
    setUsers([...users, newUser]);
    setAlertMessage('Responsável cadastrado com sucesso!');
  };

  const handleUpdateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    setAlertMessage('Usuário atualizado com sucesso!');
  };

  const handleCreateQueue = (data: Partial<Queue>) => {
    const newQueue: Queue = {
      id: `Q-${Date.now()}`,
      name: data.name || '',
      isActive: true,
      createdAt: new Date()
    };
    setQueues([...queues, newQueue]);
    setAlertMessage('Fila cadastrada com sucesso!');
  };

  const handleUpdateQueue = (id: string, updates: Partial<Queue>) => {
    setQueues(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
    setAlertMessage('Fila atualizada com sucesso!');
  };

  // Filter based on currentUser role
  const handleCreateAnnouncement = (data: Partial<Announcement>) => {
    const newAnnouncement: Announcement = {
      id: `ANN-${Date.now()}`,
      title: data.title || '',
      message: data.message || '',
      targetRole: data.targetRole || 'ALL',
      createdAt: new Date(),
      isSystem: false,
      createdBy: currentUser.name
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setAlertMessage('Aviso publicado com sucesso!');
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const isManager = currentUser.role === UserRole.MANAGER;
  const isN1 = currentUser.role === UserRole.N1;
  const isN2 = currentUser.role === UserRole.N2;
  const isN3 = currentUser.role === UserRole.N3;
  const isDev = currentUser.role === UserRole.DEV;

  const isInternalUser = !isManager;
  const isAdmin = currentUser.role === UserRole.ADMIN;

  const showDashboard = isAdmin || isManager || isDev;
  const showTickets = true;
  const showCompanies = isAdmin || isManager || isN1 || isDev;
  const showAnnouncements = isAdmin || isManager || isDev;
  const showProjects = isAdmin || isN3 || isDev;
  const showGovernance = isAdmin || isDev;
  const showSettings = isAdmin;
  const showUsers = isAdmin;
  const showQueues = isAdmin;

  const visibleTickets = isInternalUser 
    ? tickets 
    : tickets.filter(t => {
        const company = companies.find(c => c.name === t.company);
        return company && currentUser.companyIds.includes(company.id);
      });

  const visibleCompanies = isInternalUser 
    ? companies 
    : companies.filter(c => currentUser.companyIds.includes(c.id) || !c.isActive); // show their own, and maybe pending ones if they created? Actually let's just let managers see only active companies they own in the Tickets modal. In the view, they see what they created or own. For simplicity, managers see all companies they are responsible for.

  const activeTickets = visibleTickets.filter(t => !t.isArchived);
  const activeProjects = projects.filter(p => !p.isArchived);

  return (
    <HashRouter>
      <Routes>
        <Route path="/bi" element={<PublicBIView tickets={tickets} projects={projects} companies={companies} users={users} />} />
        <Route path="/*" element={
          <>
            <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Mobile sidebar overlay */}
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity" 
                onClick={() => setIsSidebarOpen(false)} 
              />
            )}
        
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col flex-shrink-0 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-white">
              <img src="/logo.svg" alt="Abrindo Portas Logo" className="w-10 h-10 object-contain" />
              <span className="text-lg font-bold tracking-tight">ABRINDO PORTAS</span>
            </div>
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {showDashboard && <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => setIsSidebarOpen(false)} />}
            {showTickets && <SidebarLink to="/tickets" icon={<TicketIcon size={20} />} label="Chamados" onClick={() => setIsSidebarOpen(false)} />}
            {showCompanies && <SidebarLink to="/companies" icon={<Building2 size={20} />} label="Empresas" onClick={() => setIsSidebarOpen(false)} />}
            {showProjects && <SidebarLink to="/projects" icon={<Briefcase size={20} />} label="Projetos & Dev" onClick={() => setIsSidebarOpen(false)} />}
            {showGovernance && <SidebarLink to="/governance" icon={<ShieldCheck size={20} />} label="Governança" onClick={() => setIsSidebarOpen(false)} />}
            {showAnnouncements && <SidebarLink to="/announcements" icon={<Bell size={20} />} label="Avisos" onClick={() => setIsSidebarOpen(false)} />}
            {showSettings && <SidebarLink to="/settings" icon={<Settings size={20} />} label="Configurações" onClick={() => setIsSidebarOpen(false)} />}
            {showUsers && <SidebarLink to="/users" icon={<Users size={20} />} label="Responsáveis" onClick={() => setIsSidebarOpen(false)} />}
            {showQueues && <SidebarLink to="/queues" icon={<Layers size={20} />} label="Filas" onClick={() => setIsSidebarOpen(false)} />}
          </nav>
          <div className="p-4 mt-auto border-t border-slate-800 relative">
            <div 
              className="bg-slate-800 rounded-xl p-4 flex items-center space-x-3 relative group cursor-pointer hover:bg-slate-700 transition-colors"
              onClick={() => setShowThemePicker(!showThemePicker)}
            >
              <div className="w-10 h-10 rounded-full bg-brand-500 overflow-hidden flex items-center justify-center text-white font-bold flex-shrink-0 transition-colors">
                {currentUser.name.charAt(0)}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400 truncate">{currentUser.role}</p>
              </div>
              <Palette size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Theme Picker Popover */}
            {showThemePicker && (
              <div className="absolute bottom-full left-4 mb-2 w-56 bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-3 z-50 animate-in fade-in slide-in-from-bottom-2">
                <div className="text-xs font-medium text-slate-400 mb-3 px-1 uppercase tracking-wider">Cor do Tema</div>
                <div className="grid grid-cols-5 gap-2">
                  {Object.keys(THEMES).map(theme => (
                    <button
                      key={theme}
                      onClick={() => handleThemeChange(theme)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${
                        currentUser.themeColor === theme ? 'border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: THEMES[theme][500] }}
                      title={`Tema ${theme}`}
                    >
                      {currentUser.themeColor === theme && <CheckCircle2 size={14} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden w-full relative">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm">
            <div className="flex items-center space-x-2 md:space-x-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 md:hidden text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
              
              <div className="relative w-40 sm:w-64 md:w-96 hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar chamados, ativos..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-brand-500 text-sm transition-all"
                />
              </div>
              
              {/* User Switcher (for demo purposes) */}
              <div className="flex items-center space-x-2 border-l border-slate-200 pl-2 md:pl-4">
                <span className="hidden lg:inline text-xs text-slate-500 font-medium">Simular Acesso:</span>
                <select 
                  className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-brand-500 w-32 md:w-auto"
                  value={currentUserId}
                  onChange={e => setCurrentUserId(e.target.value)}
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors"
                >
                  <Bell size={20} />
                  {allNotifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {allNotifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h4 className="font-bold text-slate-800">Notificações</h4>
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-xs text-brand-600 hover:text-brand-800 font-medium"
                      >
                        Marcar como lidas
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {allNotifications.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-sm">Nenhuma notificação</div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {allNotifications.map(notif => (
                            <div key={notif.id} className={`p-4 ${notif.read ? 'bg-white' : 'bg-brand-50/50'}`}>
                              {notif.type === 'announcement' && (
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 mb-1">
                                  AVISO
                                </span>
                              )}
                              <p className="text-sm text-slate-800 font-medium">{notif.title || notif.message}</p>
                              {notif.title && <p className="text-sm text-slate-600 mt-1">{notif.message}</p>}
                              <span className="text-xs text-slate-400 mt-1 block">
                                {notif.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors shadow-sm"
              >
                <PlusCircle size={18} />
                <span>Novo Chamado</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            <Routes>
              {showDashboard && <Route path="/" element={<DashboardView tickets={activeTickets} projects={activeProjects} isAdmin={isInternalUser} />} />}
              {showTickets && <Route path="/tickets" element={<TicketsView tickets={visibleTickets} onUpdate={handleUpdateTicket} onArchive={handleArchiveTicket} onUnarchive={handleUnarchiveTicket} onCreateProject={handleCreateProjectFromTicket} onSplitTicket={handleSplitTicket} onEscalateTicket={handleEscalateTicket} currentUserName={currentUser.name} isAdmin={isInternalUser} />} />}
              {showCompanies && <Route path="/companies" element={<CompaniesView companies={visibleCompanies} isAdmin={isAdmin} onCreate={handleCreateCompany} onUpdate={handleUpdateCompany} onDelete={handleDeleteCompany} />} />}
              {showProjects && <Route path="/projects" element={<ProjectsView projects={projects} onUpdateProject={handleUpdateProject} onArchiveProject={handleArchiveProject} onUnarchiveProject={handleUnarchiveProject} />} />}
              {showGovernance && <Route path="/governance" element={<GovernanceView tickets={activeTickets} />} />}
              {showAnnouncements && <Route path="/announcements" element={<AnnouncementsView announcements={announcements} currentUser={currentUser} onCreate={handleCreateAnnouncement} onDelete={handleDeleteAnnouncement} />} />}
              {showSettings && <Route path="/settings" element={<SettingsView settings={appSettings} onUpdateSettings={setAppSettings} />} />}
              {showUsers && <Route path="/users" element={<UsersView users={users} companies={companies} onCreate={handleCreateUser} onUpdate={handleUpdateUser} />} />}
              {showQueues && <Route path="/queues" element={<QueuesView queues={queues} tickets={tickets} onCreate={handleCreateQueue} onUpdate={handleUpdateQueue} />} />}
              
              {/* Default fallback if a user has no access to the base route */}
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <ShieldCheck size={48} className="mb-4 text-slate-300" />
                  <h2 className="text-xl font-medium mb-2">Bem-vindo ao Abrindo Portas</h2>
                  <p>Selecione uma opção no menu lateral para começar.</p>
                </div>
              } />
            </Routes>
          </div>
        </main>
      </div>
      <NewTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleCreateTicket} 
        companies={currentUser.role === UserRole.ADMIN ? companies.filter(c => c.isActive) : companies.filter(c => currentUser.companyIds.includes(c.id) && c.isActive)}
      />
      {showOnboarding && <OnboardingGuide currentUser={currentUser} onComplete={handleCompleteOnboarding} />}
      {alertMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3">
            <CheckCircle2 size={24} className="text-emerald-400" />
            <p className="font-medium">{alertMessage}</p>
            <button 
              onClick={() => setAlertMessage(null)}
              className="ml-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
          </>
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;
