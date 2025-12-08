# FinBot - Financial Control System

## Overview

FinBot is a personal financial management system that combines a conversational bot interface with a web dashboard. Users can track income, expenses, transfers, bank accounts, credit cards, budgets, and financial goals. The system supports importing bank statements (CSV/OFX), generates reports with interactive charts, and provides multi-currency support.

The project uses a monorepo structure with three workspaces: backend (NestJS API), frontend (Next.js web app), and shared (common TypeScript types).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend (NestJS + Prisma + PostgreSQL)

**Framework**: NestJS with TypeScript, using modular architecture with feature-based modules.

**Database**: PostgreSQL accessed through Prisma ORM. The schema includes entities for users, accounts, cards, categories, transactions, budgets, goals, and refresh tokens.

**Authentication**: JWT-based authentication with access and refresh tokens. Supports optional TOTP-based two-factor authentication using speakeasy library. Passport.js handles authentication strategies (local and JWT).

**Modules Structure**:
- Auth - Registration, login, JWT tokens, 2FA
- Users - User profile management
- Accounts - Bank account CRUD
- Cards - Credit/debit card management
- Categories - Transaction categorization
- Transactions - Financial transaction CRUD with filtering
- Budgets - Budget limits per category
- Goals - Savings goals tracking
- Reports - Cash flow and expense analytics
- Import - CSV/OFX file parsing for bank statements
- Chat - Simple intent-based conversational bot
- Webhooks - Mock endpoints for bank integrations

**Security Features**: Rate limiting via @nestjs/throttler, input validation with class-validator, bcrypt password hashing, configurable CORS.

**API Documentation**: Swagger/OpenAPI available at /api/docs endpoint.

### Frontend (Next.js 14 + shadcn/ui)

**Framework**: Next.js 14 with App Router, TypeScript, and React 18.

**Styling**: Tailwind CSS with shadcn/ui components (built on Radix UI primitives). Supports dark/light theme switching via next-themes.

**Charts**: ECharts for React for interactive financial visualizations.

**API Communication**: Axios client with interceptors for automatic JWT token injection. Centralized API module with typed methods for each backend resource.

**Key Pages**:
- Login page with demo credentials
- Dashboard with account summaries, recent transactions, and cash flow charts
- Chat widget overlay for conversational bot interaction

### Shared Package

Contains TypeScript enums and interfaces used by both frontend and backend to ensure type consistency across the stack.

### Monorepo Configuration

Uses npm workspaces to manage three packages. Root package.json includes convenience scripts for running both services concurrently during development.

## External Dependencies

**Database**: PostgreSQL - Primary data store for all financial data. Connection configured via DATABASE_URL environment variable.

**Cache/Sessions**: Redis - Listed in dependencies for caching and session storage (connection details via REDIS_URL).

**Authentication Libraries**:
- passport, passport-jwt, passport-local for authentication strategies
- speakeasy for TOTP 2FA code generation
- qrcode for generating 2FA setup QR codes
- bcrypt for password hashing

**File Parsing**:
- csv-parse for CSV import functionality
- node-ofx-parser for OFX bank statement imports

**Frontend Libraries**:
- axios for HTTP requests
- echarts/echarts-for-react for charts
- react-hook-form with zod for form validation
- date-fns for date formatting
- Radix UI primitives (@radix-ui/*) for accessible components

**Development**:
- Prisma CLI for database migrations and seeding
- concurrently for running multiple dev servers