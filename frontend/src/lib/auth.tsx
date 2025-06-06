// src/lib/auth.tsx
'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from './apiService'; // Corrigido para importar authService
import type { Usuario } from './types';

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null); // Corrigido o '=='
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem('authToken');
      const storedUser = sessionStorage.getItem('authUser');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Falha ao carregar autenticação da sessão", error);
    } finally {
      setLoading(false);
    }
  }, []);


  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email: email, senha: password });

      console.log("Resposta recebida do backend:", response);

      // ### LÓGICA CORRIGIDA ###
      // Verificamos as propriedades "planas" que recebemos
      if (response && response.token && response.email) {
        
        // Criamos o objeto 'usuario' a partir da resposta plana
        const usuarioParaSalvar: Usuario = {
            id: response.id,
            nome: response.nome,
            email: response.email,
            roles: response.roles,
            // Adicione outros campos de Usuario que possam faltar, com valores padrão
            status: 'ATIVO', // Exemplo, já que não vem na resposta de login
        };

        // Salvamos os dados e redirecionamos
        setUser(usuarioParaSalvar);
        setToken(response.token);
        sessionStorage.setItem('authUser', JSON.stringify(usuarioParaSalvar));
        sessionStorage.setItem('authToken', response.token);
        
        router.push('/dashboard'); // Agora vai redirecionar!

      } else {
        console.error("A resposta do backend é inválida.", response);
        throw new Error("Resposta de autenticação inválida recebida do servidor.");
      }
    } catch (error) {
      console.error("Auth.tsx - Falha no serviço de login:", error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('authUser');
    sessionStorage.removeItem('authToken');
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
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