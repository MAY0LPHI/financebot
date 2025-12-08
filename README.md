# Bot de Controle Financeiro + Painel Web

Sistema completo de controle financeiro com bot conversacional e painel web administrativo.

## 🎯 Visão Geral

- **Bot** para registrar receitas, despesas, transferências e metas via chat
- **Painel Web** responsivo com dashboards, gráficos e relatórios
- **Backend API** robusta com NestJS, Prisma, PostgreSQL e Redis
- **Autenticação** segura com JWT e 2FA TOTP
- **Importação** de extratos (CSV/OFX)
- **Multi-moeda** e categorização inteligente

## ⚡ Quick Start

### Com Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/MAY0LPHI/bot-fin-site.git
cd bot-fin-site

# Execute o script de quick start
./scripts/quickstart.sh

# Ou manualmente:
docker compose up -d
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run prisma:seed
```

### Com Make

```bash
make quickstart  # Inicia tudo com Docker
make dev         # Desenvolvimento local
make help        # Ver todos os comandos
```

**Acesse**: http://localhost:3000

**Credenciais**:
- Email: `demo@finbot.test`
- Senha: `Demo123!`

## 📚 Documentação Completa

Para instruções detalhadas de instalação, configuração e uso, consulte:
- [**SETUP.md**](SETUP.md) - Guia completo de instalação e configuração
- [**API Docs**](http://localhost:3001/api/docs) - Swagger/OpenAPI (após iniciar)
- [**API Collection**](docs/API_COLLECTION.json) - Postman/Insomnia

## 🏗️ Arquitetura

```
bot-fin-site/
├── backend/              # NestJS + Prisma + PostgreSQL
│   ├── src/
│   │   ├── auth/        # JWT + 2FA TOTP
│   │   ├── transactions/
│   │   ├── accounts/
│   │   ├── chat/        # Bot conversacional
│   │   └── reports/     # Relatórios e analytics
│   └── prisma/          # Schema e migrations
├── frontend/            # Next.js 14 + shadcn/ui + ECharts
│   └── src/
│       ├── app/         # Pages (App Router)
│       └── components/  # UI components
├── shared/              # Tipos TypeScript compartilhados
└── docker-compose.yml   # Stack completa
```

## ✨ Características

### Funcionalidades Principais

- ✅ Gerenciamento de contas bancárias e cartões
- ✅ Registro de transações (receitas/despesas/transferências)
- ✅ Categorização automática e manual
- ✅ Metas e orçamentos com alertas
- ✅ Importação de extratos (CSV/OFX)
- ✅ Bot conversacional para registros rápidos
- ✅ Relatórios e gráficos interativos (ECharts)
- ✅ Exportação de dados (CSV/PDF)
- ✅ Multi-moeda com conversão
- ✅ Tema claro/escuro

### Segurança

- 🔒 Autenticação JWT com refresh tokens
- 🔒 2FA com TOTP (Google Authenticator/Authy)
- 🔒 Rate limiting por IP
- 🔒 Validação e sanitização de entrada
- 🔒 Criptografia de senhas com bcrypt
- 🔒 CORS configurável
- 🔒 Proteção contra SQL injection e XSS

## 🛠️ Tecnologias

### Backend
- **NestJS** - Framework Node.js enterprise
- **Prisma** - ORM type-safe
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e sessões
- **JWT** - Autenticação stateless
- **Speakeasy** - 2FA TOTP
- **Swagger** - Documentação OpenAPI

### Frontend
- **Next.js 14** - React framework com App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Componentes acessíveis
- **ECharts** - Gráficos interativos
- **Axios** - HTTP client

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

- `backend/src/` - Código fonte da API
- `frontend/src/app/` - Pages do Next.js
- `frontend/src/components/` - Componentes reutilizáveis
- `shared/src/` - Tipos TypeScript compartilhados
- `docs/` - Documentação adicional
- `scripts/` - Scripts utilitários

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

Para questões e suporte, abra uma [issue no GitHub](https://github.com/MAY0LPHI/bot-fin-site/issues).

## 📜 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com ❤️ usando NestJS, Next.js, Prisma e shadcn/ui**
