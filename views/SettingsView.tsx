import React, { useState, useEffect } from 'react';
import { AppSettings, Category } from '../types';
import { Save, Clock, Users, CheckCircle } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSlaChange = (category: Category, value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      categorySlas: {
        ...prev.categorySlas,
        [category]: value
      }
    }));
  };

  const handleQueueChange = (category: Category, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      categoryQueues: {
        ...prev.categoryQueues,
        [category]: value
      }
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações do Sistema</h1>
        <p className="text-slate-500">Gerencie SLAs e distribuição automática de chamados</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
          <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
            <Clock size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">SLA por Categoria (Horas)</h2>
            <p className="text-sm text-slate-500">Tempo limite para resolução de chamados</p>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.values(Category).map(category => (
            <div key={category} className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-slate-700">{category}</label>
              <input
                type="number"
                min="1"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                value={localSettings.categorySlas[category]}
                onChange={e => handleSlaChange(category, parseInt(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
          <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Distribuição Automática (Filas)</h2>
            <p className="text-sm text-slate-500">Fila ou responsável padrão por categoria</p>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.values(Category).map(category => (
            <div key={category} className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-slate-700">{category}</label>
              <input
                type="text"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                value={localSettings.categoryQueues[category]}
                onChange={e => handleQueueChange(category, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end items-center space-x-4">
        {showSuccess && (
          <div className="flex items-center space-x-2 text-emerald-600 animate-in fade-in duration-300">
            <CheckCircle size={20} />
            <span className="font-medium">Configurações salvas!</span>
          </div>
        )}
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-brand-700 transition-colors"
        >
          <Save size={20} />
          <span>Salvar Configurações</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
