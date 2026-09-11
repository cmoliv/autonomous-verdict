# Runbook — Tribunal dos Carros Autônomos

> Última atualização: 2026-09-10

---

## Status Geral do Projeto

| Métrica               | Valor                          |
| --------------------- | ------------------------------ |
| **Conclusão estimada** | ~35%                           |
| **Fase atual**         | MVP 1 — Tribunal Público (funcional) |
| **Stack**              | TanStack Start + React 19 + Supabase + Tailwind CSS 4 |
| **Framework**          | Vite 8 + TanStack Router       |

---

## Funcionalidades Concluídas ✅

### 1. Banco de dados (Supabase)
- Tabelas criadas: `cases`, `incident_data`, `evidence`, `witnesses`, `evidence_cards`, `presenter_notes`, `trial_sessions`, `case_results`
- Enums: `case_status`, `evidence_category`, `evidence_importance`, `evidence_reliability`, `session_status`, `trial_side`
- RLS (Row Level Security) com policies para `anon` (leitura de publicados) e `authenticated` (CRUD completo)
- Triggers: `updated_at` automático, `enforce_final_case_points` (caso final = 2 pontos)
- Índices de ordenação para consultas
- Storage: bucket `case-files` com policies para authenticated
- Seed data: Caso demonstrativo "O Desvio" (AV-001) com incident_data, 3 evidências, 1 testemunha e 1 evidence card

**Arquivos:** `supabase/migrations/*.sql`, `src/integrations/supabase/types.ts`

### 2. Server functions (API pública)
- `listPublishedCases` — lista casos publicados ordenados
- `getPublishedCase` — busca caso completo com incident_data, evidências, testemunhas e evidence_cards

**Arquivo:** `src/lib/cases.functions.ts`

### 3. Componentes do Tribunal (parcialmente conectados)
- `CaseFileCover` — Capa "Investigation File" com visual documental (selo CONFIDENTIAL, dificuldade em estrelas, código do caso, título)
- `TrialExperience` — Motor completo de fases do julgamento com:
  - Progressão de fases dinâmica baseada nos dados do caso
  - Fases: Cover → Incidente → Decisão do algoritmo → Acusação → Defesa → Evidências → Testemunhas → Evidence Cards → Objection → Veredito → Placar
  - Atalhos de teclado (H para painel do apresentador, setas para navegação)
  - Cronômetro com pause
  - Tela cheia
  - Painel secreto do apresentador
  - Grid de dados do incidente
  - Placar interativo Acusação vs. Defesa
  - Reprodução de vídeo de testemunha
  - Cores diferenciadas para Acusação (vermelho) e Defesa (azul)

**Arquivos:** `src/components/case-file-cover.tsx`, `src/components/trial-experience.tsx`

### 4. Infraestrutura
- Supabase client (browser) com proxy lazy
- Supabase server client para server functions
- Auth middleware (`requireSupabaseAuth`) pronto
- Design system base (shadcn/ui com 46 componentes)
- Hook `use-mobile` para responsividade
- Configuração de erro e 404 genéricos

**Arquivos:** `src/integrations/supabase/*`, `src/components/ui/*`, `src/hooks/use-mobile.tsx`

### 5. Design system documental/cinematográfico ✅ (Sessão 1)
- Tokens CSS completos mapeados ao Tailwind: `paper`, `paper-dark`, `paper-edge`, `ink`, `ink-muted`, `folder`, `bronze`, `bronze-dim`, `stamp`, `stage-bg`, `stage-panel`, `stage-line`, `stage-muted`, `accusation`, `accusation-dim`, `defense`, `defense-dim`
- Google Fonts: Bebas Neue (display), IBM Plex Mono, Inter
- Utilities: `paper-noise`, `trial-stage`, `stage-accusation`, `stage-defense`, `file-cover`, `scanlines`
- Variantes de Button customizadas: `file`, `stage`, `stageGhost`, size `xl`

**Arquivo:** `src/styles.css`, `src/components/ui/button.tsx`

### 6. Página inicial `/` ✅ (Sessão 1)
- Lista dossiês publicados carregados via SSR do Supabase
- Cards de caso com visual físico: folder tab, spine colorido, clip decorativo, carimbo CONFIDENTIAL
- Hover effects, metadados SEO
- Estado vazio com link para `/admin`

**Arquivo:** `src/routes/index.tsx`

### 7. Rota `/cases/$caseId` ✅ (Sessão 1)
- Carrega `CaseFile` completo via SSR
- Renderiza `TrialExperience` com todos os dados
- 404 temático (stage escuro, texto em vermelho acusação)
- Head com meta tags dinâmicas por caso

**Arquivo:** `src/routes/cases.$caseId.tsx`

---

## Funcionalidades Pendentes 📋

> Ordenadas por dependência técnica (implementar de cima para baixo)

### Prioridade 1 — Tribunal Público Funcional (MVP 1)

