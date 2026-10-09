import React, { useState } from 'react';
import { User, UserRole, Company, Queue } from '../types';
import { Users, PlusCircle, CheckCircle, XCircle, Edit2, Layers, ShieldCheck, Building2 } from 'lucide-react';

interface UsersViewProps {
  users: User[];
  companies: Company[];
  queues?: Queue[];
  onCreate: (user: Partial<User>) => void;
  onUpdate: (id: string, updates: Partial<User>) => void;
}

const UsersView: React.FC<UsersViewProps> = ({ users, companies, queues = [], onCreate, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.MANAGER,
    queue: '',
    companyIds: [] as string[]
  });

  const handleOpenNew = () => {
    setEditingUserId(null);
    setFormData({ name: '', email: '', role: UserRole.MANAGER, queue: '', companyIds: [] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      queue: user.queue || '',
      companyIds: [...user.companyIds]
    });
    setIsModalOpen(true);
  };

  const handleRoleChange = (role: UserRole) => {
    let defaultQueue = '';
    if (role === UserRole.N1) defaultQueue = 'N1 - Suporte Nível 1';
    else if (role === UserRole.N2) defaultQueue = 'N2 - Suporte Nível 2';
    else if (role === UserRole.N3) defaultQueue = 'N3 - Especialistas';
    else if (role === UserRole.DEV) defaultQueue = 'Desenvolvimento';

    setFormData(prev => ({
      ...prev,
      role,
      queue: defaultQueue,
      companyIds: role === UserRole.MANAGER ? prev.companyIds : []
    }));
  };

  const handleSave = () => {
    if (editingUserId) {
      onUpdate(editingUserId, formData);
    } else {
      onCreate(formData);
    }
    setFormData({ name: '', email: '', role: UserRole.MANAGER, queue: '', companyIds: [] });
    setIsModalOpen(false);
  };

  const toggleCompany = (companyId: string) => {
    setFormData(prev => ({
      ...prev,
      companyIds: prev.companyIds.includes(companyId)
        ? prev.companyIds.filter(id => id !== companyId)
        : [...prev.companyIds, companyId]
    }));
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case UserRole.MANAGER:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case UserRole.N1:
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case UserRole.N2:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case UserRole.N3:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case UserRole.DEV:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
            <Users size={24} className="text-brand-600" />
            <span>Responsáveis & Operadores de Fila</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie os acessos, responsáveis por empresa e atendentes de cada fila ITIL</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="flex items-center space-x-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <PlusCircle size={18} />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-lg">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Atendentes de Filas (N1/N2/N3/Dev)</span>
            <span className="text-xl font-bold text-slate-800">
              {users.filter(u => [UserRole.N1, UserRole.N2, UserRole.N3, UserRole.DEV].includes(u.role)).length}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Building2 size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Responsáveis por Empresas</span>
            <span className="text-xl font-bold text-slate-800">
              {users.filter(u => u.role === UserRole.MANAGER).length}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Administradores Master</span>
            <span className="text-xl font-bold text-slate-800">
              {users.filter(u => u.role === UserRole.ADMIN).length}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Usuários Ativos</span>
            <span className="text-xl font-bold text-slate-800">
              {users.filter(u => u.isActive).length} / {users.length}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Nome / Email</th>
                <th className="px-6 py-4">Perfil</th>
                <th className="px-6 py-4">Fila de Atendimento</th>
                <th className="px-6 py-4">Empresas Vinculadas</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeStyle(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.queue ? (
                      <span className="inline-flex items-center space-x-1.5 text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                        <Layers size={13} className="text-brand-500" />
                        <span>{user.queue}</span>
                      </span>
                    ) : user.role === UserRole.ADMIN ? (
                      <span className="text-xs text-purple-700 font-medium bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                        Todas as Filas (Admin)
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.role !== UserRole.MANAGER ? (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Acesso Interno (Todas)</span>
                      ) : user.companyIds.length > 0 ? (
                        user.companyIds.map(id => {
                          const comp = companies.find(c => c.id === id);
                          return (
                            <span key={id} className="text-xs text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded font-medium flex items-center space-x-1">
                              <Building2 size={12} />
                              <span>{comp?.name || id}</span>
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-400">Nenhuma</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      {user.isActive ? (
                        <><CheckCircle size={16} className="text-emerald-500" /><span className="text-xs font-medium text-emerald-600">Ativo</span></>
                      ) : (
                        <><XCircle size={16} className="text-slate-400" /><span className="text-xs font-medium text-slate-500">Inativo</span></>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => handleOpenEdit(user)}
                        className="text-slate-500 hover:text-brand-600 transition-colors p-1"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onUpdate(user.id, { isActive: !user.isActive })}
                        className={`text-xs font-medium ${user.isActive ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-600 hover:text-emerald-800'}`}
                      >
                        {user.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">{editingUserId ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full"><XCircle size={20} className="text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Carlos Mendes (Suporte N1)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="Ex: carlos@empresa.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Perfil de Acesso</label>
                <select 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm" 
                  value={formData.role}
                  onChange={e => handleRoleChange(e.target.value as UserRole)}
                >
                  <option value={UserRole.N1}>N1 (Suporte 1º Nível)</option>
                  <option value={UserRole.N2}>N2 (Suporte 2º Nível)</option>
                  <option value={UserRole.N3}>N3 (Especialistas)</option>
                  <option value={UserRole.DEV}>Desenvolvimento</option>
                  <option value={UserRole.MANAGER}>Responsável (Empresa Cliente)</option>
                  <option value={UserRole.ADMIN}>Administrador Master</option>
                </select>
              </div>

              {/* Fila vinculada para N1, N2, N3 ou DEV */}
              {[UserRole.N1, UserRole.N2, UserRole.N3, UserRole.DEV].includes(formData.role) && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fila de Atendimento Vinculada</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    value={formData.queue}
                    onChange={e => setFormData({...formData, queue: e.target.value})}
                    placeholder="Ex: N1 - Suporte Nível 1"
                  />
                  <p className="text-xs text-slate-400 mt-1">Este usuário atuará como operador desta fila no sistema.</p>
                </div>
              )}
              
              {formData.role === UserRole.MANAGER && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Empresas Vinculadas</label>
                  <div className="space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50 max-h-40 overflow-y-auto">
                    {companies.map(c => (
                      <label key={c.id} className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.companyIds.includes(c.id)}
                          onChange={() => toggleCompany(c.id)}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm text-slate-700">{c.name}</span>
                      </label>
                    ))}
                    {companies.length === 0 && (
                      <span className="text-sm text-slate-500">Nenhuma empresa cadastrada.</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">O Responsável terá acesso exclusivo aos chamados e projetos das empresas selecionadas.</p>
                </div>
              )}
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
                disabled={!formData.name || !formData.email}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg font-medium shadow-sm hover:bg-brand-700 transition-colors disabled:opacity-50 text-sm"
              >
                Salvar Usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersView;
