# Selah — Aplicativo de Estudo Bíblico

> **Pausa · Medita · Contempla**

Aplicativo web de leitura e estudo bíblico com foco em disciplina espiritual reformada. Desenvolvido com Next.js 16 App Router, TypeScript e uma identidade visual própria inspirada em candelas e vidro líquido.

---

## Funcionalidades

### Bíblia
- Leitor de capítulos com 3 versões (NVI, NAA, NVT)
- Grifos coloridos por versículo, persistidos no banco
- Marcadores de versículo
- Nota por versículo e nota de capítulo (painel inline)
- Compartilhamento e download de versículo como imagem (canvas 1080×1080)
- Modo imersivo (fullscreen) com barra de leitura de progresso
- Busca full-text nos versículos já lidos

### Memorização
- Flashcards a partir dos grifos do usuário
- Flip animado (CSS 3D transform)
- Sistema de "já sei / rever depois" com fila dinâmica
- Modo aleatório: carrega versículos adicionais do cache de leitura
- Progresso da sessão persistido no `sessionStorage` (evita reinício ao navegar)

### Devocional
- Editor de registro diário com título, referência bíblica e tags
- Histórico com preview do conteúdo
- Estado vazio com citação temática

### Plano de Leitura
- 8 planos disponíveis (Bíblia completa 1 ano/6 meses, NT/AT separados, Salmos, Evangelhos)
- Progresso diário com barra e percentual
- Histórico das últimas 7 leituras concluídas
- Marcação de leitura do dia via formulário server-action

### Orações
- Registro de orações pessoais por categoria (pessoal, família, igreja, missões)
- Marcar como respondida com confirmação
- Oração da hora: 12 orações de teólogos reformados, rotacionadas de hora em hora
- Biblioteca de 7 orações apostólicas e bíblicas

### Estudo
- Organização de notas por livro bíblico com código de cores por gênero literário
- Tipos de nota: exegese, teologia, aplicação, estudo de palavra, referência cruzada
- Nota rápida inline diretamente na página do livro
- Editor de nota completo com TipTap (rich text)

### Escatologia
- Notas pós-tribulacionistas / pré-milenial histórico organizadas por livro profético

### Outras
- Dashboard com cartão "Continue onde parou", Versículo do Dia, Plano em andamento
- Ações rápidas em pills
- Perfil de usuário com configurações de plano
- Tema claro/light com transição suave (View Transitions API)
- Sidebar colapsável; auto-colapso em rotas de leitura
- Notificações push via Web Push / VAPID

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16.2 (App Router, Server Components) |
| Linguagem | TypeScript 5 |
| Estilo | Tailwind CSS v4 |
| ORM | Prisma 7 + libSQL adapter |
| Banco (dev) | SQLite local (`dev.db`) |
| Banco (prod) | Turso (libSQL na edge) |
| Auth | NextAuth v5 (credentials + Google OAuth) |
| E-mail | Resend (recuperação de senha) |
| Rich text | TipTap |
| Push | Web Push / VAPID |
| Deploy | Vercel |

---

## Segurança implementada

- Enumeração de e-mail bloqueada: register e login retornam respostas de tempo uniforme
- Hash dummy com `bcrypt.compare` para usuários inexistentes (equaliza timing)
- Sanitização XSS: `sanitizeRichText` (allowlist TipTap) e `sanitizePlainText` em todas as entradas
- Headers: HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, CSP em Report-Only
- Validação de 72 bytes no registro (limite silencioso do bcrypt)
- Cotas de highlights e bookmarks por usuário
- Autenticação exigida em todos os endpoints da API

---

## Rodando localmente

### Pré-requisitos
- Node.js 20+
- npm

### Instalação

```bash
git clone https://github.com/LucaSilvaDev/logos.git
cd logos
npm install
```

### Variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.example .env.local
```

Consulte os comentários em `.env.example` para instruções de cada variável.

### Banco de dados

```bash
# Criar o banco local e aplicar migrations
npx prisma migrate dev

# Gerar o cliente Prisma
npx prisma generate
```

### Iniciar

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Estrutura do projeto

```
src/
├── app/
│   ├── (app)/          # Rotas autenticadas (Bíblia, Devocional, Plano…)
│   ├── (auth)/         # Login, cadastro, recuperação de senha
│   └── api/            # Route handlers (REST)
├── components/
│   └── layout/         # AppShell, Sidebar, Topbar, BottomNav
└── lib/
    ├── auth.ts          # Configuração NextAuth v5
    ├── db.ts            # Cliente Prisma + adapter Turso
    └── reading-plan.ts  # Lógica dos planos de leitura
prisma/
├── schema.prisma        # Modelos de dados
└── migrations/          # Histórico de migrations
```

---

## Design

A identidade visual é inspirada em candelas e vidro líquido:

- **`candle-enter`** — animação de entrada com fade + slide suave
- **`candle-flame`** — entrada com overshoot, simulando a oscilação de uma chama
- **`flame-hover`** — glow dourado pulsante no hover via pseudo-elemento `::after` (não conflita com `animation-fill-mode: forwards` dos cards)
- Orbs de fundo animados (glassmorphism líquido)
- Paleta escura com dourado `#c9a654` como cor primária

---

## Licença

Uso pessoal e portfólio. Código disponível para referência.
