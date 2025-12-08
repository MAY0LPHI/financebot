import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string; twoFactorToken?: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  enable2FA: () => api.post('/auth/2fa/enable'),
  verify2FA: (token: string) => api.post('/auth/2fa/verify', { token }),
  disable2FA: () => api.post('/auth/2fa/disable'),
};

// Accounts API
export const accountsApi = {
  getAll: () => api.get('/accounts'),
  getOne: (id: string) => api.get(`/accounts/${id}`),
  create: (data: any) => api.post('/accounts', data),
  update: (id: string, data: any) => api.patch(`/accounts/${id}`, data),
  delete: (id: string) => api.delete(`/accounts/${id}`),
};

// Transactions API
export const transactionsApi = {
  getAll: (params?: any) => api.get('/transactions', { params }),
  getOne: (id: string) => api.get(`/transactions/${id}`),
  create: (data: any) => api.post('/transactions', data),
  update: (id: string, data: any) => api.patch(`/transactions/${id}`, data),
  delete: (id: string) => api.delete(`/transactions/${id}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.patch(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Budgets API
export const budgetsApi = {
  getAll: () => api.get('/budgets'),
  create: (data: any) => api.post('/budgets', data),
  update: (id: string, data: any) => api.patch(`/budgets/${id}`, data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
};

// Goals API
export const goalsApi = {
  getAll: () => api.get('/goals'),
  create: (data: any) => api.post('/goals', data),
  update: (id: string, data: any) => api.patch(`/goals/${id}`, data),
  delete: (id: string) => api.delete(`/goals/${id}`),
};

// Reports API
export const reportsApi = {
  getCashFlow: (dateFrom: string, dateTo: string) =>
    api.get('/reports/cash-flow', { params: { dateFrom, dateTo } }),
  getExpensesByCategory: (dateFrom: string, dateTo: string) =>
    api.get('/reports/expenses-by-category', { params: { dateFrom, dateTo } }),
  getBalanceByAccount: () => api.get('/reports/balance-by-account'),
};

// Chat API
export const chatApi = {
  sendMessage: (message: string, sessionId?: string) =>
    api.post('/chat', { message, sessionId }),
};

// Admin API
export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: { name?: string; email?: string; role?: string }) =>
    api.patch(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  
  getSettings: () => api.get('/admin/settings'),
  getSetting: (key: string) => api.get(`/admin/settings/${key}`),
  upsertSetting: (key: string, data: { value: string; description?: string }) =>
    api.put(`/admin/settings/${key}`, data),
  createSetting: (data: { key: string; value: string; description?: string }) =>
    api.post('/admin/settings', data),
  deleteSetting: (key: string) => api.delete(`/admin/settings/${key}`),
  
  getAuditLogs: (params?: { action?: string; userId?: string; startDate?: string; endDate?: string; entity?: string }) =>
    api.get('/admin/audit-logs', { params }),
  
  getWhatsAppSessions: () => api.get('/admin/whatsapp/sessions'),
  getWhatsAppContacts: () => api.get('/admin/whatsapp/contacts'),
};

// WhatsApp API
export const whatsappApi = {
  initSession: (sessionName: string) => api.post('/whatsapp/init', { sessionName }),
  getSessions: () => api.get('/whatsapp/sessions'),
  getStatus: (sessionName: string) => api.get(`/whatsapp/status/${sessionName}`),
  getQrCode: (sessionName: string) => api.get(`/whatsapp/qr/${sessionName}`),
  requestPairingCode: (sessionName: string, phoneNumber: string) =>
    api.post(`/whatsapp/pair/${sessionName}`, { phoneNumber }),
  disconnect: (sessionName: string) => api.post(`/whatsapp/disconnect/${sessionName}`),
  deleteSession: (sessionName: string) => api.delete(`/whatsapp/session/${sessionName}`),
  sendMessage: (sessionName: string, phoneNumber: string, message: string) =>
    api.post(`/whatsapp/send/${sessionName}`, { phoneNumber, message }),
};
