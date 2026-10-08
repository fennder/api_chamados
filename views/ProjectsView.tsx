
import React, { useState } from 'react';
import { 
  Kanban, 
  Layers, 
  Users, 
  Calendar,
  CheckSquare,
  MoreVertical,
  Plus,
  FileText,
  Link as LinkIcon,
  CheckCircle,
  X,
  Archive,
  ArchiveRestore,
  ListTodo
} from 'lucide-react';
import { Project, ProjectTask, ProjectTaskStatus, Priority } from '../types';

interface ProjectsViewProps {
  projects: Project[];
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onArchiveProject: (id: string) => void;
  onUnarchiveProject: (id: string) => void;
}

const Sprints = [
  { name: 'Sprint 24 - Checkout', progress: 75, status: 'Ativa', members: 5 },
  { name: 'Sprint 25 - Integração Pix', progress: 20, status: 'Planejada', members: 4 },
];

const ProjectDocumentationModal: React.FC<{
  project: Project | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}> = ({ project, onClose, onUpdate }) => {
  if (!project) return null;

  const [docs, setDocs] = useState(project.documentation);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = () => {
    onUpdate(project.id, { documentation: docs });
    onClose();
  };

  const handleSign = () => {
    const signedDocs = {
      ...docs,
      isSigned: true,
      signedBy: 'Cliente/Usuário',
      signedAt: new Date()
    };
    setDocs(signedDocs);
    onUpdate(project.id, { documentation: signedDocs });
    setShowConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <span className="text-xs font-mono text-brand-600 font-bold">{project.id}</span>
            <h3 className="text-lg font-bold text-slate-900">Documentação do Projeto</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="bg-brand-50 p-4 rounded-xl border border-brand-100">
            <h4 className="font-bold text-brand-900">{project.title}</h4>
            <p className="text-sm text-brand-700 mt-1">{project.description}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 mb-2">
                <FileText size={16} className="text-slate-400" />
                <span>Levantamento de Requisitos</span>
              </label>
              <textarea 
                rows={6}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                placeholder="Descreva os requisitos do projeto..."
                value={docs.requirements}
                onChange={e => setDocs({...docs, requirements: e.target.value})}
                disabled={docs.isSigned}
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 mb-2">
                <LinkIcon size={16} className="text-slate-400" />
                <span>Link do Protótipo (Figma, Adobe XD, etc.)</span>
              </label>
              <input 
                type="url"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                placeholder="https://..."
                value={docs.prototypeLink}
                onChange={e => setDocs({...docs, prototypeLink: e.target.value})}
                disabled={docs.isSigned}
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-800">Validação e Aceite</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    {docs.isSigned 
                      ? `Assinado por ${docs.signedBy} em ${docs.signedAt?.toLocaleDateString()}` 
                      : 'Aguardando assinatura do cliente/solicitante.'}
                  </p>
                </div>
                {docs.isSigned ? (
                  <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-100 px-4 py-2 rounded-lg font-bold">
                    <CheckCircle size={18} />
                    <span>Validado</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowConfirm(true)}
                    className="flex items-center space-x-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-brand-700 transition-colors"
                  >
                    <CheckCircle size={18} />
                    <span>Assinar Validação</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">
            Fechar
          </button>
          {!docs.isSigned && (
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold shadow-md hover:bg-slate-800 transition-colors"
            >
              Salvar Rascunho
            </button>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Confirmar Assinatura</h3>
              <p className="text-slate-600">Confirma o aceite e validação deste protótipo/requisitos?</p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center space-x-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold shadow-sm hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSign}
                className="px-6 py-2 bg-brand-600 text-white rounded-lg font-bold shadow-md hover:bg-brand-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectTasksModal: React.FC<{
  project: Project | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}> = ({ project, onClose, onUpdate }) => {
  if (!project) return null;

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: Priority.MEDIUM,
    status: ProjectTaskStatus.BACKLOG
  });

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    const task: ProjectTask = {
      id: `TASK-${Math.random().toString(36).substr(2, 9)}`,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: newTask.status,
      createdAt: new Date()
    };
    onUpdate(project.id, { tasks: [...(project.tasks || []), task] });
    setNewTask({ title: '', description: '', priority: Priority.MEDIUM, status: ProjectTaskStatus.BACKLOG });
  };

  const updateTaskStatus = (taskId: string, newStatus: ProjectTaskStatus) => {
    const updatedTasks = (project.tasks || []).map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    onUpdate(project.id, { tasks: updatedTasks });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center space-x-2 text-brand-700">
            <ListTodo size={20} />
            <h3 className="text-lg font-bold">Atividades e Backlog: {project.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <Plus size={16} className="text-brand-600" />
              <span>Nova Atividade</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-2">
                <input 
                  type="text" 
                  placeholder="Título da atividade" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div>
                <select 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm"
                  value={newTask.priority}
                  onChange={e => setNewTask({...newTask, priority: e.target.value as Priority})}
                >
                  {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <select 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm"
                  value={newTask.status}
                  onChange={e => setNewTask({...newTask, status: e.target.value as ProjectTaskStatus})}
                >
                  {Object.values(ProjectTaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button 
              onClick={handleAddTask}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg font-bold shadow-sm hover:bg-brand-700 transition-colors text-sm"
            >
              Adicionar ao Backlog
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 flex items-center space-x-2">
              <Kanban size={16} className="text-brand-600" />
              <span>Lista de Atividades</span>
            </h4>
            {(!project.tasks || project.tasks.length === 0) ? (
              <div className="text-center py-8 text-slate-500 bg-white rounded-xl border border-slate-200">Nenhuma atividade cadastrada.</div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 font-bold text-slate-600">Atividade</th>
                      <th className="px-4 py-3 font-bold text-slate-600">Prioridade</th>
                      <th className="px-4 py-3 font-bold text-slate-600">Status / Sprint</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {project.tasks.map(task => (
                      <tr key={task.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{task.title}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                            task.priority === Priority.CRITICAL ? 'bg-red-100 text-red-700' :
                            task.priority === Priority.HIGH ? 'bg-orange-100 text-orange-700' :
                            task.priority === Priority.MEDIUM ? 'bg-brand-100 text-brand-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select 
                            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded outline-none text-xs font-medium"
                            value={task.status}
                            onChange={e => updateTaskStatus(task.id, e.target.value as ProjectTaskStatus)}
                          >
                            {Object.values(ProjectTaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, onUpdateProject, onArchiveProject, onUnarchiveProject }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasksProject, setTasksProject] = useState<Project | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const displayedProjects = projects.filter(p => !!p.isArchived === showArchived);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projetos & Desenvolvimento</h1>
          <p className="text-slate-500">Gestão ágil de demandas e ciclo de vida de software</p>
        </div>
        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button 
            onClick={() => setShowArchived(false)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${!showArchived ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Ativos
          </button>
          <button 
            onClick={() => setShowArchived(true)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${showArchived ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Arquivados
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center space-x-2">
              <Layers size={20} className="text-brand-600" />
              <span>Portfólio de Projetos Ativos</span>
            </h3>
            <div className="space-y-4">
              {displayedProjects.length === 0 ? (
                <div className="text-center py-8 text-slate-500">Nenhum projeto {showArchived ? 'arquivado' : 'ativo'}.</div>
              ) : (
                displayedProjects.map((project) => (
                  <div 
                    key={project.id} 
                    className="group border border-slate-100 p-4 rounded-xl hover:border-brand-200 hover:bg-brand-50/20 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="cursor-pointer flex-1" onClick={() => setSelectedProject(project)}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-mono text-brand-600 font-bold">{project.id}</span>
                          {project.documentation.isSigned && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold flex items-center">
                              <CheckCircle size={10} className="mr-1" /> VALIDADO
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900">{project.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">Prazo: {project.deadline.toLocaleDateString()} • PM: {project.manager}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded font-bold uppercase">{project.status}</span>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setTasksProject(project); }}
                            className="p-1.5 text-brand-600 hover:bg-brand-100 rounded"
                            title="Atividades / Backlog"
                          >
                            <ListTodo size={16} />
                          </button>
                          {project.isArchived ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onUnarchiveProject(project.id); }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded"
                              title="Desarquivar"
                            >
                              <ArchiveRestore size={16} />
                            </button>
                          ) : (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onArchiveProject(project.id); }}
                              className="p-1.5 text-amber-600 hover:bg-amber-100 rounded"
                              title="Arquivar"
                            >
                              <Archive size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                        <span>Progresso</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500" style={{ width: `${project.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar for Sprints/Resources */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <Kanban size={20} className="text-brand-600" />
              <span>Sprints Atuais</span>
            </h3>
            <div className="space-y-4">
              {Sprints.map(sprint => (
                <div key={sprint.name} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-800">{sprint.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${sprint.status === 'Ativa' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                      {sprint.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Users size={12} />
                      <span>{sprint.members} devs</span>
                    </div>
                    <span>{sprint.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-brand-600 text-sm font-bold hover:bg-brand-50 rounded-lg transition-colors border border-dashed border-brand-200">
              Gerenciar Backlog
            </button>
          </div>

          <div className="bg-gradient-to-br from-brand-600 to-violet-700 p-6 rounded-2xl shadow-lg text-white">
            <h3 className="font-bold mb-2 flex items-center space-x-2">
              <CheckSquare size={20} />
              <span>Minhas Tarefas</span>
            </h3>
            <p className="text-brand-100 text-xs mb-4">Você possui 12 tarefas pendentes para esta semana.</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm bg-white/10 p-2 rounded">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="truncate">Refatorar API Auth</span>
              </div>
              <div className="flex items-center space-x-2 text-sm bg-white/10 p-2 rounded">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <span className="truncate">Documentação ITIL Mudanças</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProjectDocumentationModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
        onUpdate={onUpdateProject} 
      />

      <ProjectTasksModal
        project={tasksProject}
        onClose={() => setTasksProject(null)}
        onUpdate={onUpdateProject}
      />
    </div>
  );
};

export default ProjectsView;
