# Abrindo Portas - Chamados IT Service Hub

Sistema de Gestão de Serviços de TI (ITSM) e Governança corporativa fundamentado nas melhores práticas das metodologias **ITIL 4** e **COBIT 2019**, com triagem inteligente assistida por Inteligência Artificial (Google Gemini), gerenciamento de projetos e esteira de suporte multinível escalável (**N1 ➔ N2 ➔ N3**).

---

## 📌 Visão Geral

O **Abrindo Portas - IT Service Hub** foi desenvolvido para centralizar a operação de tecnologia, atendimento ao usuário e governança de serviços em múltiplos clientes e empresas parceiras. A plataforma oferece controle rigoroso de Acordos de Nível de Serviço (SLA), distribuição estruturada de carga de trabalho e rastreabilidade completa das demandas.

---

## 🚀 Fluxo de Atendimento e Escalonamento ITIL (N1 ➔ N2 ➔ N3)

O sistema implementa uma política estrita de segregação de níveis de suporte:

```
[ Abertura do Chamado ]
           │
           ▼
   [ Fila N1: Suporte 1º Nível ]
   (Status: Aberto / Triagem)
           │
           ▼ (Escalonamento com Justificativa)
   [ Fila N2: Suporte 2º Nível ]
   (Infraestrutura / Redes / Acessos)
           │
           ▼ (Escalonamento com Justificativa)
   [ Fila N3: Especialistas ]
   (Arquitetura / DBAs / Fiscais / Dev)
```

### Regras do Fluxo:
1. **Chamados Abertos pertencem obrigatoriamente à Fila N1**:
   - Todo chamado recém-criado ou desmembrado nasce com status **Aberto** e é alocado na **Fila N1 (N1 - Suporte Nível 1)**.
   - Caso um técnico altere o status de qualquer chamado de volta para **Aberto**, o sistema realoca o ticket compulsoriamente na Fila N1.
2. **Escalonamento do N1 para o N2**:
   - Casos que demandam maior privilégio de acesso, investigações avançadas ou suporte de infraestrutura são escalados do N1 para o N2.
   - O operador registra a justificativa técnica e o status avança para **Em Atendimento**.
3. **Escalonamento do N2 para o N3**:
   - Problemas críticos de banco de dados, sustentação fiscal/ERP ou arquitetura de software são escalados do N2 para o N3 (Especialistas).
4. **Trilha de Auditoria (Audit Trail)**:
   - Todo escalonamento registra um log imutável contendo autor, data/hora, filas de origem/destino e a justificativa fornecida, visível nos detalhes do ticket.

---

## 🧩 Principais Módulos do Sistema

### 1. Dashboard Executivo
- Visão holística da saúde operacional de TI.
- Métricas em tempo real: chamados ativos, projetos em andamento, conformidade de SLA e incidentes críticos.
- **Carga de Trabalho por Nível**: monitoramento das filas N1, N2 e N3.
- Gráficos de tendência semanal e distribuição percentual por status.

### 2. Gestão de Demandas (Chamados)
- Visualização flexível: agrupada por empresa ou lista plana.
- Filtros rápidos por fila de atendimento: `Todas as Filas`, `Fila N1 (Abertos)`, `Fila N2 (Suporte Avançado)` e `Fila N3 (Especialistas)`.
- **Ações Rápidas de Escalonamento**: botões dedicados na tabela para escalar N1 ➔ N2 e N2 ➔ N3.
- **Análise Inteligente por IA (Gemini)**: classificação automática de categoria, severidade e recomendação de prioridade com base no framework ITIL.
- **Desmembramento de Demandas**: divisão de chamados complexos em subtarefas distribuídas.
- Gestão de anexos (documentos e capturas de tela) e controle de ciclo de vida (resolução e arquivamento).

### 3. Projetos & Desenvolvimento
- Conversão direta de chamados em projetos estruturados.
- Gestão de documentação de requisitos (escopo, requisitos funcionais e não funcionais).
- Quadro de tarefas com fluxo Kanban/Sprint: *Backlog*, *A Fazer*, *Em Andamento* e *Concluído*.
- Acompanhamento de progresso percentual e prazos de entrega.

### 4. Governança e Métricas COBIT/ITIL
- Avaliação de conformidade com boas práticas internacionais de governança.
- Controle de métricas de disponibilidade, tempo médio de atendimento e resolução.
- Recomendações e diagnósticos orientados pelo COBIT 2019 via IA.

