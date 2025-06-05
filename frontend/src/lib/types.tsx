// src/lib/types.ts

// =============================================
// ENUMERAÇÕES (correspondendo ao Backend)
// =============================================
export type UserRole = 'ADMIN' | 'GESTOR' | 'COLABORADOR';

export type PDIStatus = 'PLANEJADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO' | 'ATRASADO';

// =============================================
// INTERFACES DE DADOS PRINCIPAIS (DTOs/Entidades)
// =============================================

export interface User {
    id: number;
    nome: string;
    email: string;
    role: UserRole;
    cargo?: string;
    area?: string;
    // Adicionar 'status' se o backend enviar e for usado na listagem
    status?: 'Ativo' | 'Inativo'; // Exemplo, ajuste conforme o backend
}

export interface Feedback {
    id: number;
    autorId: number;
    autorNome?: string;
    destinatarioId: number;
    destinatarioNome?: string;
    feedbackTextual: string;
    habilidadesUtilizadas?: string;
    dificuldadesEncontradas?: string;
    interessesAprendizado?: string;
    dataEnvio: string; // Formato ISO: "AAAA-MM-DDTHH:mm:ss"
    sentimentoAnalisado?: string;
    categoriaDificuldadeAnalisada?: string;
    metaSugeridaIA?: string;
    cursoRecomendadoIA?: string;
    mentorIndicadoIA?: string;
}

export interface MetaPDI {
    id?: number; // ID é opcional na criação
    descricaoMeta: string;
    acoesNecessarias?: string;
    prazo?: string; // Formato ISO: "AAAA-MM-DD"
    concluida: boolean;
    recursosNecessarios?: string;
    feedbackMeta?: string;
}

export interface PDI {
    id: number;
    colaboradorId: number;
    colaboradorNome?: string;
    gestorId?: number; // Adicionando gestorId se for relevante para o PDI
    gestorNome?: string; // Adicionando gestorNome
    titulo: string;
    descricaoGeral?: string;
    dataInicio?: string; // Formato ISO: "AAAA-MM-DD"
    dataConclusaoPrevista?: string; // Formato ISO: "AAAA-MM-DD"
    dataConclusaoReal?: string | null;
    status: PDIStatus;
    metas: MetaPDI[];
}

// =============================================
// TIPOS PARA AUTENTICAÇÃO E API
// =============================================

// Para o payload de resposta do login do backend
export interface AuthResponseData {
    token: string;
    id: number;
    email: string;
    nome: string;
    role: UserRole;
    // Inclua outros campos que o backend retorna no login, se houver
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (credentials: { email: string, senha: string }) => Promise<void>;
    logout: () => void;
    loading: boolean;
    isAuthenticated: boolean;
}

export interface ApiClient {
    get: <R = any>(url: string, params?: Record<string, any>) => Promise<{ data: R }>;
    post: <T = any, R = any>(url: string, data?: T) => Promise<{ data: R }>;
    put: <T = any, R = any>(url: string, data?: T) => Promise<{ data: R }>;
    delete: <R = any>(url: string) => Promise<{ data: R }>;
}

// =============================================
// TIPOS PARA FORMULÁRIOS (Payloads de Criação/Edição)
// =============================================

export interface CreateUserFormData {
    nome: string;
    email: string;
    senha?: string; // Obrigatório na criação, opcional na edição
    role: UserRole;
    cargo: string;
    area: string;
    status?: 'Ativo' | 'Inativo'; // Se for gerenciado pelo front-end na criação/edição
}
// Para edição, podemos usar Partial<CreateUserFormData> ou um tipo específico
export type UpdateUserFormData = Partial<Omit<CreateUserFormData, 'email' | 'role'>> & { email?: string, role?: UserRole, id: number };


export interface CreateFeedbackFormData {
    destinatarioId: number; // ID do usuário que recebe o feedback
    // autorId será inferido no backend a partir do usuário logado, ou definido por Admin/Gestor
    autorId?: number; // Opcional, para Admin/Gestor especificarem
    feedbackTextual: string;
    habilidadesUtilizadas?: string;
    dificuldadesEncontradas?: string;
    interessesAprendizado?: string;
}

export interface CreatePDIFormData {
    colaboradorId: number;
    gestorId?: number; // ID do gestor responsável (se aplicável)
    titulo: string;
    descricaoGeral?: string;
    objetivos?: Array<{ descricao: string }>; // Simplificado para a imagem do modal
    dataInicio: string; // "AAAA-MM-DD"
    dataConclusaoPrevista: string; // "AAAA-MM-DD"
    status: PDIStatus;
    metas?: Array<Omit<MetaPDI, 'id' | 'concluida'>>; // Para novas metas
}
export type UpdatePDIFormData = Partial<CreatePDIFormData> & { id: number, metas?: MetaPDI[] };


// =============================================
// TIPOS PARA COMPONENTES DE UI (Exemplos)
// =============================================

export interface SummaryCardItem {
    title: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
    roles: UserRole[];
}

export interface NavItemConfig {
    name: string;
    href: string;
    icon: React.ElementType;
    roles: UserRole[];
}

// Adicione outros tipos conforme necessário
