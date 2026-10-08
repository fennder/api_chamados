
export enum TicketStatus {
  OPEN = 'Aberto',
  IN_PROGRESS = 'Em Atendimento',
  PENDING = 'Pendente',
  RESOLVED = 'Resolvido',
  CLOSED = 'Fechado'
}

export enum Priority {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta',
  CRITICAL = 'Crítica'
}

export enum Category {
  INCIDENT = 'Incidente',
  REQUEST = 'Requisição de Serviço',
  CHANGE = 'Gerenciamento de Mudança',
  PROBLEM = 'Problema',
  PROJECT = 'Projeto',
  DEVELOPMENT = 'Desenvolvimento'
}

export enum ProjectTaskStatus {
  BACKLOG = 'Backlog',
  TODO = 'A Fazer (Sprint)',
  IN_PROGRESS = 'Em Andamento',
  DONE = 'Concluído'
}

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
}

export interface AppNotification {
  id: string;
  message: string;
  ticketId?: string;
  read: boolean;
  createdAt: Date;
  title?: string;
  type?: 'ticket' | 'announcement';
}

export interface EscalationRecord {
  id: string;
  fromQueue: string;
  toQueue: string;
  timestamp: Date;
  escalatedBy: string;
  reason?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  company: string; // Novo campo para identificar a empresa cliente
  status: TicketStatus;
  priority: Priority;
  category: Category;
  requester: string;
  assignedTo?: string;
  queue?: string; // Fila de atendimento (ex: 'N1 - Suporte Nível 1', 'N2 - Suporte Nível 2', 'N3 - Especialistas')
  escalations?: EscalationRecord[];
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  slaDeadline: Date;
  tags: string[];
  isArchived?: boolean;
  attachments?: Attachment[];
  parentId?: string;
}

export interface ProjectDocumentation {
  requirements: string;
  prototypeLink: string;
  isSigned: boolean;
  signedBy?: string;
  signedAt?: Date;
}

export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: ProjectTaskStatus;
  createdAt: Date;
}

export interface Project {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  company: string;
  status: 'Planejado' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  progress: number;
  manager: string;
  createdAt: Date;
  deadline: Date;
  documentation: ProjectDocumentation;
  isArchived?: boolean;
  tasks?: ProjectTask[];
}

export interface Queue {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AppSettings {
  categorySlas: Record<Category, number>;
  categoryQueues: Record<Category, string>;
}

export interface DashboardStats {
  openTickets: number;
  slaCompliance: number;
  avgResolutionTime: string;
  activeProjects: number;
}

export enum UserRole {
  ADMIN = 'Administrador',
  MANAGER = 'Responsável',
  N1 = 'N1',
  N2 = 'N2',
  N3 = 'N3',
  DEV = 'Desenvolvimento'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyIds: string[];
  isActive: boolean;
  createdAt: Date;
  accessCount?: number;
  themeColor?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  targetRole: UserRole | 'ALL';
  createdAt: Date;
  isSystem: boolean;
  createdBy?: string;
}
