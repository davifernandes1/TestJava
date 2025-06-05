// src/lib/apiService.ts
import {
    User, Feedback, PDI,
    AuthResponseData,
    CreateUserFormData, UpdateUserFormData,
    CreateFeedbackFormData,
    CreatePDIFormData, UpdatePDIFormData,
    ApiClient
} from './types'; // Certifique-se que este caminho está correto

const API_BASE_URL = 'http://localhost:8081'; // Porta do seu backend Spring Boot

// Função auxiliar para adicionar o token de autorização aos headers
const getAuthHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    // Verifica se está no ambiente do navegador antes de acessar localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// Função auxiliar para lidar com respostas e erros da API
async function handleResponse<T>(response: Response): Promise<{ data: T }> {
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: `Erro HTTP: ${response.status} ${response.statusText}` };
        }
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || errorData.error || `Erro na requisição: ${response.status}`);
    }
    if (response.status === 204) { // No Content
        return { data: {} as T };
    }
    const data = await response.json();
    return { data };
}

// =============================================
// DEFINIÇÃO DO API CLIENT CORRIGIDA
// =============================================
export const apiClient: ApiClient = {
    get: async <R = any>(url: string, params?: Record<string, any>): Promise<{ data: R }> => {
        const queryParams = params ? new URLSearchParams(params).toString() : '';
        const fullUrl = `${API_BASE_URL}${url}${queryParams ? `?${queryParams}` : ''}`;
        console.log(`API GET: ${fullUrl}`);
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse<R>(response);
    },

    post: async <T = any, R = any>(url: string, body?: T): Promise<{ data: R }> => {
        const fullUrl = `${API_BASE_URL}${url}`;
        console.log(`API POST: ${fullUrl}`, body);
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
        });
        return handleResponse<R>(response);
    },

    put: async <T = any, R = any>(url: string, body?: T): Promise<{ data: R }> => {
        const fullUrl = `${API_BASE_URL}${url}`;
        console.log(`API PUT: ${fullUrl}`, body);
        const response = await fetch(fullUrl, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
        });
        return handleResponse<R>(response);
    },

    delete: async <R = any>(url: string): Promise<{ data: R }> => {
        const fullUrl = `${API_BASE_URL}${url}`;
        console.log(`API DELETE: ${fullUrl}`);
        const response = await fetch(fullUrl, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return handleResponse<R>(response);
    },
};
// =============================================
// FIM DA DEFINIÇÃO DO API CLIENT CORRIGIDA
// =============================================


// =============================================
// SERVIÇOS DE AUTENTICAÇÃO
// =============================================
export const loginUser = async (credentials: { email: string, senha: string }): Promise<{ data: AuthResponseData }> => {
    return apiClient.post<typeof credentials, AuthResponseData>('/auth/login', credentials);
};

export const registerUserApi = async (userData: CreateUserFormData): Promise<{ data: User }> => {
    return apiClient.post<CreateUserFormData, User>('/auth/registrar', userData);
};

// =============================================
// SERVIÇOS DE USUÁRIO (CRUD)
// =============================================
export const fetchUsersApi = async (): Promise<{ data: User[] }> => {
    return apiClient.get<User[]>('/api/usuarios');
};

export const fetchUserByIdApi = async (userId: number): Promise<{ data: User }> => {
    return apiClient.get<User>(`/api/usuarios/${userId}`);
};

export const createUserApi = async (userData: CreateUserFormData): Promise<{ data: User }> => {
    return apiClient.post<CreateUserFormData, User>('/api/usuarios', userData);
};

export const updateUserApi = async (userId: number, userData: UpdateUserFormData): Promise<{ data: User }> => {
    return apiClient.put<UpdateUserFormData, User>(`/api/usuarios/${userId}`, userData);
};

export const deleteUserApi = async (userId: number): Promise<{ data: any }> => {
    return apiClient.delete(`/api/usuarios/${userId}`);
};

// =============================================
// SERVIÇOS DE FEEDBACK
// =============================================
export const fetchFeedbacksApi = async (filters?: { destinatarioId?: number, autorId?: number }): Promise<{ data: Feedback[] }> => {
    if (filters?.destinatarioId) {
        return apiClient.get<Feedback[]>(`/api/feedbacks/destinatario/${filters.destinatarioId}`);
    }
    return apiClient.get<Feedback[]>('/api/feedbacks');
};

export const createFeedbackApi = async (feedbackData: CreateFeedbackFormData): Promise<{ data: Feedback }> => {
    return apiClient.post<CreateFeedbackFormData, Feedback>('/api/feedbacks', feedbackData);
};

// =============================================
// SERVIÇOS DE PDI
// =============================================
export const fetchPDIsApi = async (filters?: { colaboradorId?: number }): Promise<{ data: PDI[] }> => {
    if (filters?.colaboradorId) {
        return apiClient.get<PDI[]>(`/api/pdis/colaborador/${filters.colaboradorId}`);
    }
    return apiClient.get<PDI[]>('/api/pdis');
};

export const fetchPDIByIdApi = async (pdiId: number): Promise<{ data: PDI }> => {
    return apiClient.get<PDI>(`/api/pdis/${pdiId}`);
};

export const createPDIApi = async (pdiData: CreatePDIFormData): Promise<{ data: PDI }> => {
    return apiClient.post<CreatePDIFormData, PDI>('/api/pdis', pdiData);
};

export const updatePDIApi = async (pdiId: number, pdiData: UpdatePDIFormData): Promise<{ data: PDI }> => {
    return apiClient.put<UpdatePDIFormData, PDI>(`/api/pdis/${pdiId}`, pdiData);
};
