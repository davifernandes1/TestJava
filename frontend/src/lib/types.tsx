// src/lib/types.ts

// =============================================
// ENUMERAÇÕES (correspondendo ao Backend)
// =============================================
export type UserRole = 'ADMIN' | 'GESTOR' | 'COLABORADOR';

export type PDIStatus = 'PLANEJADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO' | 'ATRASADO';

// =============================================
// INTERFACES DE DADOS PRINCIPAIS (DTOs/Entidades)
// =============================================

// Define os tipos de dados que vêm da sua API Java

export interface Role {
  id: number;
  name: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargo?: string;
  departamento?: string;
  status: 'ATIVO' | 'INATIVO';
  roles: string[];
}

export interface MetaPDI {
    id: number;
    descricao: string;
    status: 'Pendente' | 'Em Andamento' | 'Concluído';
}

export interface PDI {
  id: number;
  titulo: string;
  descricaoGeral: string;
  status: string;
  dataInicio: string;
  dataPrazo: string;
  colaboradorId: number;
  gestorId: number;
  metas: MetaPDI[];
}

export interface Feedback {
  id: number;
  feedbackTexto: string;
  tipo: string;
  dataEnvio: string;
  autorNome: string;
  destinatarioNome: string;
}


// ===================================
// TIPOS DE API E DTOs
// ===================================

export interface AuthResponse {
  token: string;
  id: number;
  nome: string;
  email: string;
  roles: Role[]; // A resposta contém um array de objetos Role
}
export interface AdminDashboardData {
  totalUsuarios: number;
  totalColaboradores: number;
  totalGestores: number;
  totalAdmins: number;
  usuariosPorPerfil: Record<string, number>;
  totalPDIs: number;
  pdisAtivos: number;
  pdisConcluidos: number;
  pdisAtrasados: number;
  pdisPorStatus: Record<string, number>;
  feedbacksRecentes: Feedback[]; // Supondo que o tipo Feedback já esteja definido
}

// ===================================
// TIPOS PARA FORMULÁRIOS (CRIAÇÃO/EDIÇÃO)
// ===================================

export type CreateUserFormData = Omit<Usuario, 'id' | 'roles' | 'status'> & {
    senha?: string;
    roleIds: number[];
    status: 'ATIVO' | 'INATIVO';
};
export type UpdateUserFormData = Partial<CreateUserFormData>;

export interface CreateFeedbackFormData {
  destinatarioId: number | '';
  feedbackTexto: string;
  tipo: string;
  pdiId?: number;
};

// --- TIPOS DE PDI ADICIONADOS ---
export type CreatePDIFormData = Omit<PDI, 'id' | 'metas' | 'colaboradorId' | 'gestorId'> & {
    colaboradorId: number | '';
    gestorId: number | '';
    metas: Array<Omit<MetaPDI, 'id'>>;
};
export interface NavItemConfig {
  href: string;
  label: string;
  icon: React.ElementType; // Permite passar um componente de ícone
  roles: Array<'ROLE_ADMIN' | 'ROLE_MANAGER' | 'ROLE_COLLABORATOR'>;
}
export type UpdatePDIFormData = Partial<CreatePDIFormData>;