| # | Item | Dependência | Complexidade |
|---|------|-------------|-------------|
| ~~P1.1~~ | ~~**Página inicial (`/`)**~~ | — | ✅ Concluído |
| ~~P1.2~~ | ~~**Rota `/cases/$caseId`**~~ | — | ✅ Concluído |
| ~~P1.3~~ | ~~**Design system documental/cinematográfico**~~ | — | ✅ Concluído |
| P1.4 | **Persistência do placar por sessão** — manter score entre casos (localStorage ou Supabase session) | P1.2 | Baixa |

### Prioridade 2 — Administração (MVP 2)

| # | Item | Dependência | Complexidade |
|---|------|-------------|-------------|
| P2.1 | **Login admin (`/admin`)** — tela de autenticação email/senha via Supabase Auth | Nenhuma | Média |
| P2.2 | **Dashboard admin (`/admin`)** — contagem de casos, sessão atual, atalhos | P2.1 | Baixa |
| P2.3 | **Lista de casos (`/admin/cases`)** — tabela com status, dificuldade, contagens, ações (editar, duplicar, visualizar, excluir) | P2.1 | Média |
| P2.4 | **Formulário de caso (`/admin/cases/new` e `/admin/cases/$caseId`)** — seções A-E completas (identificação, contexto, decisão, dados, evidências, testemunhas) | P2.3 | Alta |
| P2.5 | **Duplicação de caso** — operação atômica (caso + evidências + testemunhas + cards) | P2.4 | Média |
| P2.6 | **Reordenação (drag & drop)** de evidências e testemunhas | P2.4 | Média |
| P2.7 | **Preview (`/admin/cases/$caseId/preview`)** — mesma tela do tribunal sem expor controles admin | P2.4 | Baixa |
| P2.8 | **Publicação/Rascunho** — toggle de status do caso | P2.3 | Baixa |

### Prioridade 3 — Investigação Multimídia (MVP 3)

| # | Item | Dependência | Complexidade |
|---|------|-------------|-------------|
| P3.1 | **Upload de arquivos** — imagens, documentos e vídeos para Supabase Storage (`case-files` bucket) | P2.4 | Média |
| P3.2 | **Reprodução avançada de vídeos** — player para testemunhas com controles simplificados | P3.1 | Média |
| P3.3 | **Evidence Card reveal** — animação de "PROCESSING EVIDENCE → NEW EVIDENCE DISCOVERED" após vídeo | P3.2 | Média |
| P3.4 | **Animações cinematográficas** — abertura de arquivo, transições entre fases, objection | P1.3 | Alta |
| P3.5 | **Efeitos sonoros** (opcional) | P3.4 | Baixa |

---

## Decisões de Arquitetura & Stack

| Aspecto            | Decisão                                                  |
| ------------------ | -------------------------------------------------------- |
| **Framework**      | TanStack Start (React 19 + SSR/Server Functions)         |
| **Router**         | TanStack Router (file-based routing)                     |
| **Banco de dados** | Supabase PostgreSQL                                      |
| **Autenticação**   | Supabase Auth (email/senha)                              |
| **Storage**        | Supabase Storage (bucket `case-files`)                   |
| **Styling**        | Tailwind CSS 4 + shadcn/ui + CSS custom properties       |
| **UI Library**     | shadcn/ui (46 componentes pré-instalados)                |
| **Data fetching**  | TanStack React Query + createServerFn (TanStack Start)   |
| **Validação**      | Zod                                                      |
| **Formulários**    | React Hook Form + @hookform/resolvers                    |
| **Build**          | Vite 8                                                   |
| **Deploy target**  | Lovable Cloud (connected via AGENTS.md)                  |

### Rotas planejadas

| Rota                         | Status         |
| ---------------------------- | -------------- |
| `/`                          | ❌ Placeholder  |
| `/cases/$caseId`             | ❌ Não criada   |
| `/admin`                     | ❌ Não criada   |
| `/admin/cases`               | ❌ Não criada   |
| `/admin/cases/new`           | ❌ Não criada   |
| `/admin/cases/$caseId`       | ❌ Não criada   |
| `/admin/cases/$caseId/preview` | ❌ Não criada |

---

## Log de Execução (Changelog)

| Data       | Sessão | Alterações                                                                 |
| ---------- | ------ | -------------------------------------------------------------------------- |
| 2026-09-11 | 0 (Lovable) | Setup inicial: banco Supabase (migrations), types, server functions, componentes `CaseFileCover` e `TrialExperience`, design system base, infraestrutura Supabase client/auth |
| 2026-09-10 | 1      | Auditoria do projeto, criação do `runbook.md`, implementação do design system (P1.3), página inicial (P1.1), rota `/cases/$caseId` (P1.2), variantes do Button, correção dos meta tags do root. App funcional end-to-end: home → Investigation File → julgamento completo |
