# CUBA & CAFÉ TABACARIA — Guia de Deploy (Vercel + Neon)

Site catálogo dark premium com pedidos via WhatsApp, painel admin completo,
blog SEO, glossário GEO e schema JSON-LD. Pronto para **Vercel + Neon PostgreSQL**.

---

## A) Variáveis de ambiente na Vercel

Configure em: **Vercel → Project → Settings → Environment Variables**
(marque Production, Preview e Development)

| Variável | Valor | Obrigatória |
|---|---|---|
| `DATABASE_URL` | Connection string **pooled** do Neon, com `?sslmode=require` → ex.: `postgresql://usuario:senha@ep-xxxx-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require` | ✅ SIM |
| `NEXT_PUBLIC_SITE_URL` | URL final do site sem barra no final → ex.: `https://cubacafe.com.br` (usada em canonical, Open Graph, JSON-LD e sitemap) | ✅ SIM |
| `ADMIN_PASSWORD` | Senha do Painel Admin (`#/admin`). Use 12+ caracteres. **Sem ela o painel fica bloqueado** (o site público funciona normal) | ✅ SIM |
| `ADMIN_SECRET` | Segredo extra para assinar a sessão do admin (32+ caracteres aleatórios) | ⬜ opcional |
| `NEXT_PUBLIC_GA_ID` | ID do Google Analytics 4 → ex.: `G-XXXXXXXXXX`. Deixe vazio para não carregar o script | ⬜ opcional |

> ⚠️ `DATABASE_URL` precisa estar disponível também no ambiente de **Build** (o `prisma db push` roda no build). Se o build falhar com erro de conexão/timeout, use a string **direta** do Neon (host *sem* `-pooler`).

---

## B) Passo a passo do primeiro deploy (uma única vez)

1. **Neon** (https://neon.tech) → crie o projeto → copie a *Connection string (pooled)*.
2. **Suba o código** para um repositório GitHub e importe na **Vercel**
   (Framework preset: *Next.js* — tudo mais é detectado automaticamente).
3. Cadastre as **variáveis obrigatórias** da tabela acima na Vercel.
4. Clique em **Deploy**. O build já roda `prisma generate && prisma db push --skip-generate && next build`, ou seja: **as tabelas são criadas automaticamente no Neon** durante o build. O banco precisa estar acessível durante o build (é nele que o `db push` roda); depois do deploy, todas as consultas do site têm fallback seguro.
5. **Povoar o banco (seed)** — rode uma única vez, do seu computador, apontando para o Neon:
   ```bash
   # com bun:
   DATABASE_URL="postgresql://...neon...?sslmode=require" bun scripts/seed.ts

   # ou com npx (Node):
   DATABASE_URL="postgresql://...neon...?sslmode=require" npx tsx scripts/seed.ts
   ```
   O seed cria: produtos de exemplo em todas as categorias + os **6 artigos estratégicos de blog** + FAQs + avaliações.
   > Alternativa sem seed: cadastre produtos e artigos direto no **Painel Admin** (rota C abaixo).
6. **Domínio**: Vercel → Settings → Domains → adicione `cubacafe.com.br` e aponte o DNS conforme instruído. Depois atualize `NEXT_PUBLIC_SITE_URL` se ainda estiver com outro valor e faça *Redeploy*.
7. **Pós-deploy** (checklist rápido):
   - `https://SEUDOMINIO/robots.txt` → deve listar GPTBot, PerplexityBot, ClaudeBot etc.
   - `https://SEUDOMINIO/sitemap.xml` → páginas + produtos + artigos
   - `https://SEUDOMINIO/llms.txt` e `/llms-full.txt`
   - `https://SEUDOMINIO/#/admin` → painel carregando

---

## C) Painel Administrativo

- **Endereço**: `https://SEUDOMINIO/#/admin`
- **Acesso**: protegido por senha (`ADMIN_PASSWORD`). A sessão dura 12 horas e há botão **Sair**. Todas as rotas de escrita da API (produtos, pedidos, clientes, financeiro, fornecedores, blog, upload e configurações) exigem essa sessão; o catálogo, o blog, o carrinho/pedido por WhatsApp e o chat continuam públicos.
  - Sem `ADMIN_PASSWORD` em produção o painel fica **bloqueado** (nunca aberto).
  - Limite de tentativas de login: 8 a cada 10 minutos (por IP).
- O que dá para fazer no painel:
  - **Dashboard**: 8 métricas + 3 gráficos
  - **Produtos**: CRUD completo com upload de até 6 imagens (convertidas para WebP e salvas no Postgres — compatível com serverless)
  - **Pedidos**: fluxo de status
  - **Financeiro**: entradas, saídas, a receber, a pagar
  - **Clientes** e **Fornecedores**
  - **Blog**: criar/editar/excluir artigos com capa
  - **SEO**: meta título/descrição com preview Google

---

## D) Status do build

- ✅ `next build` de produção executado com sucesso (rotas de API + robots.txt + sitemap.xml gerados)
- ✅ TypeScript: **0 erros** em `src/` e `scripts/`
- ✅ ESLint: **0 erros / 0 avisos**
- ✅ Primeiro deploy em banco vazio funciona (fallbacks seguros em todas as consultas)

---

## Comandos locais

| Comando | O que faz |
|---|---|
| `bun install` ou `npm install` | instala dependências |
| `bun run dev` | servidor de desenvolvimento (porta 3000) |
| `bun run build:local` | build local de produção |
| `bun run seed` | povoar o banco |
| `bun run db:push` | sincroniza schema com o banco |

## Regras já aplicadas (Vercel/Neon hard requirements)

- `prisma/schema.prisma`: `provider = "postgresql"` + `binaryTargets = ["native", "rhel-openssl-3.0.x"]`
- `package.json → build`: exatamente `prisma generate && prisma db push --skip-generate && next build`
- `.env.example` sem senhas reais; `.gitignore` cobre `/node_modules`, `/.next`, `.env`, `.env*.local`, `*.log`
- Nenhuma consulta de banco no caminho de build sem `try/catch` + fallback
- Sem `;[a, b] = await Promise.all([...])` (compatível Turbopack/SWC)
- Sem armazenamento em disco: uploads viram WebP no Postgres (`/api/images/[id]`)
- `next.config.ts`: `output: 'standalone'`, headers de segurança, `images.remotePatterns` para https
