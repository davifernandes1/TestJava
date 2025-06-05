// src/app/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth'; // Certifique-se que este caminho está correto
import { UserRole, SummaryCardItem, Feedback, PDI, User } from '@/lib/types'; // Adicionado Feedback, PDI, User para recentFeedbacks e stats
import {
    fetchUsersApi,
    fetchFeedbacksApi,
    fetchPDIsApi
} from '@/lib/apiService'; // Certifique-se que este caminho está correto
import {
    Users, Briefcase, FileText, CheckCircle, AlertCircle, MessageSquare, LayoutDashboard, TrendingUp, BarChart3
} from 'lucide-react';
import { format } from 'date-fns'; // Importado para formatar datas de feedbacks recentes
import { ptBR } from 'date-fns/locale'; // Importado para formato brasileiro

// Componente de Card de Resumo
interface CardProps extends Omit<SummaryCardItem, 'roles' | 'icon'> {
  icon: React.ElementType;
  isLoading?: boolean;
}

const SummaryCard = ({ title, value, icon: Icon, color, isLoading }: CardProps) => (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                {isLoading ? (
                    <div className="mt-1 h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                )}
            </div>
            <div className={`p-3 bg-gray-100 rounded-full ${color}`}>
                {isLoading ? <div className="h-7 w-7 bg-gray-300 rounded-full animate-pulse"></div> : <Icon size={28} strokeWidth={1.5} />}
            </div>
        </div>
    </div>
);

export default function DashboardHomePage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeCollaborators: 0,
        activeManagers: 0,
        activePDIs: 0,
        completedPDIs: 0,
        pendingPDIs: 0,
        receivedFeedbacks: 0, // Para colaborador
        // teamFeedbacks: 0,     // Para gestor (se for implementar)
    });
    const [recentFeedbacks, setRecentFeedbacks] = useState<Feedback[]>([]); // Tipado corretamente
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user) return;
            setIsLoadingStats(true);
            try {
                let totalUsers = 0;
                let activeCollaborators = 0;
                let activeManagers = 0;
                let activePDIs = 0;
                let completedPDIs = 0;
                let pendingPDIs = 0;
                let receivedFeedbacksCount = 0;
                let fetchedRecentFeedbacks: Feedback[] = [];

                if (user.role === 'ADMIN') {
                    const usersData = (await fetchUsersApi()).data;
                    totalUsers = usersData.length;
                    activeCollaborators = usersData.filter(u => u.role === 'COLABORADOR' && u.status !== 'Inativo').length;
                    activeManagers = usersData.filter(u => u.role === 'GESTOR' && u.status !== 'Inativo').length;
                } else if (user.role === 'GESTOR') {
                    const usersData = (await fetchUsersApi()).data; // Mock: gestor vê todos por enquanto
                    activeCollaborators = usersData.filter(u => u.role === 'COLABORADOR' && u.status !== 'Inativo').length;
                }

                const pdisData = (await fetchPDIsApi(user.role === 'COLABORADOR' ? { colaboradorId: user.id } : {})).data;
                activePDIs = pdisData.filter(p => p.status === 'EM_ANDAMENTO').length;
                completedPDIs = pdisData.filter(p => p.status === 'CONCLUIDO').length;
                pendingPDIs = pdisData.filter(p => p.status === 'PLANEJADO' || p.status === 'ATRASADO').length;
                
                if (user.role === 'COLABORADOR') {
                    const feedbacksData = (await fetchFeedbacksApi({ destinatarioId: user.id })).data;
                    receivedFeedbacksCount = feedbacksData.length;
                    fetchedRecentFeedbacks = feedbacksData.sort((a,b) => new Date(b.dataEnvio).getTime() - new Date(a.dataEnvio).getTime()).slice(0, 3);
                } else if (user.role === 'ADMIN' || user.role === 'GESTOR') {
                    // Admin/Gestor podem ver todos os feedbacks recentes ou de suas equipes
                    const feedbacksData = (await fetchFeedbacksApi()).data; // Exemplo: Admin/Gestor veem todos
                    fetchedRecentFeedbacks = feedbacksData.sort((a,b) => new Date(b.dataEnvio).getTime() - new Date(a.dataEnvio).getTime()).slice(0, 3);
                }
                setRecentFeedbacks(fetchedRecentFeedbacks);

                setStats({
                    totalUsers,
                    activeCollaborators,
                    activeManagers,
                    activePDIs,
                    completedPDIs,
                    pendingPDIs,
                    receivedFeedbacks: receivedFeedbacksCount,
                });

            } catch (error) {
                console.error("Erro ao carregar dados do dashboard:", error);
            } finally {
                setIsLoadingStats(false);
            }
        };
        loadDashboardData();
    }, [user]);

    const summaryCardsConfig: SummaryCardItem[] = [
        { title: 'Total de Usuários', value: stats.totalUsers, icon: Users, color: 'text-blue-600', roles: ['ADMIN'] },
        { title: 'Colaboradores Ativos', value: stats.activeCollaborators, icon: Users, color: 'text-green-600', roles: ['ADMIN', 'GESTOR'] },
        { title: 'Gestores Ativos', value: stats.activeManagers, icon: Briefcase, color: 'text-purple-600', roles: ['ADMIN'] },
        { title: 'Meus PDIs Ativos', value: stats.activePDIs, icon: FileText, color: 'text-yellow-500', roles: ['COLABORADOR'] },
        { title: 'PDIs Ativos (Equipe/Todos)', value: stats.activePDIs, icon: FileText, color: 'text-yellow-500', roles: ['ADMIN', 'GESTOR'] },
        { title: 'PDIs Concluídos', value: stats.completedPDIs, icon: CheckCircle, color: 'text-teal-500', roles: ['ADMIN', 'GESTOR', 'COLABORADOR'] },
        { title: 'PDIs Pendentes', value: stats.pendingPDIs, icon: AlertCircle, color: 'text-red-600', roles: ['ADMIN', 'GESTOR', 'COLABORADOR'] },
        { title: 'Meus Feedbacks Recebidos', value: stats.receivedFeedbacks, icon: MessageSquare, color: 'text-indigo-500', roles: ['COLABORADOR'] },
    ];
    
    const filteredCards = summaryCardsConfig.filter(card => {
        if (!user) return false;
        // Só mostra o card se o papel do usuário estiver incluído E (se não estiver carregando OU o valor for maior que 0)
        // Isso evita mostrar cards com valor 0 para papéis que não deveriam ter essa métrica zerada por padrão.
        return card.roles.includes(user.role) && (isLoadingStats || card.value > 0 || (card.title === 'Total de Usuários' && user.role === 'ADMIN'));
    });


    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-3xl font-semibold text-slate-800 mb-2">
                    Bem-vindo(a) de volta, <span className="text-blue-600">{user?.nome?.split(' ')[0]}</span>!
                </h2>
                <p className="text-slate-600">Aqui está um resumo da sua plataforma PROGRESS.</p>
            </div>

            {filteredCards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCards.map(card => (
                        <SummaryCard 
                            key={card.title} 
                            title={card.title} 
                            value={card.value} 
                            icon={card.icon} 
                            color={card.color}
                            isLoading={isLoadingStats}
                        />
                    ))}
                </div>
            ) : !isLoadingStats && (
                 <div className="bg-white p-8 rounded-xl shadow-lg text-center text-slate-500">
                    <LayoutDashboard size={52} className="mx-auto mb-4 text-slate-400" />
                    <p className="text-xl">Nenhuma informação de resumo disponível para seu perfil.</p>
                 </div>
            )}
             {isLoadingStats && filteredCards.length === 0 && ( // Mostra loading se não há cards para exibir ainda
                 <div className="bg-white p-8 rounded-xl shadow-lg text-center text-slate-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg">Carregando estatísticas...</p>
                </div>
            )}

            {(user?.role === 'ADMIN' || user?.role === 'GESTOR') && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg min-h-[320px] flex flex-col">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                            <BarChart3 size={20} className="mr-2 text-blue-500"/> Usuários por Departamento
                        </h3>
                        <div className="flex-grow flex items-center justify-center text-slate-400 bg-slate-50 rounded-md p-4">
                            <p>[Gráfico de Usuários por Departamento - Implementar com Recharts ou Chart.js]</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg min-h-[320px] flex flex-col">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                            <TrendingUp size={20} className="mr-2 text-green-500"/> PDIs por Status
                        </h3>
                        <div className="flex-grow flex items-center justify-center text-slate-400 bg-slate-50 rounded-md p-4">
                            <p>[Gráfico de PDIs por Status - Implementar com Recharts ou Chart.js]</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Feedbacks Recentes</h3>
                {isLoadingStats && <p className="text-slate-500">Carregando feedbacks...</p>}
                {!isLoadingStats && recentFeedbacks.length === 0 && (
                    <p className="text-slate-500">Nenhum feedback recente para exibir.</p>
                )}
                {!isLoadingStats && recentFeedbacks.length > 0 && (
                    <ul className="space-y-3">
                        {recentFeedbacks.map((fb) => (
                            <li key={fb.id} className="p-3 bg-slate-50 rounded-md border border-slate-200 hover:shadow-sm transition-shadow">
                                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                                    <span>De: <span className="font-medium text-slate-700">{fb.autorNome || `ID ${fb.autorId}`}</span></span>
                                    <span>Para: <span className="font-medium text-slate-700">{fb.destinatarioNome || `ID ${fb.destinatarioId}`}</span></span>
                                </div>
                                <p className="text-sm text-slate-800 leading-relaxed line-clamp-2" title={fb.feedbackTextual}>{fb.feedbackTextual}</p>
                                <p className="text-xs text-slate-400 mt-2 text-right">{format(new Date(fb.dataEnvio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
