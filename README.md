# Bot de Controle Financeiro via WhatsApp

Sistema de controle financeiro através de bot conversacional no WhatsApp.

## 🎯 Visão Geral

- **Bot WhatsApp** para registrar receitas, despesas, transferências e metas via mensagens
- **Backend API** robusta com NestJS, Prisma, PostgreSQL e Redis
- **Comandos em Português** para facilitar o uso
- **Importação** de extratos (CSV/OFX)
- **Multi-moeda** e categorização inteligente
- **Relatórios** via comandos do bot

## ⚡ Quick Start

### Com Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/MAY0LPHI/financebot.git
cd financebot

# Inicie os serviços
docker compose up -d

# Execute as migrações do banco
docker compose exec backend npx prisma migrate deploy

# Popule o banco com dados iniciais
docker compose exec backend npm run prisma:seed
```

### Desenvolvimento Local

```bash
# Instale as dependências
npm run install:all

# Inicie o backend
npm run dev

# Acesse a API em:
# http://localhost:3001
# http://localhost:3001/api/docs
```

**API Backend**: http://localhost:3001  
**Documentação da API (Swagger)**: http://localhost:3001/api/docs

## 📚 Documentação Completa

Para instruções detalhadas de instalação, configuração e uso, consulte:
- [**SETUP.md**](SETUP.md) - Guia completo de instalação e configuração
- [**WHATSAPP_BOT.md**](WHATSAPP_BOT.md) - Guia de uso do bot WhatsApp
- [**API Docs**](http://localhost:3001/api/docs) - Swagger/OpenAPI (após iniciar)

## 🏗️ Arquitetura

```
financebot/
├── backend/              # NestJS + Prisma + PostgreSQL
│   ├── src/
│   │   ├── users/       # Gerenciamento de usuários
│   │   ├── accounts/    # Contas bancárias
│   │   ├── cards/       # Cartões de crédito/débito
│   │   ├── categories/  # Categorização
│   │   ├── transactions/# Transações financeiras
│   │   ├── budgets/     # Orçamentos
│   │   ├── goals/       # Metas financeiras
│   │   ├── reports/     # Relatórios e analytics
│   │   ├── import/      # Importação CSV/OFX
│   │   ├── chat/        # Bot conversacional
│   │   ├── whatsapp/    # Integração WhatsApp
│   │   └── webhooks/    # Webhooks (mock)
│   └── prisma/          # Schema e migrations
├── shared/              # Tipos TypeScript compartilhados
└── docker-compose.yml   # Stack completa
```

## ✨ Características

### Funcionalidades Principais

- ✅ **Bot WhatsApp** integrado com Baileys para controle financeiro completo
- ✅ **Pareamento via QR Code** ou código de telefone
- ✅ Gerenciamento de contas bancárias e cartões
- ✅ Registro de transações (receitas/despesas/transferências)
- ✅ Categorização automática e manual
- ✅ Metas e orçamentos com alertas
- ✅ Importação de extratos (CSV/OFX)
- ✅ Comandos em português para facilitar o uso
- ✅ Relatórios via API REST
- ✅ Multi-moeda com conversão
- ✅ API REST completa com Swagger

### Segurança

- 🔒 Rate limiting por IP
- 🔒 Validação e sanitização de entrada
- 🔒 CORS configurável
- 🔒 Proteção contra SQL injection (via Prisma)
- 🔒 Sessões WhatsApp criptografadas
- 🔒 Verificação de contatos WhatsApp autorizados

## 🛠️ Tecnologias

### Backend
- **NestJS** - Framework Node.js enterprise
- **Prisma** - ORM type-safe
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e sessões
- **Swagger** - Documentação OpenAPI
- **TypeScript** - Type safety completo

### WhatsApp Integration
- **@whiskeysockets/baileys** - Biblioteca WhatsApp Web
- **QR Code pairing** - Autenticação via QR Code
- **Phone pairing** - Autenticação via código
- **Command parser** - Processamento de linguagem natural

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração
- **ESLint** - Linting
- **Prettier** - Formatação
- **Jest** - Testes

## 📋 Funcionalidades Adicionais

- Upload/parse de extratos (CSV/OFX) com conciliação
- Regras de categorização por descrição, valor, conta
- Metas/orçamentos com alertas percentuais
- Exportação/importação (CSV/JSON)
- Logs de auditoria por usuário
- Notificações configuráveis
- Suporte a múltiplas moedas
- Conversões de moeda configuráveis
- Fluxo de caixa projetado
- DRE simplificada
- Saldo consolidado por conta
- Despesas por categoria
- Webhooks mockados para integração bancária

## 🧪 Testes

```bash
# Backend
cd backend
npm run test          # Testes unitários
npm run test:e2e      # Testes E2E
npm run test:cov      # Coverage

# Com Make
make test
```

## 🚀 Deploy

Ver [SETUP.md](SETUP.md#deploy) para instruções de deploy em produção.

## 📝 Comandos Principais

```bash
# Desenvolvimento
make dev              # Inicia dev servers
make docker-up        # Inicia com Docker
make seed             # Popula banco de dados

# Build
make build            # Build completo

# Testes
make test             # Roda todos os testes

# Linting
make lint             # Lint código
make format           # Formata código

# Docker
make docker-logs      # Ver logs
make docker-down      # Parar containers
make docker-restart   # Reiniciar containers

# Database
make migrate          # Rodar migrations
make studio           # Abrir Prisma Studio
```

## 🔧 Desenvolvimento

### Estrutura de Pastas

- `backend/src/` - Código fonte da API NestJS
- `backend/prisma/` - Schema do banco e migrations
- `shared/src/` - Tipos TypeScript compartilhados
- `docs/` - Documentação adicional
- `scripts/` - Scripts utilitários
- `.local/` - Arquivos locais do WhatsApp (sessões, cache)

### Comandos NPM

```bash
npm run dev              # Desenvolvimento
npm run build            # Build
npm run start            # Produção
npm run lint             # Lint
npm run format           # Format
npm run test             # Testes
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add NovaFeature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para questões e suporte, abra uma [issue no GitHub](https://github.com/MAY0LPHI/financebot/issues).

## 📜 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com ❤️ usando NestJS, Next.js, Prisma e shadcn/ui**
