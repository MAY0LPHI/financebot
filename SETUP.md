# Bot de Controle Financeiro + Painel Web

Sistema completo de controle financeiro com bot conversacional e painel web administrativo.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Características](#características)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [API Documentation](#api-documentation)
- [Testes](#testes)
- [Deploy](#deploy)

## 🎯 Visão Geral

Sistema de gestão financeira pessoal que combina:
- **Backend API** (NestJS + Prisma + PostgreSQL + Redis)
- **Frontend Web** (Next.js + shadcn/ui + ECharts)
- **Bot Conversacional** para registrar transações via chat
- **Autenticação** com JWT e 2FA TOTP
- **Importação** de extratos (CSV/OFX)
- **Relatórios** e dashboards interativos

## ✨ Características

### Funcionalidades Principais

- ✅ Gerenciamento de contas bancárias
- ✅ Registro de transações (receitas/despesas/transferências)
- ✅ Categorização automática e manual
- ✅ Cartões de crédito e débito
- ✅ Metas e orçamentos com alertas
- ✅ Importação de extratos (CSV/OFX)
- ✅ Bot WhatsApp integrado com whatsapp-web.js
- ✅ Relatórios via API REST
- ✅ Exportação de dados (CSV)
- ✅ Multi-moeda
- ✅ API REST completa com Swagger

### Segurança

- 🔒 Rate limiting por IP
- 🔒 Validação e sanitização de dados
- 🔒 Proteção contra SQL injection (via Prisma)
- 🔒 CORS configurável
- 🔒 Sessões WhatsApp criptografadas localmente

## 🏗️ Arquitetura

```
financebot/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── users/       # Gerenciamento de usuários
│   │   ├── accounts/    # Contas bancárias
│   │   ├── cards/       # Cartões
│   │   ├── categories/  # Categorias
│   │   ├── transactions/# Transações
│   │   ├── budgets/     # Orçamentos
│   │   ├── goals/       # Metas
│   │   ├── reports/     # Relatórios
│   │   ├── import/      # Importação CSV/OFX
│   │   ├── chat/        # Bot conversacional
│   │   ├── whatsapp/    # Integração WhatsApp
│   │   └── webhooks/    # Webhooks (mock)
│   ├── prisma/          # Schema e migrations
│   └── test/            # Testes
├── shared/              # Tipos compartilhados
├── docs/                # Documentação adicional
├── docker-compose.yml   # Orquestração de containers
└── package.json         # Monorepo root

```

## 📦 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose (recomendado)
- PostgreSQL 16+ (se não usar Docker)
- Redis 7+ (se não usar Docker)

## 🚀 Instalação

### Opção 1: Docker Compose (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/MAY0LPHI/financebot.git
cd financebot

# Copie os arquivos de exemplo de ambiente
cp .env.example .env
cp backend/.env.example backend/.env

# Inicie todos os serviços
docker compose up -d

# Aguarde os serviços iniciarem e execute as migrations
docker compose exec backend npx prisma migrate deploy

# Execute o seed para dados de exemplo
docker compose exec backend npm run prisma:seed
```

Acesse:
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

### Opção 2: Instalação Local

```bash
# Clone o repositório
git clone https://github.com/MAY0LPHI/financebot.git
cd financebot

# Copie o arquivo de configuração
cp .env.example .env

# Instale as dependências
npm install

# Configure o banco de dados PostgreSQL e Redis
# Atualize o arquivo .env com suas credenciais

# Execute migrations e seed
cd backend
npx prisma migrate dev
npx prisma generate
npm run prisma:seed

# Inicie o servidor
npm run start:dev
```

## ⚙️ Configuração

### Variáveis de Ambiente

#### Backend (.env)

```env
NODE_ENV=development
APP_PORT=3001

# Database
DATABASE_URL=postgresql://finbot_user:finbot_pass@localhost:5432/finbot

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# 2FA
TOTP_APP_NAME=FinBot

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### WhatsApp Configuration

O bot WhatsApp utiliza a biblioteca whatsapp-web.js e armazena as sessões criptografadas localmente no diretório `.local/`. 

**Recursos WhatsApp:**
- Sessões criptografadas armazenadas em `.local/`
- Pareamento via QR Code
- Suporte a múltiplas sessões simultâneas
- Reconexão automática em caso de desconexão
- Processamento de comandos em linguagem natural

Para mais detalhes sobre configuração e uso, consulte [WHATSAPP_BOT.md](WHATSAPP_BOT.md).

## 💻 Uso

### Credenciais de Demo

- **Email**: demo@finbot.test
- **Senha**: Demo123!
- **Perfil**: Admin

### Principais Funcionalidades

1. **API REST**: Acesse endpoints da API
2. **WhatsApp Bot**: Interaja via WhatsApp
3. **Transações**: Registre e gerencie transações
4. **Contas**: Configure suas contas bancárias
5. **Orçamentos**: Crie e acompanhe orçamentos
6. **Metas**: Defina objetivos financeiros
7. **Relatórios**: Gere análises via API
8. **Chat Bot**: Use o chat conversacional

### Comandos NPM

```bash
# Desenvolvimento
npm run dev              # Inicia backend em modo dev

# Build
npm run build            # Build completo

# Testes
npm run test             # Testes completos

# Lint e Format
npm run lint             # Lint código
npm run format           # Format código

# Docker
npm run docker:up        # Inicia containers
npm run docker:down      # Para containers
npm run docker:logs      # Visualiza logs

# Prisma
npm run prisma:migrate   # Executa migrations
npm run prisma:seed      # Popula banco com dados
```

## 📚 API Documentation

A documentação completa da API está disponível em:
- **Swagger UI**: http://localhost:3001/api/docs

### Principais Endpoints

#### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login
- `POST /auth/2fa/enable` - Habilitar 2FA
- `POST /auth/2fa/verify` - Verificar código 2FA
- `GET /auth/profile` - Obter perfil

#### Transações
- `GET /transactions` - Listar transações
- `POST /transactions` - Criar transação
- `GET /transactions/:id` - Obter transação
- `PATCH /transactions/:id` - Atualizar transação
- `DELETE /transactions/:id` - Deletar transação

#### Contas
- `GET /accounts` - Listar contas
- `POST /accounts` - Criar conta
- `PATCH /accounts/:id` - Atualizar conta
- `DELETE /accounts/:id` - Deletar conta

#### Relatórios
- `GET /reports/cash-flow` - Fluxo de caixa
- `GET /reports/expenses-by-category` - Despesas por categoria
- `GET /reports/balance-by-account` - Saldo por conta

#### Chat Bot
- `POST /chat` - Enviar mensagem para o bot

Ver `docs/API_COLLECTION.json` para coleção Postman/Insomnia completa.

## 🧪 Testes

### Backend

```bash
cd backend

# Testes unitários
npm run test

# Testes com coverage
npm run test:cov

# Testes E2E
npm run test:e2e

# Testes em watch mode
npm run test:watch
```

## 🚢 Deploy

### Produção com Docker

```bash
# Build das imagens
docker compose -f docker-compose.yml build

# Inicie em produção
docker compose -f docker-compose.yml up -d
```

### Variáveis de Ambiente de Produção

⚠️ **IMPORTANTE**: Altere todas as secrets em produção!

- `JWT_SECRET`: Use um valor forte e aleatório
- `JWT_REFRESH_SECRET`: Use um valor diferente do JWT_SECRET
- `DATABASE_URL`: Configure com credenciais seguras
- `REDIS_URL`: Configure com senha em produção

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**: Verifique se PostgreSQL está rodando e as credenciais estão corretas
2. **Migrations não aplicadas**: Execute `npx prisma migrate dev` no backend
3. **Porta em uso**: Altere as portas em `.env` e `docker-compose.yml`
4. **Redis não conecta**: Verifique se Redis está rodando na porta correta
5. **WhatsApp QR Code expirado**: Solicite um novo QR code via API `/whatsapp/init`
6. **Sessão WhatsApp desconectada**: Reinicie a sessão usando os endpoints `/whatsapp/disconnect` e `/whatsapp/init`
7. **Erro de pareamento WhatsApp**: Verifique se o número está no formato correto com código do país (ex: 5511999999999)

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor:
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para questões e suporte, abra uma issue no GitHub.

---

**Desenvolvido com ❤️ usando NestJS, Next.js, Prisma e shadcn/ui**
