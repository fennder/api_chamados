import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { X, ChevronRight, Info, CheckCircle2 } from 'lucide-react';

interface OnboardingGuideProps {
  currentUser: User;
  onComplete: () => void;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ currentUser, onComplete }) => {
  const [step, setStep] = useState(0);

  const adminSteps = [
    {
      title: 'Bem-vindo ao Sistema, Administrador!',
      description: 'Como Administrador, você tem acesso total para gerenciar usuários, empresas, projetos e chamados.',
    },
    {
      title: 'Gerenciamento de Empresas',
      description: 'Acesse o menu "Empresas" para aprovar e ativar novas empresas cadastradas pelos Responsáveis.',
    },
    {
      title: 'Central de Avisos',
      description: 'No menu "Avisos", você pode publicar comunicados automáticos ou manuais direcionados a perfis específicos ou a todos os usuários.',
    },
    {
      title: 'Visão Geral (Dashboard)',
      description: 'Você pode visualizar todos os chamados e projetos em andamento de todas as empresas no Dashboard.',
    }
  ];

  const managerSteps = [
    {
      title: 'Bem-vindo ao Sistema, Responsável!',
      description: 'Como Responsável, você pode abrir e acompanhar chamados apenas das empresas que você gerencia.',
    },
    {
      title: 'Cadastrando sua Empresa',
      description: 'No menu "Empresas", você pode cadastrar sua empresa. Ela passará por uma ativação do Administrador antes de liberar chamados.',
    },
    {
      title: 'Abertura de Chamados',
      description: 'Com sua empresa ativa, vá em "Chamados" e clique em "Novo Chamado" para solicitar suporte. Você só verá os chamados da sua empresa.',
    },
    {
      title: 'Central de Avisos',
      description: 'Fique atento ao menu "Avisos" para comunicados importantes enviados pela administração.',
    }
  ];

  const steps = currentUser.role === UserRole.ADMIN ? adminSteps : managerSteps;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button 
          onClick={onComplete}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-6 text-brand-600">
            {step === steps.length - 1 ? <CheckCircle2 size={32} /> : <Info size={32} />}
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            {steps[step].title}
          </h2>
          
          <p className="text-slate-600 text-base leading-relaxed mb-8 min-h-[80px]">
            {steps[step].description}
          </p>
          
          <div className="flex items-center justify-center space-x-2 mb-8">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-brand-600' : 'w-2 bg-slate-200'}`}
              />
            ))}
          </div>
          
          <button 
            onClick={handleNext}
            className="w-full flex items-center justify-center space-x-2 bg-brand-600 text-white py-3 rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm"
          >
            <span>{step === steps.length - 1 ? 'Começar a usar' : 'Próximo'}</span>
            {step !== steps.length - 1 && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingGuide;
