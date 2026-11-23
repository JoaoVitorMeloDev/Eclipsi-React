# EcliPsi — Plataforma PWA de Saúde Mental

Aplicação web progressiva (**PWA**) desenvolvida para conectar pacientes e profissionais de saúde mental (psicólogos e psiquiatras), oferecendo busca de especialistas, agendamento de consultas, emissão de prontuário/prescrições e gestão administrativa com controle de acesso baseado em papéis (**RBAC**).

- **Aplicação em Produção:** [https://eclipsi.dev](https://eclipsi.dev)
- **Repositório Frontend:** `JoaoVitorMeloDev/Eclipsi-React`
- **Repositório Backend (API):** `eclipsi-pi-BackEnd`

---

## Arquitetura da Solução

```text
┌──────────────────────┐       HTTPS / TLS       ┌───────────────────────────────┐
│   Cliente (PWA/Web)  │ ──────────────────────► │  Cloudflare DNS + Vercel CDN  │
│  React Native / Expo │                         │     ([https://eclipsi.dev](https://eclipsi.dev))     │
└──────────────────────┘                         └───────────────┬───────────────┘
                                                                 │ REST JSON + JWT
                                                                 ▼
┌──────────────────────┐       SQL / RLS         ┌───────────────────────────────┐
│   Supabase Postgres  │ ◄────────────────────── │     API REST Flask (Render)   │
│  (Auth, DB, Policies)│                         │   RBAC, Validação & Regras    │
└──────────────────────┘                         └───────────────────────────────┘
```

### Stack Tecnológica
- **Frontend & PWA:** React Native, Expo Router, TypeScript, Service Worker (`sw.js` v2) e Web App Manifest (`manifest.json`).
- **Backend (API):** Python, Flask, PyJWT, Bcrypt/Werkzeug Security, Flask-CORS.
- **Banco de Dados & Persistência:** PostgreSQL gerenciado no Supabase com **Row Level Security (RLS)**.
- **Infraestrutura & Deploy:** Vercel (Frontend/PWA), Render (API), Cloudflare & Name.com (DNS/SSL).

---

## Identidade Visual Oficial

Padronizada centralmente em `eclipsi/lib/palette.ts` e aplicada em todas as telas, manifest e barra de status do navegador:

| Token | Hex | Aplicação |
| :--- | :--- | :--- |
| **Índigo Principal** | `#2E2382` | Cabeçalhos, painéis escuros, bordas de foco e `theme_color` |
| **Magenta Vibrante** | `#FF0066` | Botões de ação primária (CTA) e destaques |
| **Vinho / Magenta Escuro** | `#B8005C` | Estado `hover`/`pressed`, bordas inferiores de botões e links |
| **Salmão Suave** | `#FFA089` | Alertas, badges secundários e feedbacks de atenção |
| **Creme Oficial** | `#FFF0C2` | Superfície superior das telas de entrada e `background_color` |

---

## Segurança e Controle de Acesso (Ponta a Ponta)

1. **Autenticação Stateless via JWT:** Sessões validadas por token `Bearer` emitido no login (`/api/v1/auth/login`) e verificado em tempo real contra `/api/me`.
2. **Proteção de Rotas e RBAC no Frontend (`RouteGuard.tsx`):**
   - Bloqueio preventivo de renderização nas rotas `/profile/user`, `/profile/medico` e `/profile/admin` até a confirmação do papel (`role`) pelo servidor.
   - Redirecionamento automático em tentativas de acesso não autenticado (`401`) ou escalonamento horizontal/vertical de privilégios (`403`).
   - Sincronização de encerramento de sessão entre múltiplas abas do navegador (`storage` listener) e limpeza completa de estado no logout (`router.replace('/')`).
3. **Isolamento de Dados no Banco (Supabase RLS):** Políticas de segurança em nível de linha garantindo que pacientes, profissionais e administradores acessem apenas os registros autorizados ao seu perfil.
4. **Higiene de Credenciais:** Nenhuma chave privada (`SERVICE_ROLE`, segredos JWT ou tokens de gateway) é armazenada no cliente; arquivos `.env` são ignorados pelo Git (`.gitignore`), mantendo apenas `.env.example`.

---

## Principais Funcionalidades (Histórias de Usuário)

- **HU01 — Cadastro e Autenticação Multi-Perfil:** Registro dedicado para **Paciente** e **Profissional** (com conselho CRP/CRM e UF) e login unificado com redirecionamento automático por perfil.
- **HU02 — Catálogo e Busca de Especialistas:** Listagem de profissionais verificados com filtro por nome/especialidade, valor da sessão e apresentação profissional.
- **HU03 — Agendamento e Acompanhamento de Consultas:** Solicitação de atendimento pelo paciente e gestão de agenda pelo profissional.
- **HU04 — Prontuário e Prescrições:** Registro de observações e prescrições vinculadas à consulta pelo profissional, com visualização pelo paciente.
- **HU05 — Painel Administrativo:** Visão consolidada de usuários ativos, perfis cadastrados e indicadores operacionais da plataforma.

---

## Mapa de Integração com a API

| Método | Endpoint | Perfil | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Público | Cadastro de paciente ou profissional |
| `POST` | `/api/v1/auth/login` | Público | Autenticação e emissão de token JWT |
| `GET` | `/api/me` | Autenticado | Validação de sessão ativa e papel (`role`) |
| `GET` | `/api/v1/patient/doctors` | Paciente | Listagem de especialistas disponíveis |
| `POST` | `/api/v1/patient/appointments` | Paciente | Criação de novo agendamento |
| `GET` | `/api/v1/professional/appointments` | Profissional | Agenda e histórico de atendimentos |
| `POST` | `/api/v1/professional/prescriptions` | Profissional | Emissão de prescrição/prontuário |
| `GET` | `/api/v1/admin/overview` | Admin | Métricas globais e gestão de usuários |

---

## Execução Local

### Pré-requisitos
- Node.js 18+ e npm
- API backend em execução local ou URL de produção configurada

### Passo a passo
```bash
# 1. Acesse o diretório do app Expo
cd eclipsi

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite EXPO_PUBLIC_API_URL apontando para a API (ex.: http://localhost:5000)

# 4. Inicie o servidor de desenvolvimento Web/Expo
npx expo start --web
```

### Build de Produção (Web / PWA)
```bash
npx expo export --platform web
```

---

## Evoluções Planejadas (Roadmap)
- **Gateway de Pagamento PIX:** Integração com API oficial do Mercado Pago (`POST /v1/payments`) com geração dinâmica de QR Code EMV, código *Copia e Cola* e confirmação automatizada via Webhook.
- **Notificações Push Web:** Lembretes automáticos de consultas agendadas via Web Push API.

---

## Equipe de Desenvolvimento
- **João Vitor Melo** — Arquitetura, Segurança, Deploy & Integração Full-Stack
- **Gabriel Felipe Belo de Moura** — Frontend React Native / Expo
- **Júlia Maria Silva Parra Torres** — Documentação, Requisitos & QA
- **Maria Sophia Lima dos Santos** — Design, UI/UX & Identidade Visual
