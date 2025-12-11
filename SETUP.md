# Bot de Controle Financeiro via WhatsApp

Sistema de controle financeiro via bot WhatsApp integrado.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Características](#características)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Testes](#testes)
- [Deploy](#deploy)

## 🎯 Visão Geral

Sistema de gestão financeira pessoal que permite:
- **Bot WhatsApp** para registrar transações via chat
- **Registro** de receitas, despesas e saldo
- **Consulta** de transações e metas
- **Categorização** automática de gastos

## ✨ Características

### Funcionalidades Principais

- ✅ Gerenciamento de contas bancárias via WhatsApp
- ✅ Registro de transações (receitas/despesas)
- ✅ Categorização automática
- ✅ Metas e orçamentos
- ✅ Bot WhatsApp integrado com whatsapp-web.js
- ✅ Inicialização automática da sessão

### Segurança

- 🔒 Proteção contra SQL injection (via Prisma)
- 🔒 Sessões WhatsApp criptografadas localmente

## 🏗️ Arquitetura

```
financebot/
├── backend/              # NestJS
│   ├── src/
│   │   ├── whatsapp/    # Integração WhatsApp e comandos
│   │   └── prisma/      # Serviço de banco de dados
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

O bot será iniciado automaticamente e exibirá o QR Code nos logs.

### Opção 2: Instalação Local

```bash
# Clone o repositório
git clone https://github.com/MAY0LPHI/financebot.git
cd financebot

# Copie o arquivo de configuração
cp .env.example .env

# Instale as dependências
npm install

# Configure o banco de dados PostgreSQL
# Atualize o arquivo backend/.env com suas credenciais

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
```

#### WhatsApp Configuration

O bot WhatsApp utiliza a biblioteca whatsapp-web.js e armazena as sessões criptografadas localmente no diretório `.local/`. 

**Recursos WhatsApp:**
- Sessões criptografadas armazenadas em `.local/`
- Pareamento automático via QR Code no terminal
- Reconexão automática em caso de desconexão
- Processamento de comandos em linguagem natural

Para mais detalhes sobre configuração e uso, consulte [WHATSAPP_BOT.md](WHATSAPP_BOT.md).

## 💻 Uso

### Iniciar o Bot

Ao executar `npm run start:dev`, o bot WhatsApp será iniciado automaticamente e exibirá um QR Code no terminal. Escaneie com seu WhatsApp para conectar.

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

- `DATABASE_URL`: Configure com credenciais seguras

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**: Verifique se PostgreSQL está rodando e as credenciais estão corretas
2. **Migrations não aplicadas**: Execute `npx prisma migrate dev` no backend
3. **Porta em uso**: Altere as portas em `.env` e `docker-compose.yml`
4. **QR Code não aparece**: Verifique os logs do terminal para ver o status
5. **Sessão WhatsApp desconectada**: Reinicie o servidor para gerar novo QR Code
6. **TypeScript error `Module has no exported member`**: Execute `cd backend && npx prisma generate` para regenerar o Prisma Client após mudanças no schema

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

**Desenvolvido com ❤️ usando NestJS, Prisma e whatsapp-web.js**
