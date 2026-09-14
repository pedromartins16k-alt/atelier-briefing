# Atelier Briefing

Aplicação Vite + React para levantamento de requisitos e geração de orçamento. A primeira versão opera com custo inicial de **R$ 0**: Cloudflare Pages Free para o frontend e Supabase Free (PostgreSQL) para os envios.

## Rodar localmente

1. Instale Node.js 20+.
2. Copie `.env.example` para `.env.local`.
3. Preencha as variáveis públicas do Supabase:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_publica_anon
```

4. Execute `npm install` e `npm run dev`.

Sem as variáveis, o briefing funciona como rascunho local; o envio final mostra uma mensagem de configuração pendente e não apaga dados.

## Configurar Supabase Free

1. Crie uma conta e um projeto no plano Free em [Supabase](https://supabase.com/dashboard).
2. Em **Project Settings → API**, copie a URL do projeto e a chave **anon/public**. Nunca use `service_role` no frontend.
3. Abra **SQL Editor**, crie uma nova consulta, cole e execute `supabase/migrations/20260914_initial_schema.sql`.
4. Preencha `.env.local` com as duas chaves públicas acima.
5. Reinicie `npm run dev`, complete o briefing e envie. No Table Editor haverá um registro em `clients`, `briefings`, `quotes` e itens em `quote_items`.

A migration habilita RLS em todas as tabelas e não cria políticas públicas de leitura/escrita. O navegador chama somente a função `submit_public_briefing`, que grava tudo em uma transação. O `submission_id` é único e preservado no navegador enquanto há tentativa pendente: duplo clique e nova tentativa não duplicam o envio. Após confirmação, o rascunho é removido do `localStorage`.

## Deploy no Cloudflare Pages Free

1. Envie o projeto para um repositório GitHub. Confirme que `.env.local` não está no commit.
2. No Cloudflare Dashboard: **Workers & Pages → Create → Pages → Connect to Git**.
3. Selecione o repositório e configure:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: `20` ou superior
4. Em **Settings → Environment variables**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` para Production (e Preview, se desejar).
5. Faça o deploy. Use o subdomínio gratuito `*.pages.dev` fornecido pela Cloudflare; não é necessário comprar domínio.

## Verificação e manutenção

```bash
npm run lint
npm run build
```

Os valores do orçamento são exemplos configuráveis em `src/config/pricing.ts`. A proposta enviada é um snapshot: `quotes` e `quote_items` mantêm o valor submetido mesmo se a configuração mudar depois.

## Limites gratuitos

Cloudflare Pages e Supabase podem mudar limites e condições. Esta versão não usa e-mail, Storage, Realtime, funções pagas ou domínio próprio. Crescimento de tráfego, banco/armazenamento, autenticação administrativa ou notificações poderão exigir reavaliação futura dos limites, mas o custo inicial desta arquitetura é R$ 0.
