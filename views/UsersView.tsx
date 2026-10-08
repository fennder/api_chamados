import React, { useState } from 'react';
import { User, UserRole, Company } from '../types';
import { Users, PlusCircle, CheckCircle, XCircle, Edit2 } from 'lucide-react';

interface UsersViewProps {
  users: User[];
  companies: Company[];
  onCreate: (user: Partial<User>) => void;
  onUpdate: (id: string, updates: Partial<User>) => void;
}

const UsersView: React.FC<UsersViewProps> = ({ users, companies, onCreate, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.MANAGER,
    companyIds: [] as string[]
  });

  const handleOpenNew = () => {
    setEditingUserId(null);
    setFormData({ name: '', email: '', role: UserRole.MANAGER, companyIds: [] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      companyIds: [...user.companyIds]
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingUserId) {
      onUpdate(editingUserId, formData);
    } else {
      onCreate(formData);
    }
    setFormData({ name: '', email: '', role: UserRole.MANAGER, companyIds: [] });
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
            <Users size={24} className="text-brand-600" />
            <span>Responsáveis (Usuários)</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie os acessos ao sistema por empresa</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="flex items-center space-x-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors shadow-sm"
        >
          <PlusCircle size={18} />
          <span>Novo Responsável</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Nome / Email</th>
              <th className="px-6 py-4">Perfil</th>
              <th className="px-6 py-4">Empresas Vinculadas</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{user.name}</div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' : 
                    user.role === UserRole.MANAGER ? 'bg-blue-100 text-blue-800' :
                    'bg-brand-100 text-brand-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.role !== UserRole.MANAGER ? (
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Acesso Interno (Todas)</span>
                    ) : user.companyIds.length > 0 ? (
                      user.companyIds.map(id => {
                        const comp = companies.find(c => c.id === id);
                        return <span key={id} className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">{comp?.name || id}</span>
                      })
                    ) : (
                      <span className="text-xs text-slate-400">Nenhuma</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-1">
                    {user.isActive ? (
                      <><CheckCircle size={16} className="text-emerald-500" /><span className="text-sm text-emerald-600">Ativo</span></>
                    ) : (
                      <><XCircle size={16} className="text-slate-400" /><span className="text-sm text-slate-500">Inativo</span></>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-3">
                    <button 
                      onClick={() => handleOpenEdit(user)}
                      className="text-slate-500 hover:text-brand-600 transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onUpdate(user.id, { isActive: !user.isActive })}
                      className={`text-sm font-medium ${user.isActive ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-600 hover:text-emerald-800'}`}
                    >
                      {user.isActive ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Nenhum usuário cadastrado.
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
      <h3 className="text-lg font-bold text-slate-900">{editingUserId ? 'Editar Responsável' : 'Novo Responsável'}</h3>
      <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full"><XCircle size={20} className="text-slate-500" /></button>
    </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                <input 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Perfil</label>
                <select 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                >
                  <option value={UserRole.MANAGER}>{UserRole.MANAGER}</option>
                  <option value={UserRole.ADMIN}>{UserRole.ADMIN}</option>
                  <option value={UserRole.N1}>{UserRole.N1}</option>
                  <option value={UserRole.N2}>{UserRole.N2}</option>
                  <option value={UserRole.N3}>{UserRole.N3}</option>
                  <option value={UserRole.DEV}>{UserRole.DEV}</option>
                </select>
              </div>
              
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
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={!formData.name || !formData.email}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg font-medium shadow-sm hover:bg-brand-700 transition-colors disabled:opacity-50"
              >
                Salvar Responsável
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersView;
