// src/app/(auth)/login/page.tsx
'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth'; // Ajuste o caminho
import { LogIn, Settings, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    // Se já autenticado e o AuthProvider ainda não redirecionou, força o redirecionamento
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [authLoading, isAuthenticated, router]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login({ email, senha });
            // O redirecionamento para /dashboard é feito dentro da função login do AuthContext
        } catch (err: any) {
            setError(err.message || 'Falha no login. Verifique suas credenciais.');
            console.error("Login error (LoginPage):", err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleTestLogin = (testEmail: string, testPass: string) => {
        setEmail(testEmail);
        setSenha(testPass);
    };

    // Não renderiza o formulário se o auth estiver carregando ou se já estiver autenticado (esperando redirecionamento)
    if (authLoading || (!authLoading && isAuthenticated)) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 p-4 selection:bg-blue-500 selection:text-white">
            <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md transform transition-all hover:scale-[1.02] duration-300">
                <div className="text-center mb-8">
                    <Settings className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-[spin_4s_linear_infinite]" />
                    <h1 className="text-4xl font-bold text-gray-800">PROGRESS</h1>
                    <p className="text-gray-500 mt-1">Painel Administrativo</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email-login" className="block text-sm font-medium text-gray-700 mb-1">
                            Endereço de e-mail
                        </label>
                        <input
                            id="email-login"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="senha-login" className="block text-sm font-medium text-gray-700 mb-1">
                            Senha
                        </label>
                        <input
                            id="senha-login"
                            name="senha"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                            placeholder="Sua senha"
                        />
                    </div>
                    {error && (
                        <div className="flex items-start p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                           <p className="text-sm">{error}</p>
                        </div>
                    )}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-300"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-r-2 border-white"></div>
                            ) : (
                                <>
                                <LogIn className="h-5 w-5 mr-2" /> Entrar
                                </>
                            )}
                        </button>
                    </div>
                </form>
                 <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">Contas de teste (clique para preencher):</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                        <button onClick={() => handleTestLogin('admin@email.com', 'admin123')} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded-md shadow-sm transition-colors">Admin</button>
                        <button onClick={() => handleTestLogin('gestor@progress.com', 'gestor123')} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded-md shadow-sm transition-colors">Gestor</button>
                        <button onClick={() => handleTestLogin('colab@progress.com', 'colab123')} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded-md shadow-sm transition-colors">Colab</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
