// src/lib/apiService.ts

import type {
    Usuario, Feedback, PDI, AuthResponse, AdminDashboardData,
    CreateUserFormData, UpdateUserFormData,
    CreateFeedbackFormData,
    CreatePDIFormData, UpdatePDIFormData
} from './types';

// 1. Use uma variável de ambiente para a URL base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api';

const getAuthHeaders = (): HeadersInit => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (typeof window !== 'undefined') {
        const token = sessionStorage.getItem('authToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return headers;
};

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({
            message: `Erro na API: ${response.status} ${response.statusText}`
        }));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || 'Ocorreu um erro desconhecido na API.');
    }
    return response.status === 204 ? null as T : response.json();
}

// ========================================================
// API CLIENT GENÉRICO COM SINTAXE CORRIGIDA
// ========================================================
const apiClient = {
    async get<R>(endpoint: string): Promise<R> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse<R>(response);
    },
    async post<T, R>(endpoint: string, body: T): Promise<R> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
        });
        return handleResponse<R>(response);
    },
    async put<T, R>(endpoint: string, body: T): Promise<R> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
        });
        return handleResponse<R>(response);
    },
    async delete<R>(endpoint: string): Promise<R> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return handleResponse<R>(response);
    },
};

// ========================================================
// SERVIÇOS EXPORTÁVEIS
// ========================================================

export const authService = {
    login: (credentials: { email: string; senha: string }): Promise<AuthResponse> => {
        // Pega a URL base do ambiente (ex: http://localhost:8081/api)
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';

        // Constroi a URL de login SEM o prefixo /api
        // Ex: "http://localhost:8081/api".replace('/api', '') -> "http://localhost:8081"
        // Resultado final: "http://localhost:8081/auth/login"
        const loginUrl = baseUrl.replace('/api', '') + '/auth/login';
        
        // Faz a chamada diretamente com fetch para usar a URL customizada
        return fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        }).then(response => handleResponse<AuthResponse>(response)); // Reutiliza nosso tratador de resposta
    },
    // ... outros métodos de auth se houver ...
};


export const userService = {
    getAll: (): Promise<Usuario[]> => apiClient.get<Usuario[]>('/usuarios'),
    getById: (id: number): Promise<Usuario> => apiClient.get<Usuario>(`/usuarios/${id}`),
    create: (data: CreateUserFormData): Promise<Usuario> => apiClient.post('/usuarios', data),
    update: (id: number, data: UpdateUserFormData): Promise<Usuario> => apiClient.put(`/usuarios/${id}`, data),
    delete: (id: number): Promise<void> => apiClient.delete<void>(`/usuarios/${id}`),
};

export const pdiService = {
    getAll: (filters?: { colaboradorId?: number }): Promise<PDI[]> => {
        // Lógica corrigida aqui
        let query = '';
        if (filters) {
            const cleanFilters: Record<string, string> = {};
            // Adiciona ao objeto apenas os filtros que não são nulos/undefined
            if (filters.colaboradorId) {
                cleanFilters.colaboradorId = String(filters.colaboradorId);
            }
            // Constrói a query string
            const params = new URLSearchParams(cleanFilters).toString();
            if (params) {
                query = `?${params}`;
            }
        }
        return apiClient.get<PDI[]>(`/pdis${query}`);
    },
    getById: (id: number): Promise<PDI> => apiClient.get<PDI>(`/pdis/${id}`),
    create: (data: CreatePDIFormData): Promise<PDI> => apiClient.post('/pdis', data),
    update: (id: number, data: UpdatePDIFormData): Promise<PDI> => apiClient.put(`/pdis/${id}`, data),
};

// ... adicione feedbackService e dashboardService da mesma forma

export const dashboardService = {
    getAdminDashboard: (): Promise<AdminDashboardData> => {
        return apiClient.get<AdminDashboardData>('/dashboard/admin');
    }
};

export const feedbackService = {
    getAll: (filters?: { destinatarioId?: number; autorId?: number }): Promise<Feedback[]> => {
 let query = '';
        if (filters) {
            const cleanFilters: Record<string, string> = {};
            // Adiciona ao objeto apenas os filtros que não são nulos/undefined
            if (filters.destinatarioId) {
                cleanFilters.destinatarioId = String(filters.destinatarioId);
            }
            if (filters.autorId) {
                cleanFilters.autorId = String(filters.autorId);
            }
            // Constrói a query string
            const params = new URLSearchParams(cleanFilters).toString();
            if (params) {
                query = `?${params}`;
            }
        }
        return apiClient.get<Feedback[]>(`/feedbacks${query}`);
    },
    create: (data: CreateFeedbackFormData): Promise<Feedback> => {
        return apiClient.post('/feedbacks', data);
    },
};