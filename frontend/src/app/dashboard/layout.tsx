// src/app/dashboard/layout.tsx
'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth'; // Certifique-se que este caminho está correto
import Sidebar from '@/app/components/layout/Sidebar';
import { NavItemConfig } from '@/lib/types'; // Importando para getPageTitle

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // O AuthProvider já tem uma lógica de redirecionamento.
    // Este useEffect é um reforço, mas pode ser redundante se o AuthProvider for robusto.
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [loading, isAuthenticated, router]);

    // Tela de carregamento enquanto o AuthProvider verifica o estado de autenticação.
    if (loading || !isAuthenticated) { // Verifica !isAuthenticated também para evitar flash de conteúdo
        return (
            <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                <p className="ml-4 text-xl font-semibold">Verificando autenticação...</p>
            </div>
        );
    }
    
    // Definição dos itens de navegação para buscar o título (deve ser consistente com Sidebar.tsx)
    const navItemsForTitle: NavItemConfig[] = [
        { name: 'Painel Principal', href: '/dashboard', icon: () => null, roles: ['ADMIN', 'GESTOR', 'COLABORADOR'] },
        { name: 'Gerenciamento de Usuários', href: '/dashboard/usuarios', icon: () => null, roles: ['ADMIN'] },
        { name: 'Feedbacks', href: '/dashboard/feedbacks', icon: () => null, roles: ['ADMIN', 'GESTOR', 'COLABORADOR'] },
        { name: 'Novo Feedback', href: '/dashboard/feedbacks/novo', icon: () => null, roles: ['ADMIN', 'GESTOR', 'COLABORADOR'] },
        { name: 'Gerenciamento de PDIs', href: '/dashboard/pdis', icon: () => null, roles: ['ADMIN', 'GESTOR', 'COLABORADOR'] },
        { name: 'Meu Perfil', href: '/dashboard/perfil', icon: () => null, roles: ['ADMIN', 'GESTOR', 'COLABORADOR'] },
    ];

    const getPageTitle = (): string => {
        const currentNavItem = navItemsForTitle.find(item => pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard'));
        
        if (currentNavItem) {
            return currentNavItem.name;
        }
        // Lógica para rotas dinâmicas, como PDI específico
        if (pathname.startsWith('/dashboard/pdis/') && pathname.split('/').length > 3) {
            return 'Detalhes do PDI'; // Poderia buscar o título do PDI específico aqui
        }
        return 'PROGRESS Dashboard'; // Título padrão
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden"> {/* Evita scroll duplo na página inteira */}
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden"> {/* Container principal com overflow hidden */}
                {/* Header da Área de Conteúdo */}
                <header className="bg-white shadow-sm p-4 border-b border-slate-200 sticky top-0 z-30 print:hidden">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-slate-700">
                            {getPageTitle()}
                        </h2>
                        <div className="text-sm text-slate-600">
                           {user?.email && (<span className="font-medium text-slate-800">{user.role}:</span>)} {user?.email}
                        </div>
                    </div>
                </header>

                {/* Área de Conteúdo Principal com Scroll */}
                <main className="flex-1 p-6 overflow-y-auto bg-slate-50"> {/* Apenas esta main terá scroll */}
                    {children}
                </main>
            </div>
        </div>
    );
}