### 5. Filas de Atendimento
- Gerenciamento de filas ativas e inativas.
- Contadores de chamados em tempo real por fila.
- Guia visual da hierarquia de suporte do sistema.

### 6. Gestão de Empresas e Multi-Tenancy
- Cadastro de empresas clientes com CNPJ, contatos e responsáveis.
- Isolamento de chamados e projetos por empresa para usuários com perfil de *Responsável/Cliente*.

### 7. Usuários e Perfis de Acesso (RBAC)
Perfis configuráveis com controle de visibilidade de menus e permissões:
- **Administrador (Admin)**: acesso irrestrito a configurações, governança e relatórios.
- **Responsável (Manager)**: visualização restrita às empresas pelas quais responde.
- **N1**: focado na triagem e resolução de primeiro nível.
- **N2**: atendimento técnico intermediário e infraestrutura.
- **N3**: especialistas seniores, focado em incidentes complexos e projetos.
- **Desenvolvimento (Dev)**: sustentação de código e esteira de projetos.

### 8. Central de Avisos & Notificações
- Publicação de comunicados corporativos e alertas de manutenção com direcionamento por perfil de usuário.
- Sino de notificações em tempo real com indicador de mensagens não lidas.

### 9. Configurações do Sistema
- Definição de prazos de SLA parametrizáveis (em horas) para cada categoria de chamado (*Incidente*, *Requisição*, *Mudança*, *Problema*, *Projeto*, *Desenvolvimento*).
- Parametrização da fila padrão para distribuição automática.

### 10. BI Analítico Público (`/#/bi`)
- Painel analítico com filtros avançados por período, empresa e responsável.
- Gráficos de volume por status, prioridade e série histórica mensal.
- Layout otimizado para exportação e impressão de relatórios gerenciais.

---

## 🛠️ Tecnologias Utilizadas

- **React 19** com TypeScript
- **Vite** (Build tool e servidor de desenvolvimento rápido)
- **Tailwind CSS** (Estilização utilitária moderna e responsiva)
- **Lucide React** (Pacote abrangente de ícones de interface)
- **Recharts** (Gráficos analíticos responsivos)
- **Google GenAI SDK (`@google/genai`)** (Triagem preditiva e diagnósticos de governança COBIT)
- **React Router 7** (Navegação SPA)

---

## ⚙️ Instalação e Execução Local

### Pré-requisitos
- Node.js versão 18 ou superior
- NPM ou Yarn instalado

### 1. Clonar o repositório e instalar as dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente (Opcional para IA)
Crie um arquivo `.env` ou configure no seu ambiente de execução:
```env
GEMINI_API_KEY=sua_chave_de_api_aqui
```

### 3. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
O sistema estará disponível em `http://localhost:3000`.

### 4. Verificar tipagem e compilação
```bash
npm run lint    # Validação rigorosa do TypeScript
npm run build   # Compilação de produção
```

---

## 📂 Estrutura de Diretórios

```
├── App.tsx                     # Orquestrador de rotas, estado global e notificações
├── index.html                  # Ponto de entrada HTML e fontes
├── index.tsx                   # Inicialização do React DOM
├── types.ts                    # Interfaces TypeScript, enums e modelos de dados
├── geminiService.ts            # Integração com a API Gemini para triagem e governança
├── metadata.json               # Metadados da aplicação
├── components/
│   └── OnboardingGuide.tsx     # Guia interativo para novos usuários
├── views/
│   ├── TicketsView.tsx         # Gestão de chamados, filtros e modais de escalonamento N1->N2->N3
│   ├── QueuesView.tsx          # Gestão das filas de suporte e status de carga
│   ├── DashboardView.tsx       # Painel executivo de indicadores e métricas
│   ├── ProjectsView.tsx        # Gestão de projetos e quadro de tarefas
│   ├── GovernanceView.tsx      # Métricas de governança ITIL/COBIT
│   ├── CompaniesView.tsx       # Cadastro e gestão de empresas parceiras
│   ├── UsersView.tsx           # Gestão de responsáveis e perfis de acesso
│   ├── AnnouncementsView.tsx   # Central de avisos corporativos
│   ├── SettingsView.tsx        # Configuração de SLAs e regras de distribuição
│   └── PublicBIView.tsx        # Relatório de Business Intelligence para impressão
└── public/
    └── logo.svg                # Logotipo da aplicação
```

---

## 📄 Licença
Projeto desenvolvido para a plataforma **Abrindo Portas**. Todos os direitos reservados.
