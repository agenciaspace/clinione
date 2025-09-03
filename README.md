# Clini.One - Sistema de Gestão Médica

Sistema completo de gestão para clínicas médicas pequenas no Brasil, focado em reduzir no-shows e melhorar a eficiência operacional.

## ✨ Características Principais

- **Onboarding Guiado**: Configuração completa em menos de 10 minutos
- **Design System**: Interface baseada na identidade visual clini.one
- **LGPD Compliant**: Conformidade total com a Lei Geral de Proteção de Dados
- **Mobile First**: Responsivo para desktop, tablet e mobile
- **TypeScript**: Type safety completo

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth com RLS
- **State**: React Context + React Query
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## 📋 Funcionalidades Implementadas

### ✅ Fase 0: Onboarding Completo

**1. Dados da Clínica**
- Cadastro básico (nome, CNPJ/CPF, endereço)
- Seleção de fuso horário
- Especialidades oferecidas

**2. Profissionais**
- Cadastro de até 5 médicos/profissionais
- CRM, especialidade, contatos
- Validações automáticas

**3. Serviços**
- Tipos de consulta configuráveis
- Duração, preços e descrições
- Políticas de agendamento

**4. Notificações**
- Canais: WhatsApp, SMS, Email
- Configuração de lembretes automáticos
- Teste de mensagens

**5. Identidade Visual** (Opcional)
- Upload de logotipo
- Personalização de cores
- Preview em tempo real

**6. Conformidade LGPD**
- Aceite de termos obrigatório
- Política de retenção de dados
- Checklist de conformidade

## 🏗️ Arquitetura

```
src/
├── components/
│   ├── onboarding/     # Wizard de 6 etapas
│   ├── ui/             # Design System
│   └── auth/           # Autenticação
├── contexts/           # React Context
├── hooks/              # Custom Hooks  
├── services/           # Integração Supabase
├── types/              # TypeScript Types
└── utils/              # Funções auxiliares
```

## 🛠️ Setup do Projeto

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### Instalação

1. **Clone o repositório**
```bash
git clone [repository-url]
cd clini-one
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

**📍 Como obter as credenciais do Supabase:**
1. Acesse [supabase.com](https://supabase.com) e faça login
2. Selecione seu projeto (ou crie um novo)
3. Vá em **Settings → API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

⚠️ **Importante:** Use apenas a chave **ANON** (pública) no frontend. A **secret key** deve ser usada apenas no backend.

4. **Execute o projeto**
```bash
npm run dev
```

Acesse: http://localhost:5173

## 🎨 Design System

### Cores Principais
```css
--color-primary: #FFD400        /* Amarelo Clini One */
--color-primary-hover: #E6C200   /* Hover state */
--color-primary-disabled: #FFE44D /* Disabled state */
--color-on-primary: #111111      /* Texto sobre amarelo */
```

### Componentes Base
- `Button`: Botão com variants (primary, secondary, outline, ghost, danger)
- `Input`: Input com label, validação e estados de erro
- `Card`: Container com variants (default, bordered, elevated)
- `Progress`: Barra de progresso com percentual

### Contraste WCAG AA
Todos os componentes garantem contraste mínimo de 4.5:1 conforme diretrizes de acessibilidade.

## 📊 Próximas Fases

### 🔄 Fase 1: Sistema de Agendamento (Planejada)
- Calendário interativo
- CRUD de appointments
- Confirmações automáticas
- Check-in de pacientes

### 📝 Fase 2: Prontuário Eletrônico (Planejada)
- Modelo SOAP estruturado
- Anexos e documentos
- Assinatura digital
- Histórico médico

### 📈 Fase 3: Relatórios & Analytics (Planejada)
- Dashboard de métricas
- Relatórios de no-show
- Produtividade médica
- Exportações

### 🌐 V2: Página Pública (Futura)
- URL personalizada por médico
- Agendamento online para pacientes
- SEO otimizado
- Métricas de conversão

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Linting (se configurado)
npm run typecheck    # Verificação de tipos
```

## 🔒 Segurança & Compliance

- **LGPD**: Conformidade total com a Lei Geral de Proteção de Dados
- **RLS**: Row Level Security no Supabase para isolamento por clínica
- **Auth**: Autenticação segura com PKCE flow
- **Criptografia**: Dados sensíveis criptografados em trânsito e repouso
- **Auditoria**: Logs completos para compliance

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para dúvidas ou suporte técnico:
- Email: suporte@clini.one
- Website: https://clini.one

---

**Desenvolvido com ❤️ para clínicas médicas brasileiras**