# Como Usar o Bot WhatsApp

Este documento explica como configurar e usar o FinBot via WhatsApp.

## 📱 Configuração Inicial

### 1. Iniciar o Bot

Ao executar `npm run start:dev`, o bot WhatsApp será iniciado automaticamente. Um QR Code será exibido no terminal.

### 2. Escanear o QR Code

Escaneie o QR code exibido no terminal com o WhatsApp do seu celular em:
- **WhatsApp > Configurações > Aparelhos Conectados > Conectar um aparelho**

O bot estará pronto quando você ver a mensagem "✅ Cliente main-session está pronto!" no terminal.

## 💬 Comandos do Bot

### Comandos Básicos

- `ajuda` ou `help` - Mostra todos os comandos disponíveis
- `/start` - Inicia a conversa com o bot

### Registrar Receitas

```
Recebi R$ 5000 de salário
Ganhei R$ 500 de freelance
Entrada de R$ 1000 em investimentos
```

### Registrar Despesas

```
Gastei R$ 150 no mercado
Paguei R$ 80 de internet
Comprei R$ 50 de gasolina
```

### Consultar Saldo

```
Qual meu saldo?
Saldo
Ver minhas contas
```

### Listar Transações

```
Minhas transações
Últimas transações
Ver gastos
```

### Consultar Metas

```
Minhas metas
Como estão minhas metas?
Ver objetivos
```

## 🔗 Vinculando seu WhatsApp ao Sistema

### 1. Registrar seu Contato

Primeiro, você precisa vincular seu número de WhatsApp a um usuário no sistema. Isso pode ser feito diretamente no banco de dados:

```sql
-- Exemplo de vinculação no banco de dados
INSERT INTO "WhatsAppContact" (id, "phoneNumber", "userId", "isVerified")
VALUES (
  gen_random_uuid(),
  '5511999999999',  -- Seu número com código do país
  '<user-id>',       -- ID do usuário no sistema
  true
);
```

### 2. Verificação de Segurança

Por questões de segurança, apenas números verificados podem usar o bot. Certifique-se de que o campo `isVerified` está como `true`.

## 🎯 Exemplos de Uso

### Exemplo 1: Registrar uma Despesa

```
Você: Gastei R$ 250 no mercado categoria alimentação

Bot: ✅ Despesa registrada com sucesso!
- Valor: R$ 250,00
- Descrição: mercado
- Categoria: Alimentação
```

### Exemplo 2: Consultar Saldo

```
Você: Qual meu saldo?

Bot: 💰 Seu saldo atual:

Conta Corrente: R$ 2.500,00
Poupança: R$ 5.000,00
Carteira: R$ 150,00

Total: R$ 7.650,00
```

### Exemplo 3: Ver Transações

```
Você: Minhas últimas transações

Bot: 📊 Últimas transações:

1. R$ 250,00 - Mercado (Alimentação)
   📅 10/12/2025

2. R$ 80,00 - Internet (Contas)
   📅 09/12/2025

3. R$ 5.000,00 - Salário (Receita)
   📅 05/12/2025
```

## 🛠️ Solução de Problemas

### Bot não responde

1. Verifique os logs do servidor no terminal

2. Verifique se seu número está verificado no banco de dados

3. Reinicie o servidor para reconectar a sessão

### Erro de autenticação

Se você receber a mensagem "Seu número não está cadastrado ou verificado":

1. Verifique se seu número está no banco de dados
2. Confirme que o campo `isVerified` está como `true`
3. Certifique-se de estar usando o número correto (com código do país)

## 📚 Recursos Adicionais

- **GitHub Issues**: Para reportar problemas ou sugerir melhorias
- **Logs do Sistema**: Use `docker compose logs -f backend` para ver os logs em tempo real

## 🔒 Segurança

- Nunca compartilhe seu QR code
- Apenas números verificados podem usar o bot
- Mantenha seu banco de dados seguro
- Use senhas fortes para PostgreSQL em produção
- Configure variáveis de ambiente adequadas para produção
