# FinBot - WhatsApp Financial Control Bot

## Overview

FinBot is a personal financial management WhatsApp bot. Users can track income, expenses, bank accounts, and financial goals directly through WhatsApp messages. The bot starts automatically when the server runs.

The project uses a monorepo structure with two workspaces: backend (NestJS) and shared (common TypeScript types).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend (NestJS + Prisma + PostgreSQL)

**Framework**: NestJS with TypeScript, using modular architecture.

**Database**: PostgreSQL accessed through Prisma ORM. The schema includes entities for users, accounts, cards, categories, transactions, budgets, goals, and WhatsApp contacts/sessions.

**Modules Structure**:
- WhatsApp - WhatsApp bot integration with command parsing
- Prisma - Database service

**WhatsApp Integration**: Uses whatsapp-web.js library. Sessions are automatically initialized on server startup. QR code is displayed in the terminal for pairing.

### Shared Package

Contains TypeScript enums and interfaces used by both backend and other packages.

### Monorepo Configuration

Uses npm workspaces to manage packages. Root package.json includes convenience scripts for development.

## External Dependencies

**Database**: PostgreSQL - Primary data store for all financial data. Connection configured via DATABASE_URL environment variable.

**WhatsApp Libraries**:
- whatsapp-web.js for WhatsApp integration
- qrcode-terminal for displaying QR code in terminal

**Development**:
- Prisma CLI for database migrations and seeding