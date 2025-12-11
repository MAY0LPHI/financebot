# 🤖 Bot de Controle Financeiro via WhatsApp

Controle suas finanças direto pelo WhatsApp! Registre receitas, despesas e consulte seu saldo através de mensagens.

## 📱 Como Executar

### No Git Bash (Windows)

**Comando rápido (uma linha):**
```bash
git clone https://github.com/MAY0LPHI/financebot.git && cd financebot && npm install && cd backend && npm install && npm run start:dev
```

**Ou passo a passo:**
```bash
# 1. Clonar o repositório
git clone https://github.com/MAY0LPHI/financebot.git
cd financebot

# 2. Instalar dependências
npm install
cd backend
npm install

# 3. Iniciar o bot
npm run start:dev
```

### No Termux (Android)

**Comando rápido (uma linha):**
```bash
pkg install nodejs git -y && git clone https://github.com/MAY0LPHI/financebot.git && cd financebot && npm install && cd backend && npm install && npm run start:dev
```

**Ou passo a passo:**
```bash
# 1. Instalar dependências do sistema
pkg install nodejs git -y

# 2. Clonar o repositório
git clone https://github.com/MAY0LPHI/financebot.git
cd financebot

# 3. Instalar dependências do projeto
npm install
cd backend
npm install

# 4. Iniciar o bot
npm run start:dev
```

## 🔧 Configuração Inicial

### 1. Configurar Banco de Dados

Antes de iniciar, você precisa ter PostgreSQL e Redis instalados, ou usar Docker:

**Com Docker (Recomendado):**
```bash
docker compose up -d postgres redis
```

**Sem Docker:**
- Instale PostgreSQL e Redis no seu sistema
- Crie um arquivo `.env` na pasta `backend/` baseado no `.env.example`
- Configure a `DATABASE_URL` e `REDIS_URL`

### 2. Inicializar o Banco

```bash
cd backend
npx prisma migrate deploy
npm run prisma:seed
```

### 3. Iniciar o Bot

O bot iniciará automaticamente quando você executar `npm run start:dev`.

O servidor ficará disponível em: `http://localhost:3001`

## 📲 Conectar WhatsApp

### 1. Iniciar Sessão

Após iniciar o servidor, use curl ou Postman para iniciar uma sessão:

```bash
curl -X POST http://localhost:3001/whatsapp/init -H "Content-Type: application/json" -d '{"sessionName": "minha-sessao"}'
```

### 2. Obter QR Code

```bash
curl http://localhost:3001/whatsapp/qr/minha-sessao
```

Escaneie o QR code com seu WhatsApp em:
**Configurações > Aparelhos Conectados > Conectar um aparelho**

### 3. Verificar Status

```bash
curl http://localhost:3001/whatsapp/status/minha-sessao
```

## 💬 Comandos do Bot

Envie mensagens direto pelo WhatsApp:

### Registrar Gastos
```
Gastei R$ 150 no mercado
Paguei R$ 80 de internet
Comprei R$ 50 de gasolina
```

### Registrar Receitas
```
Recebi R$ 5000 de salário
Ganhei R$ 500 de freelance
Entrada de R$ 1000
```

### Consultar Saldo
```
Qual meu saldo?
Saldo
Ver minhas contas
```

### Ver Transações
```
Minhas transações
Últimas transações
Ver gastos
```

### Ver Metas
```
Minhas metas
Como estão minhas metas?
```

### Ajuda
```
ajuda
help
/start
```

## ⚙️ Requisitos

- **Node.js** 18 ou superior
- **PostgreSQL** (ou Docker)
- **Redis** (ou Docker)
- **Git**

### Termux (Android)
```bash
pkg install nodejs git postgresql redis -y
```

### Git Bash (Windows)
- Instale Node.js: https://nodejs.org
- Instale PostgreSQL: https://www.postgresql.org/download/windows/
- Instale Redis: https://github.com/microsoftarchive/redis/releases (ou use Docker)
- Git Bash já vem com o Git for Windows

## 🆘 Solução de Problemas

### Bot não responde

1. Verifique se a sessão está conectada:
```bash
curl http://localhost:3001/whatsapp/status/minha-sessao
```

2. Verifique os logs do servidor no terminal

3. Reinicie a sessão:
```bash
curl -X POST http://localhost:3001/whatsapp/disconnect/minha-sessao
```

### Erro de autenticação

Seu número precisa estar cadastrado no banco de dados. Após criar um usuário, vincule seu número WhatsApp:

```sql
INSERT INTO "WhatsAppContact" (id, "phoneNumber", "userId", "isVerified")
VALUES (gen_random_uuid(), '5511999999999', '<user-id>', true);
```

**Nota:** Substitua:
- `5511999999999` pelo seu número WhatsApp com código do país (sem + ou espaços)
- `<user-id>` pelo ID do usuário no banco de dados (pode ser obtido consultando a tabela User)

### Erro de compilação TypeScript

Se você receber um erro como `Module '"@prisma/client"' has no exported member`, execute:

```bash
cd backend
npx prisma generate
```

Isso regenera o Prisma Client com todos os tipos do schema.

## 📚 Mais Informações

- **Comandos Completos**: Ver arquivo `WHATSAPP_BOT.md`
- **Configuração Avançada**: Ver arquivo `SETUP.md`

## 📜 Licença

MIT License - Veja LICENSE para mais detalhes
