import React, { useState } from 'react';
import { Announcement, UserRole, User } from '../types';
import { Bell, PlusCircle, Trash2, XCircle } from 'lucide-react';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  currentUser: User;
  onCreate: (announcement: Partial<Announcement>) => void;
  onDelete: (id: string) => void;
}

const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({ announcements, currentUser, onCreate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetRole: 'ALL' as UserRole | 'ALL'
  });

  const handleSave = () => {
    onCreate(formData);
    setFormData({ title: '', message: '', targetRole: 'ALL' });
    setIsModalOpen(false);
  };

  const visibleAnnouncements = currentUser.role === UserRole.ADMIN 
    ? announcements 
    : announcements.filter(a => a.targetRole === 'ALL' || a.targetRole === currentUser.role);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
            <Bell size={24} className="text-amber-500" />
            <span>Central de Avisos</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Avisos e comunicados importantes do sistema</p>
        </div>
        {currentUser.role === UserRole.ADMIN && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors shadow-sm"
          >
            <PlusCircle size={18} />
            <span>Novo Aviso</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {visibleAnnouncements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-200">
            <Bell size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Nenhum aviso no momento.</p>
          </div>
        ) : (
          visibleAnnouncements.map(announcement => (
            <div key={announcement.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row gap-4 justify-between items-start">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-slate-800">{announcement.title}</h3>
                  {announcement.targetRole !== 'ALL' && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                      Para: {announcement.targetRole}
                    </span>
                  )}
                  {announcement.isSystem && (
                    <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-full font-medium">
                      Sistema
                    </span>
                  )}
                </div>
                <p className="text-slate-600 whitespace-pre-wrap">{announcement.message}</p>
                <div className="text-xs text-slate-400 mt-4 flex items-center space-x-2">
                  <span>Enviado em {announcement.createdAt.toLocaleDateString()} às {announcement.createdAt.toLocaleTimeString()}</span>
                  {announcement.createdBy && <span>• Por {announcement.createdBy}</span>}
                </div>
              </div>
              
              {currentUser.role === UserRole.ADMIN && !announcement.isSystem && (
                <button 
                  onClick={() => onDelete(announcement.id)}
                  className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-colors flex-shrink-0"
                  title="Excluir aviso"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Novo Aviso</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full"><XCircle size={20} className="text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <input 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Atualização do sistema"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mensagem</label>
                <textarea 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 min-h-[100px]" 
                  value={formData.message} 
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  placeholder="Digite a mensagem do aviso..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Público Alvo</label>
                <select 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  value={formData.targetRole}
                  onChange={e => setFormData({...formData, targetRole: e.target.value as UserRole | 'ALL'})}
                >
                  <option value="ALL">Todos os Usuários</option>
                  <option value={UserRole.ADMIN}>Apenas Administradores</option>
                  <option value={UserRole.MANAGER}>Apenas Responsáveis</option>
                  <option value={UserRole.N1}>Apenas N1</option>
                  <option value={UserRole.N2}>Apenas N2</option>
                  <option value={UserRole.N3}>Apenas N3</option>
                  <option value={UserRole.DEV}>Apenas Desenvolvimento</option>
                </select>
              </div>
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
                disabled={!formData.title || !formData.message}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium shadow-sm hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                Publicar Aviso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsView;
