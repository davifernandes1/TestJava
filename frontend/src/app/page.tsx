// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth'; // Ajuste o caminho para sua pasta lib

export default function InitialPage() {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // A lógica de redirecionamento agora está principalmente no AuthProvider.
        // Esta página pode servir como um fallback ou um local para um spinner de carregamento global
        // se o AuthProvider ainda não tiver redirecionado.
        if (!loading) {
            if (isAuthenticated) {
                router.replace('/dashboard');
            } else {
                router.replace('/login');
            }
        }
    }, [isAuthenticated, loading, router]);

    // Exibe um spinner de carregamento enquanto o AuthProvider determina o estado
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mb-6"></div>
            <p className="text-xl font-semibold tracking-wider">Carregando PROGRESS...</p>
            <p className="text-sm text-slate-400 mt-2">Plataforma Inteligente de Desenvolvimento Profissional</p>
        </div>
    );
}
