// src/lib/auth.ts
'use client';

import React, { useState, createContext, useContext, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, AuthContextType, AuthResponseData } from './types';
import { loginUser as loginUserApi } from './apiService'; // Importa a função de login da API

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // Estado de carregamento inicial
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Tenta carregar o token e usuário do localStorage ao iniciar a aplicação
        const storedToken = localStorage.getItem('authToken');
        const storedUserString = localStorage.getItem('authUser');

        if (storedToken && storedUserString) {
            try {
                const storedUser = JSON.parse(storedUserString) as User;
                setToken(storedToken);
                setUser(storedUser);
            } catch (error) {
                console.error("Erro ao parsear usuário do localStorage:", error);
                // Limpa o localStorage se os dados estiverem corrompidos
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
            }
        }
        setLoading(false); // Finaliza o carregamento inicial
    }, []);

    useEffect(() => {
        // Lógica de redirecionamento baseada no estado de autenticação e na rota atual
        if (!loading) { // Só executa após o carregamento inicial
            const isAuthPage = pathname === '/login'; // Adicione outras rotas de autenticação se houver (ex: /registrar)
            
            if (!user && !isAuthPage) {
                // Se não está logado e não está numa página de autenticação, redireciona para login
                router.replace('/login');
            } else if (user && isAuthPage) {
                // Se está logado e está numa página de autenticação, redireciona para o dashboard
                router.replace('/dashboard');
            }
        }
    }, [user, loading, pathname, router]);

    const login = async (credentials: { email: string, senha: string }) => {
        try {
            const response = await loginUserApi(credentials); // Chama a função da API
            const { token: tokenData, ...userDataFromApi } = response.data;

            // Mapeia a resposta da API para o tipo User do frontend, se necessário
            const loggedInUser: User = {
                id: userDataFromApi.id,
                nome: userDataFromApi.nome,
                email: userDataFromApi.email,
                role: userDataFromApi.role,
                // cargo e area podem ser incluídos se o backend retornar
            };

            setUser(loggedInUser);
            setToken(tokenData);
            localStorage.setItem('authToken', tokenData);
            localStorage.setItem('authUser', JSON.stringify(loggedInUser));
            router.push('/dashboard'); // Redireciona para o painel principal
        } catch (error) {
            console.error("Falha no login (AuthContext):", error);
            throw error; // Re-lança o erro para ser tratado no componente de login (ex: exibir mensagem)
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        router.push('/login'); // Redireciona para a tela de login
    };
    
    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
