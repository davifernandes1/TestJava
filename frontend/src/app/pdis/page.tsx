// src/app/(dashboard)/pdis/page.tsx
'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { fetchPDIsApi, createPDIApi, fetchUsersApi, updatePDIApi, fetchPDIByIdApi } from '@/lib/apiService';
import { PDI, User, CreatePDIFormData, MetaPDI, PDIStatus, UpdatePDIFormData, UserRole } from '@/lib/types';
import { FileText, PlusCircle, Edit3, Trash2, CalendarDays, UserCircle as UserIcon, Briefcase, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- Componente PDIFormModal (Modal para Novo/Editar PDI) ---
interface PDIFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: CreatePDIFormData | UpdatePDIFormData) => Promise<void>;
    isLoading: boolean;
    editingPDI: PDI | null;
    currentUser: User | null;
    allUsers: User[]; // Para selecionar colaborador e gestor
}

function PDIFormModal({ isOpen, onClose, onSave, isLoading, editingPDI, currentUser, allUsers }: PDIFormModalProps) {
    const initialMeta: Omit<MetaPDI, 'id' | 'concluida'> = { descricaoMeta: '', acoesNecessarias: '', prazo: '', recursosNecessarios: '', feedbackMeta: '' };
    const initialFormData: CreatePDIFormData = {
        colaboradorId: 0,
        gestorId: 0,
        titulo: '',
        descricaoGeral: '',
        objetivos: [{ descricao: '' }], // Para o campo "Objetivos" da imagem
        dataInicio: '',
        dataConclusaoPrevista: '',
        status: 'PLANEJADO',
        metas: [initialMeta]
    };

    const [formData, setFormData] = useState<CreatePDIFormData | UpdatePDIFormData>(initialFormData);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (editingPDI) {
                setFormData({
                    id: editingPDI.id,
                    colaboradorId: editingPDI.colaboradorId,
                    gestorId: editingPDI.gestorId || 0,
                    titulo: editingPDI.titulo,
                    descricaoGeral: editingPDI.descricaoGeral || '',
                    // O campo "Objetivos" da imagem parece ser uma simplificação da descrição ou de metas iniciais
                    // Se for para mapear para a descrição geral:
                    objetivos: editingPDI.descricaoGeral ? [{ descricao: editingPDI.descricaoGeral }] : [{ descricao: '' }],
                    dataInicio: editingPDI.dataInicio ? format(parseISO(editingPDI.dataInicio), 'yyyy-MM-dd') : '',
                    dataConclusaoPrevista: editingPDI.dataConclusaoPrevista ? format(parseISO(editingPDI.dataConclusaoPrevista), 'yyyy-MM-dd') : '',
                    status: editingPDI.status,
                    metas: editingPDI.metas.length > 0 ? editingPDI.metas.map(m => ({...m, prazo: m.prazo ? format(parseISO(m.prazo), 'yyyy-MM-dd') : ''})) : [initialMeta],
                });
            } else {
                // Se for criar e o usuário logado for COLABORADOR, pré-seleciona ele
                if (currentUser?.role === 'COLABORADOR') {
                    setFormData({...initialFormData, colaboradorId: currentUser.id });
                } else {
                    setFormData(initialFormData);
                }
            }
            setFormError('');
        }
    }, [isOpen, editingPDI, currentUser]);


    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'colaboradorId' || name === 'gestorId' ? parseInt(value, 10) : value }));
    };

    const handleObjetivoChange = (index: number, value: string) => {
        // Se "Objetivos" da imagem mapear para a descrição geral, atualize-a.
        // Ou, se for uma lista de objetivos simples, atualize o array.
        // Para simplificar, vamos assumir que o primeiro "Objetivo" da imagem é a descrição geral.
        setFormData(prev => ({ ...prev, descricaoGeral: value }));
    };
    
    const handleMetaChange = (index: number, field: keyof Omit<MetaPDI, 'id' | 'concluida'>, value: string) => {
        setFormData(prev => {
            const newMetas = [...(prev.metas || [])];
            if (newMetas[index]) {
                (newMetas[index] as any)[field] = value;
            }
            return { ...prev, metas: newMetas };
        });
    };

    const addMetaField = () => {
        setFormData(prev => ({ ...prev, metas: [...(prev.metas || []), initialMeta] }));
    };
    
    const removeMetaField = (index: number) => {
        setFormData(prev => ({ ...prev, metas: (prev.metas || []).filter((_, i) => i !== index) }));
    };


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError('');
        if (formData.colaboradorId === 0) { setFormError("Selecione o colaborador."); return; }
        if (!formData.titulo.trim()) { setFormError("O título do PDI é obrigatório."); return; }
        if (!formData.dataInicio || !formData.dataConclusaoPrevista) { setFormError("Datas de início e término são obrigatórias."); return; }
        
        // Se o campo "Objetivos" da imagem for a descrição geral:
        const dataToSave = {
            ...formData,
            // A descriçãoGeral já está sendo atualizada por handleObjetivoChange
        };
        await onSave(dataToSave);
    };
    
    const colaboradorOptions = allUsers.filter(u => u.role === 'COLABORADOR' || u.role === 'GESTOR' || u.role === 'ADMIN'); // Todos podem ter PDI
    const gestorOptions = allUsers.filter(u => u.role === 'GESTOR' || u.role === 'ADMIN');


    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-2xl animate-fadeInUp max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-slate-800">{editingPDI ? 'Editar PDI' : 'Novo PDI'}</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="titulo" className="block text-sm font-medium text-slate-700">Título do PDI *</label>
                        <input type="text" name="titulo" id="titulo" value={formData.titulo} onChange={handleChange} required className="mt-1 block w-full input-style" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="colaboradorId" className="block text-sm font-medium text-slate-700">Colaborador *</label>
                            <select name="colaboradorId" id="colaboradorId" value={formData.colaboradorId} onChange={handleChange} required className="mt-1 block w-full input-style bg-white" disabled={editingPDI !== null || currentUser?.role === 'COLABORADOR'}>
                                <option value={0} disabled>Selecione...</option>
                                {colaboradorOptions.map(u => (<option key={u.id} value={u.id}>{u.nome}</option>))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="gestorId" className="block text-sm font-medium text-slate-700">Gestor Responsável</label>
                            <select name="gestorId" id="gestorId" value={formData.gestorId || 0} onChange={handleChange} className="mt-1 block w-full input-style bg-white">
                                <option value={0}>Selecione (Opcional)...</option>
                                {gestorOptions.map(u => (<option key={u.id} value={u.id}>{u.nome}</option>))}
                            </select>
                        </div>
                    </div>
                     <div> {/* Campo "Objetivos" da imagem, mapeado para descriçãoGeral */}
                        <label htmlFor="objetivoPrincipal" className="block text-sm font-medium text-slate-700">Descrição / Objetivo Principal</label>
                        <textarea 
                            name="objetivoPrincipal" 
                            id="objetivoPrincipal" 
                            value={formData.descricaoGeral || ''} 
                            onChange={(e) => handleObjetivoChange(0, e.target.value)} 
                            rows={3} 
                            className="mt-1 block w-full input-style"
                            placeholder="Descreva o objetivo principal ou a descrição geral do PDI"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="dataInicio" className="block text-sm font-medium text-slate-700">Data de Início *</label>
                            <input type="date" name="dataInicio" id="dataInicio" value={formData.dataInicio} onChange={handleChange} required className="mt-1 block w-full input-style" />
                        </div>
                        <div>
                            <label htmlFor="dataConclusaoPrevista" className="block text-sm font-medium text-slate-700">Término Previsto *</label>
                            <input type="date" name="dataConclusaoPrevista" id="dataConclusaoPrevista" value={formData.dataConclusaoPrevista} onChange={handleChange} required className="mt-1 block w-full input-style" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status *</label>
                        <select name="status" id="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full input-style bg-white">
                            {Object.values(PDIStatus).map(s => (<option key={s} value={s}>{s.replace('_', ' ')}</option>))}
                        </select>
                    </div>

                    {/* Seção de Metas Detalhadas (Opcional, ou simplificar para o campo "Objetivos" da imagem) */}
                    <fieldset className="border border-slate-300 p-4 rounded-md">
                        <legend className="text-sm font-medium text-slate-700 px-2">Metas Específicas</legend>
                        {(formData.metas || []).map((meta, index) => (
                            <div key={index} className="space-y-2 border-b border-slate-200 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                                <label htmlFor={`metaDescricao-${index}`} className="block text-xs font-medium text-slate-600">Meta {index + 1}</label>
                                <textarea id={`metaDescricao-${index}`} value={meta.descricaoMeta} onChange={(e) => handleMetaChange(index, 'descricaoMeta', e.target.value)} rows={2} className="w-full input-style text-sm" placeholder="Descrição da meta"/>
                                {/* Outros campos da meta (prazo, ações) podem ser adicionados aqui */}
                                { (formData.metas || []).length > 1 && 
                                    <button type="button" onClick={() => removeMetaField(index)} className="text-xs text-red-500 hover:text-red-700">Remover Meta</button>
                                }
                            </div>
                        ))}
                        <button type="button" onClick={addMetaField} className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center">
                            <PlusCircle size={16} className="mr-1"/> Adicionar Meta
                        </button>
                    </fieldset>


                    {formError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md border border-red-200">{formError}</p>}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm btn-secondary">Cancelar</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm btn-primary flex items-center disabled:opacity-70">
                            {isLoading ? 'Salvando...' : (editingPDI ? 'Salvar Alterações' : 'Criar PDI')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- Componente PDICard ---
interface PDICardProps {
    pdi: PDI;
    onEdit: (pdi: PDI) => void;
    onDelete: (pdiId: number) => void;
    currentUserRole: UserRole;
}

function PDICard({ pdi, onEdit, onDelete, currentUserRole }: PDICardProps) {
    const statusColors: Record<PDIStatus, string> = {
        PLANEJADO: 'bg-gray-200 text-gray-700',
        EM_ANDAMENTO: 'bg-blue-100 text-blue-700',
        CONCLUIDO: 'bg-green-100 text-green-700',
        CANCELADO: 'bg-red-100 text-red-700',
        ATRASADO: 'bg-yellow-100 text-yellow-700',
    };
    const statusIcons: Record<PDIStatus, React.ElementType> = {
        PLANEJADO: Clock,
        EM_ANDAMENTO: AlertTriangle, // Ou um ícone de "em progresso"
        CONCLUIDO: CheckCircle,
        CANCELADO: X,
        ATRASADO: AlertTriangle,
    };
    const StatusIcon = statusIcons[pdi.status] || Clock;

    return (
        <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 space-y-3">
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{pdi.titulo}</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center ${statusColors[pdi.status]}`}>
                    <StatusIcon size={14} className="mr-1.5"/>{pdi.status.replace('_', ' ')}
                </span>
            </div>
            <div>
                <p className="text-sm text-slate-600"><strong>Colaborador:</strong> {pdi.colaboradorNome || `ID ${pdi.colaboradorId}`}</p>
                {pdi.gestorNome && <p className="text-sm text-slate-600"><strong>Gestor:</strong> {pdi.gestorNome}</p>}
            </div>
            <div className="flex justify-between text-xs text-slate-500">
                <span className="flex items-center"><CalendarDays size={14} className="mr-1 text-slate-400"/> Início: {pdi.dataInicio ? format(parseISO(pdi.dataInicio), 'dd/MM/yyyy') : '-'}</span>
                <span className="flex items-center"><CalendarDays size={14} className="mr-1 text-slate-400"/> Término: {pdi.dataConclusaoPrevista ? format(parseISO(pdi.dataConclusaoPrevista), 'dd/MM/yyyy') : '-'}</span>
            </div>
            {pdi.descricaoGeral && <p className="text-sm text-slate-700 mt-2 line-clamp-2" title={pdi.descricaoGeral}><strong>Descrição:</strong> {pdi.descricaoGeral}</p>}
            
            {(currentUserRole === 'ADMIN' || currentUserRole === 'GESTOR') && (
                <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                    <button onClick={() => onEdit(pdi)} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors" title="Editar PDI"><Edit3 size={18}/></button>
                    <button onClick={() => onDelete(pdi.id)} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors" title="Excluir PDI"><Trash2 size={18}/></button>
                </div>
            )}
        </div>
    );
}


// --- Página Principal de PDIs ---
export default function PDIsPage() {
    const { user: currentUser } = useAuth();
    const [pdis, setPDIs] = useState<PDI[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPDI, setEditingPDI] = useState<PDI | null>(null);
    const [isSavingPDI, setIsSavingPDI] = useState(false);

    const fetchPageData = useCallback(async () => {
        if (!currentUser) return;
        setIsLoading(true);
        setPageError(null);
        try {
            let pdiData: PDI[] = [];
            if (currentUser.role === 'ADMIN' || currentUser.role === 'GESTOR') {
                // Admin e Gestor podem precisar de uma lista mais ampla ou filtrada de PDIs
                pdiData = (await fetchPDIsApi()).data; // Gestor pode precisar filtrar para sua equipe no backend
                const usersResponse = await fetchUsersApi(); // Para preencher selects no modal
                setAllUsers(usersResponse.data);
            } else if (currentUser.role === 'COLABORADOR') {
                pdiData = (await fetchPDIsApi({ colaboradorId: currentUser.id })).data;
                setAllUsers([currentUser]); // Colaborador só cria PDI para si (ou precisa de lógica para selecionar gestor)
            }
            setPDIs(pdiData);
        } catch (err: any) {
            setPageError(err.message || 'Falha ao carregar dados da página de PDIs.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

    const openAddModal = () => { setEditingPDI(null); setIsModalOpen(true); };
    const openEditModal = (pdiToEdit: PDI) => { setEditingPDI(pdiToEdit); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setEditingPDI(null); };

    const handleSavePDI = async (formData: CreatePDIFormData | UpdatePDIFormData) => {
        setIsSavingPDI(true);
        setPageError(null);
        try {
            if ('id' in formData && formData.id) { // Edição
                await updatePDIApi(formData.id, formData as UpdatePDIFormData);
            } else { // Criação
                await createPDIApi(formData as CreatePDIFormData);
            }
            closeModal();
            fetchPageData();
        } catch (err: any) {
            console.error("Erro ao salvar PDI (página):", err);
            setPageError(err.message || 'Falha ao salvar PDI.');
            throw err; // Permite que o modal trate o erro também
        } finally {
            setIsSavingPDI(false);
        }
    };

    const handleDeletePDI = async (pdiId: number) => {
        if (window.confirm("Tem certeza que deseja excluir este PDI?")) {
            // setIsLoading(true); // Usar um estado de loading específico se preferir
            setPageError(null);
            try {
                // await deletePDIApi(pdiId); // Implementar no apiService
                console.log("Deletar PDI ID:", pdiId); // Mock
                alert("Funcionalidade de exclusão de PDI não implementada no backend mockado.");
                fetchPageData();
            } catch (err: any) {
                setPageError(err.message || 'Falha ao excluir PDI.');
            } finally {
                // setIsLoading(false);
            }
        }
    };
    
    // Apenas Admin e Gestor podem criar PDIs para outros. Colaborador pode criar para si.
    const canCreatePDI = currentUser?.role === 'ADMIN' || currentUser?.role === 'GESTOR' || currentUser?.role === 'COLABORADOR';

    return (
        <div className="space-y-6 animate-fadeInUp">
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-semibold text-slate-700 flex items-center">
                        <FileText className="mr-3 text-blue-600" size={28}/> Gerenciamento de PDIs
                    </h2>
                    {canCreatePDI && (
                        <button onClick={openAddModal} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                            <PlusCircle size={20} className="mr-2" /> Novo PDI
                        </button>
                    )}
                </div>
                {/* Adicionar filtros aqui (Colaborador, Gestor, Status, Datas) */}
            </div>

            {isLoading && (
                <div className="flex justify-center items-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div><p className="ml-4 text-slate-600">Carregando PDIs...</p></div>
            )}
            {pageError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert"><p className="font-bold">Erro</p><p>{pageError}</p></div>
            )}

            {!isLoading && !pageError && pdis.length === 0 && (
                <div className="bg-white p-10 rounded-xl shadow-lg text-center text-slate-500">
                    <FileText size={48} className="mx-auto mb-4 text-slate-400" />
                    <p>Nenhum PDI encontrado.</p>
                    {canCreatePDI && <p className="mt-2 text-sm">Clique em "Novo PDI" para começar.</p>}
                </div>
            )}

            {!isLoading && !pageError && pdis.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pdis.map(pdi => (
                        <PDICard 
                            key={pdi.id} 
                            pdi={pdi} 
                            onEdit={openEditModal} 
                            onDelete={handleDeletePDI}
                            currentUserRole={currentUser!.role}
                        />
                    ))}
                </div>
            )}

            {isModalOpen && currentUser && (
                <PDIFormModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSave={handleSavePDI}
                    isLoading={isSavingPDI}
                    editingPDI={editingPDI}
                    currentUser={currentUser}
                    allUsers={allUsers}
                />
            )}
        </div>
    );
}
