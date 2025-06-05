// src/app/(dashboard)/usuarios/page.tsx
'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { apiClient, fetchUsersApi, createUserApi, updateUserApi, deleteUserApi } from '@/lib/apiService';
import { User, UserRole, CreateUserFormData, UpdateUserFormData } from '@/lib/types';
import { PlusCircle, Search, Users, AlertTriangle, Edit3, Trash2, UserCircle as UserIcon, ShieldCheck, Briefcase, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';

// --- Componente UserFormModal (Modal para Adicionar/Editar Usuário) ---
interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: CreateUserFormData | UpdateUserFormData) => Promise<void>;
    editingUser: User | null;
    isLoading: boolean;
}

function UserFormModal({ isOpen, onClose, onSave, editingUser, isLoading: isSaving }: UserFormModalProps) {
    const initialFormData: CreateUserFormData = {
        nome: '', email: '', senha: '', role: 'COLABORADOR', cargo: '', area: '', status: 'Ativo'
    };
    const [formData, setFormData] = useState<CreateUserFormData | UpdateUserFormData>(initialFormData);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (editingUser) {
            setFormData({
                id: editingUser.id, // Necessário para UpdateUserFormData
                nome: editingUser.nome,
                email: editingUser.email, // Email geralmente não é editável ou requer cuidado especial
                // senha: '', // Não preenche a senha para edição
                role: editingUser.role,
                cargo: editingUser.cargo || '',
                area: editingUser.area || '',
                status: editingUser.status || 'Ativo',
            });
        } else {
            setFormData(initialFormData);
        }
        setFormError('');
    }, [editingUser, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError('');
        if (!editingUser && (!formData.senha || formData.senha.length < 6)) {
            setFormError("A senha é obrigatória para novos usuários e deve ter no mínimo 6 caracteres.");
            return;
        }
        if (editingUser && formData.senha && formData.senha.length > 0 && formData.senha.length < 6) {
            setFormError("A nova senha deve ter no mínimo 6 caracteres.");
            return;
        }
        
        // Prepara os dados para salvar, removendo a senha se estiver vazia na edição
        const dataToSave = { ...formData };
        if (editingUser && (dataToSave.senha === '' || dataToSave.senha === undefined)) {
            delete dataToSave.senha;
        }

        await onSave(dataToSave);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all scale-100 opacity-100 animate-fadeInUp">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-slate-800">
                        {editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors" aria-label="Fechar modal">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Campos do formulário */}
                    <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-slate-700">Nome Completo *</label>
                        <input type="text" name="nome" id="nome" value={formData.nome} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">E-mail *</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="senha" className="block text-sm font-medium text-slate-700">
                            Senha {editingUser ? '(Deixe em branco para não alterar)' : '*'}
                        </label>
                        <input type="password" name="senha" id="senha" value={formData.senha || ''} onChange={handleChange} required={!editingUser} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="cargo" className="block text-sm font-medium text-slate-700">Cargo</label>
                        <input type="text" name="cargo" id="cargo" value={formData.cargo} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="area" className="block text-sm font-medium text-slate-700">Departamento/Área</label>
                        <input type="text" name="area" id="area" value={formData.area} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-slate-700">Perfil *</label>
                        <select name="role" id="role" value={formData.role} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option value="COLABORADOR">Colaborador</option>
                            <option value="GESTOR">Gestor</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status *</label>
                        <select name="status" id="status" value={formData.status || 'Ativo'} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                        </select>
                    </div>

                    {formError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md border border-red-200">{formError}</p>}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors disabled:opacity-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors">
                            {isSaving ? 'Salvando...' : (editingUser ? 'Salvar Alterações' : 'Criar Usuário')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


// --- Componente UserTable (Tabela de Usuários) ---
interface UserTableProps {
    users: User[];
    onEdit: (user: User) => void;
    onDelete: (userId: number) => void;
    isLoading: boolean;
}

const RoleIconDisplay = ({ role }: { role: UserRole }) => {
    switch (role) {
        case 'ADMIN': return <ShieldCheck size={18} className="text-red-600" title="Admin"/>;
        case 'GESTOR': return <Briefcase size={18} className="text-blue-600" title="Gestor"/>;
        case 'COLABORADOR': return <UserIcon size={18} className="text-green-600" title="Colaborador"/>;
        default: return null;
    }
};

function UserTable({ users, onEdit, onDelete, isLoading }: UserTableProps) {
    if (isLoading && users.length === 0) {
        return (
            <div className="bg-white p-10 rounded-xl shadow-lg text-center text-slate-500">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500 mx-auto mb-3"></div>
                Carregando usuários...
            </div>
        );
    }
    if (!isLoading && users.length === 0) {
        return (
            <div className="bg-white p-10 rounded-xl shadow-lg text-center text-slate-500">
                <Users size={48} className="mx-auto mb-4 text-slate-400" />
                <p>Nenhum usuário encontrado com os filtros aplicados.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <table className="w-full min-w-[768px] text-sm text-left text-slate-700">
                <thead className="text-xs text-slate-700 uppercase bg-slate-100 border-b border-slate-200">
                    <tr>
                        <th scope="col" className="px-6 py-3">Nome</th>
                        <th scope="col" className="px-6 py-3">Email</th>
                        <th scope="col" className="px-6 py-3">Cargo</th>
                        <th scope="col" className="px-6 py-3">Departamento</th>
                        <th scope="col" className="px-6 py-3 text-center">Perfil</th>
                        <th scope="col" className="px-6 py-3 text-center">Status</th>
                        <th scope="col" className="px-6 py-3 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="bg-white border-b border-slate-200 hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{user.nome}</td>
                            <td className="px-6 py-4">{user.email}</td>
                            <td className="px-6 py-4">{user.cargo || '-'}</td>
                            <td className="px-6 py-4">{user.area || '-'}</td>
                            <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                                    ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                      user.role === 'GESTOR' ? 'bg-blue-100 text-blue-800' :
                                      'bg-green-100 text-green-800'}`}>
                                    <RoleIconDisplay role={user.role} /> <span className="ml-1.5">{user.role}</span>
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    user.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {user.status || 'Ativo'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center space-x-1">
                                <button onClick={() => onEdit(user)} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors" title="Editar Usuário"><Edit3 size={18} /></button>
                                <button onClick={() => onDelete(user.id)} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors" title="Excluir Usuário"><Trash2 size={18} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


// --- Página Principal de Gerenciamento de Usuários ---
export default function UsuariosPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isSavingUser, setIsSavingUser] = useState(false);

    const [filterRole, setFilterRole] = useState<UserRole | 'TODOS'>('TODOS');
    // const [filterDepartment, setFilterDepartment] = useState<string>('TODOS'); // Adicionar se necessário
    // const [filterStatus, setFilterStatus] = useState<'TODOS' | 'Ativo' | 'Inativo'>('TODOS'); // Adicionar se necessário

    const fetchUsersCallback = useCallback(async () => {
        setIsLoading(true);
        setPageError(null);
        try {
            const response = await fetchUsersApi();
            setUsers(response.data);
        } catch (err: any) {
            setPageError(err.message || 'Falha ao carregar usuários.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (currentUser?.role === 'ADMIN') {
            fetchUsersCallback();
        } else {
            setIsLoading(false);
            setPageError("Acesso negado. Você não tem permissão para gerenciar usuários.");
        }
    }, [currentUser, fetchUsersCallback]);

    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (
            user.nome.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            (user.cargo && user.cargo.toLowerCase().includes(searchLower)) ||
            (user.area && user.area.toLowerCase().includes(searchLower))
        );
        const matchesRole = filterRole === 'TODOS' || user.role === filterRole;
        // const matchesStatus = filterStatus === 'TODOS' || (user.status || 'Ativo') === filterStatus;
        return matchesSearch && matchesRole; // && matchesStatus;
    });

    const openAddModal = () => { setEditingUser(null); setIsModalOpen(true); };
    const openEditModal = (userToEdit: User) => { setEditingUser(userToEdit); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setEditingUser(null); };

    const handleSaveUser = async (formData: CreateUserFormData | UpdateUserFormData) => {
        setIsSavingUser(true);
        setPageError(null); // Limpa erros anteriores da página
        try {
            if ('id' in formData && formData.id) {
                await updateUserApi(formData.id, formData as UpdateUserFormData);
            } else {
                await createUserApi(formData as CreateUserFormData);
            }
            closeModal();
            fetchUsersCallback();
        } catch (err: any) {
            console.error("Erro ao salvar usuário (página):", err);
            // O erro específico do formulário deve ser tratado dentro do UserFormModal
            // Aqui podemos mostrar um erro mais genérico na página se necessário,
            // mas o modal já tem seu próprio tratamento de erro.
            setPageError(err.message || 'Falha ao salvar usuário.');
            throw err; // Re-lança para que o modal possa pegar e exibir o erro
        } finally {
            setIsSavingUser(false);
        }
    };
    
    const handleDeleteUser = async (userId: number) => {
        if (window.confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) {
            setIsLoading(true); // Pode usar um estado de loading específico para delete
            setPageError(null);
            try {
                await deleteUserApi(userId);
                fetchUsersCallback();
            } catch (err: any) {
                setPageError(err.message || 'Falha ao excluir usuário.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    if (currentUser?.role !== 'ADMIN' && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-10 bg-white rounded-lg shadow-xl animate-fadeIn">
                <AlertTriangle size={60} className="text-red-500 mb-6" />
                <h2 className="text-2xl font-semibold text-slate-700 mb-2">Acesso Negado</h2>
                <p className="text-slate-600 text-center">Você não possui as permissões necessárias para acessar esta página.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeInUp">
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-semibold text-slate-700 flex items-center">
                        <Users className="mr-3 text-blue-600" size={28}/> Gerenciamento de Usuários
                    </h2>
                    <button onClick={openAddModal} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                        <PlusCircle size={20} className="mr-2" /> Adicionar Usuário
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 items-end">
                    <div className="relative">
                        <label htmlFor="searchUser" className="block text-sm font-medium text-slate-700 mb-1">Buscar</label>
                        <input id="searchUser" type="text" placeholder="Nome, email, cargo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"/>
                        <Search size={20} className="absolute left-3 bottom-3.5 text-slate-400" />
                    </div>
                    <div>
                        <label htmlFor="filterRole" className="block text-sm font-medium text-slate-700 mb-1">Filtrar por Perfil</label>
                        <select id="filterRole" value={filterRole} onChange={(e) => setFilterRole(e.target.value as UserRole | 'TODOS')} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                            <option value="TODOS">Todos os Perfis</option>
                            <option value="ADMIN">Admin</option>
                            <option value="GESTOR">Gestor</option>
                            <option value="COLABORADOR">Colaborador</option>
                        </select>
                    </div>
                    {/* Adicionar mais filtros aqui (Departamento, Status) */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                 <div className="bg-white p-5 rounded-xl shadow-lg text-center">
                    <p className="text-sm font-medium text-slate-500">Total de Usuários</p>
                    {isLoading ? <div className="h-8 w-10 mx-auto mt-1 bg-gray-200 rounded animate-pulse"></div> : <p className="text-3xl font-bold text-blue-600">{filteredUsers.length}</p>}
                </div>
                 <div className="bg-white p-5 rounded-xl shadow-lg text-center">
                    <p className="text-sm font-medium text-slate-500">Colaboradores</p>
                    {isLoading ? <div className="h-8 w-10 mx-auto mt-1 bg-gray-200 rounded animate-pulse"></div> : <p className="text-3xl font-bold text-green-600">{users.filter(u => u.role === 'COLABORADOR').length}</p>}
                </div>
                 <div className="bg-white p-5 rounded-xl shadow-lg text-center">
                    <p className="text-sm font-medium text-slate-500">Gestores</p>
                    {isLoading ? <div className="h-8 w-10 mx-auto mt-1 bg-gray-200 rounded animate-pulse"></div> : <p className="text-3xl font-bold text-purple-600">{users.filter(u => u.role === 'GESTOR').length}</p>}
                </div>
            </div>
            
            {pageError && !isModalOpen && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md mb-6" role="alert">
                    <p className="font-bold">Erro ao carregar dados</p>
                    <p>{pageError}</p>
                </div>
            )}

            <UserTable users={filteredUsers} onEdit={openEditModal} onDelete={handleDeleteUser} isLoading={isLoading} />

            {isModalOpen && (
                <UserFormModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSaveUser} editingUser={editingUser} isLoading={isSavingUser} />
            )}
        </div>
    );
}
