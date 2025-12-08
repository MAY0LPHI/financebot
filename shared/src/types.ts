// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  INVESTMENT = 'INVESTMENT',
  CASH = 'CASH',
}

export enum CardType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum CategoryType {
  FIXED = 'FIXED',
  VARIABLE = 'VARIABLE',
}

export enum RecurrenceType {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

// User
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateDto {
  email: string;
  password: string;
  name: string;
}

export interface UserLoginDto {
  email: string;
  password: string;
  twoFactorToken?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'twoFactorSecret'>;
  requiresTwoFactor?: boolean;
}

// Account
export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountCreateDto {
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color?: string;
  icon?: string;
}

// Card
export interface Card {
  id: string;
  userId: string;
  accountId?: string;
  name: string;
  type: CardType;
  lastFourDigits: string;
  limit?: number;
  closingDay?: number;
  dueDay?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardCreateDto {
  accountId?: string;
  name: string;
  type: CardType;
  lastFourDigits: string;
  limit?: number;
  closingDay?: number;
  dueDay?: number;
}

// Category
export interface Category {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryCreateDto {
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
}

// Transaction
export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  categoryId?: string;
  accountId?: string;
  cardId?: string;
  tags?: string[];
  recurrence?: RecurrenceType;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  account?: Account;
  card?: Card;
}

export interface TransactionCreateDto {
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  categoryId?: string;
  accountId?: string;
  cardId?: string;
  tags?: string[];
  recurrence?: RecurrenceType;
  isPaid?: boolean;
}

export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  cardId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
  isPaid?: boolean;
  search?: string;
}

// Budget
export interface Budget {
  id: string;
  userId: string;
  categoryId?: string;
  name: string;
  amount: number;
  period: 'MONTHLY' | 'YEARLY';
  startDate: Date;
  endDate?: Date;
  alertPercentage?: number;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
}

export interface BudgetCreateDto {
  categoryId?: string;
  name: string;
  amount: number;
  period: 'MONTHLY' | 'YEARLY';
  startDate: Date;
  endDate?: Date;
  alertPercentage?: number;
}

// Goal
export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalCreateDto {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  currency: string;
  targetDate?: Date;
}

// Bot Chat
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
  action?: {
    type: 'confirm_transaction' | 'show_balance' | 'list_transactions' | 'create_budget';
    data?: any;
  };
}

// Reports
export interface ReportRequest {
  type: 'cash_flow' | 'expenses_by_category' | 'income_statement' | 'balance_by_account';
  dateFrom: Date;
  dateTo: Date;
  format?: 'json' | 'csv' | 'pdf';
}

export interface CashFlowReport {
  period: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface ExpensesByCategoryReport {
  categoryName: string;
  amount: number;
  percentage: number;
}

// Import
export interface ImportRequest {
  file: File;
  accountId: string;
  format: 'csv' | 'ofx';
}

export interface ImportResult {
  imported: number;
  duplicates: number;
  errors: number;
  transactions: Transaction[];
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
