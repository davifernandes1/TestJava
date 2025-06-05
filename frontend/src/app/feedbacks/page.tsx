// src/app/(dashboard)/feedbacks/page.tsx
'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { fetchFeedbacksApi, createFeedbackApi, fetchUsersApi } from '@/lib/apiService';
import { Feedback, User, CreateFeedbackFormData, UserRole } from '@/lib/types';
import { MessageSquare, PlusCircle, Send, UserCircle as UserIcon, AlertTriangle, Filter, CalendarDays, Edit3, Trash2 } from 'lucide-react';
import { format } from 'date-fns'; // Para formatar datas
import { ptBR } from 'date-fns/locale'; // Para formato brasileiro

// --- Componente FeedbackFormModal (Modal para Novo Feedback) ---
interface FeedbackFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: CreateFeedbackFormData) => Promise<void>;
    isLoading: boolean;
    currentUser: User | null;
    allUsers: User[]; // Para selecionar o destinatário
}

function FeedbackFormModal({ isOpen, onClose, onSave, isLoading, currentUser, allUsers }: FeedbackFormModalProps) {
    const initialFormData: CreateFeedbackFormData = {
        destinatarioId: 0,
        feedbackTextual: '',
        habilidadesUtilizadas: '',
        dificuldadesEncontradas: '',
        interessesAprendizado: '',
    };
    const [formData, setFormData] = useState<CreateFeedbackFormData>(initialFormData);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormData); // Reseta o formulário ao abrir
            setFormError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'destinatarioId' ? parseInt(value, 10) : value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError('');
        if (formData.destinatarioId === 0) {
            setFormError("Por favor, selecione um destinatário.");
            return;
        }
        if (!formData.feedbackTextual.trim()) {
            setFormError("O campo de feedback textual é obrigatório.");
            return;
        }
        // O autorId será adicionado no serviço ou aqui, baseado no currentUser
        const dataToSave: CreateFeedbackFormData = {
            ...formData,
            autorId: currentUser?.id, // Adiciona o ID do autor (usuário logado)
        };
        await onSave(dataToSave);
    };
    
    // Filtra usuários para não permitir feedback para si mesmo, a menos que seja admin (para testes)
    const destinatarioOptions = allUsers.filter(u => u.id !== currentUser?.id || currentUser?.role === 'ADMIN');


    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg animate-fadeInUp">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-slate-800">Novo Feedback</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="destinatarioId" className="block text-sm font-medium text-slate-700">Para (Destinatário) *</label>
                        <select name="destinatarioId" id="destinatarioId" value={formData.destinatarioId} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option value={0} disabled>Selecione um colaborador</option>
                            {destinatarioOptions.map(u => (
                                <option key={u.id} value={u.id}>{u.nome} ({u.email})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="feedbackTextual" className="block text-sm font-medium text-slate-700">Feedback Textual *</label>
                        <textarea name="feedbackTextual" id="feedbackTextual" value={formData.feedbackTextual} onChange={handleChange} rows={4} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Descreva o feedback..."></textarea>
                    </div>
                    <div>
                        <label htmlFor="habilidadesUtilizadas" className="block text-sm font-medium text-slate-700">Habilidades Utilizadas</label>
                        <input type="text" name="habilidadesUtilizadas" id="habilidadesUtilizadas" value={formData.habilidadesUtilizadas} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="dificuldadesEncontradas" className="block text-sm font-medium text-slate-700">Dificuldades Encontradas</label>
                        <input type="text" name="dificuldadesEncontradas" id="dificuldadesEncontradas" value={formData.dificuldadesEncontradas} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="interessesAprendizado" className="block text-sm font-medium text-slate-700">Interesses de Aprendizado</label>
                        <input type="text" name="interessesAprendizado" id="interessesAprendizado" value={formData.interessesAprendizado} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    {formError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md border border-red-200">{formError}</p>}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md shadow-sm">Cancelar</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border rounded-md shadow-sm flex items-center disabled:bg-blue-400">
                            {isLoading ? 'Enviando...' : <><Send size={16} className="mr-2" /> Enviar Feedback</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- Componente FeedbackCard ---
interface FeedbackCardProps {
    feedback: Feedback;
    // onDelete?: (feedbackId: number) => void; // Adicionar se admin/gestor puder excluir
    // onEdit?: (feedback: Feedback) => void; // Adicionar se admin/gestor puder editar
}

function FeedbackCard({ feedback }: FeedbackCardProps) {
    return (
        <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs text-slate-500">
                        De: <span className="font-medium text-slate-700">{feedback.autorNome || `ID ${feedback.autorId}`}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                        Para: <span className="font-medium text-slate-700">{feedback.destinatarioNome || `ID ${feedback.destinatarioId}`}</span>
                    </p>
                </div>
                <span className="text-xs text-slate-500 flex items-center">
                    <CalendarDays size={14} className="mr-1 text-slate-400"/>
                    {format(new Date(feedback.dataEnvio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed selection:bg-blue-100">{feedback.feedbackTextual}</p>
            
            {/* Detalhes da Análise da IA (se houver) */}
            {(feedback.sentimentoAnalisado || feedback.categoriaDificuldadeAnalisada || feedback.metaSugeridaIA || feedback.cursoRecomendadoIA) && (
                <div className="mt-3 pt-3 border-t border-slate-200 space-y-1 text-xs text-slate-600">
                    <p className="font-semibold text-slate-700">Análise IA:</p>
                    {feedback.sentimentoAnalisado && <p><strong>Sentimento:</strong> {feedback.sentimentoAnalisado}</p>}
                    {feedback.categoriaDificuldadeAnalisada && <p><strong>Categoria:</strong> {feedback.categoriaDificuldadeAnalisada}</p>}
                    {feedback.metaSugeridaIA && <p><strong>Meta Sugerida:</strong> {feedback.metaSugeridaIA}</p>}
                    {feedback.cursoRecomendadoIA && <p><strong>Curso Recomendado:</strong> {feedback.cursoRecomendadoIA}</p>}
                    {feedback.mentorIndicadoIA && <p><strong>Mentor Indicado:</strong> {feedback.mentorIndicadoIA}</p>}
                </div>
            )}
            {/* Adicionar botões de Ação para Admin/Gestor se necessário */}
        </div>
    );
}


// --- Página Principal de Feedbacks ---
export default function FeedbacksPage() {
    const { user: currentUser } = useAuth();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]); // Para o select do modal
    const [isLoading, setIsLoading] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSavingFeedback, setIsSavingFeedback] = useState(false);

    const fetchPageData = useCallback(async () => {
        if (!currentUser) return;
        setIsLoading(true);
        setPageError(null);
        try {
            let feedbackData: Feedback[] = [];
            if (currentUser.role === 'ADMIN') {
                feedbackData = (await fetchFeedbacksApi()).data; // Admin vê todos
            } else if (currentUser.role === 'GESTOR') {
                // Gestor vê feedbacks que ele deu OU que são para seus liderados (requer lógica no backend)
                // Por ora, vamos mockar buscando todos e filtrando no front, ou buscar os que ele deu.
                // Para simplificar, vamos buscar todos se for gestor, mas o ideal é endpoint específico.
                // feedbackData = (await fetchFeedbacksApi({ autorId: currentUser.id })).data; // Exemplo
                feedbackData = (await fetchFeedbacksApi()).data; // Temporário: Gestor vê todos
            } else if (currentUser.role === 'COLABORADOR') {
                feedbackData = (await fetchFeedbacksApi({ destinatarioId: currentUser.id })).data; // Colaborador vê os seus
            }
            setFeedbacks(feedbackData);

            // Busca todos os usuários para o select do modal (apenas se for criar feedback)
            if (currentUser.role === 'ADMIN' || currentUser.role === 'GESTOR') {
                 const usersResponse = await fetchUsersApi();
                 setAllUsers(usersResponse.data);
            } else {
                // Colaborador pode dar feedback para si mesmo (auto-feedback) ou para gestor (precisa de lógica)
                // Por ora, se colaborador, o modal não será tão útil sem uma lista de destinatários permitidos.
                // Poderia buscar apenas o próprio gestor.
                setAllUsers([currentUser]); // Exemplo: só pode dar feedback para si mesmo
            }

        } catch (err: any) {
            setPageError(err.message || 'Falha ao carregar dados da página.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

    const handleSaveFeedback = async (formData: CreateFeedbackFormData) => {
        setIsSavingFeedback(true);
        setPageError(null);
        try {
            await createFeedbackApi(formData);
            setIsModalOpen(false);
            fetchPageData(); // Recarrega os feedbacks
        } catch (err: any) {
            console.error("Erro ao salvar feedback (página):", err);
            setPageError(err.message || 'Falha ao enviar feedback.');
            throw err; // Permite que o modal trate o erro também
        } finally {
            setIsSavingFeedback(false);
        }
    };
    
    const canCreateFeedback = currentUser?.role === 'ADMIN' || currentUser?.role === 'GESTOR' || currentUser?.role === 'COLABORADOR'; // Colaborador pode dar auto-feedback ou para gestor

    return (
        <div className="space-y-6 animate-fadeInUp">
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-semibold text-slate-700 flex items-center">
                        <MessageSquare className="mr-3 text-blue-600" size={28}/> 
                        {currentUser?.role === 'COLABORADOR' ? 'Meus Feedbacks Recebidos' : 'Gerenciamento de Feedbacks'}
                    </h2>
                    {canCreateFeedback && (
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                            <PlusCircle size={20} className="mr-2" /> Novo Feedback
                        </button>
                    )}
                </div>
                {/* Adicionar filtros aqui se necessário (Data, Gestor, Colaborador) */}
            </div>

            {isLoading && (
                <div className="flex justify-center items-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div><p className="ml-4 text-slate-600">Carregando feedbacks...</p></div>
            )}
            {pageError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert"><p className="font-bold">Erro</p><p>{pageError}</p></div>
            )}

            {!isLoading && !pageError && feedbacks.length === 0 && (
                <div className="bg-white p-10 rounded-xl shadow-lg text-center text-slate-500">
                    <MessageSquare size={48} className="mx-auto mb-4 text-slate-400" />
                    <p>Nenhum feedback encontrado.</p>
                </div>
            )}

            {!isLoading && !pageError && feedbacks.length > 0 && (
                <div className="space-y-4">
                    {feedbacks.map(fb => (
                        <FeedbackCard key={fb.id} feedback={fb} />
                    ))}
                </div>
            )}

            {isModalOpen && currentUser && (
                <FeedbackFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveFeedback}
                    isLoading={isSavingFeedback}
                    currentUser={currentUser}
                    allUsers={allUsers}
                />
            )}
        </div>
    );
}
