// src/components/layout/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth'; // Garanta que este caminho está correto: src/lib/auth.tsx
import { UserRole, NavItemConfig } from '@/lib/types'; // Garanta que este caminho está correto: src/lib/types.ts
import {
    LayoutDashboard, Users, MessageSquare, FileText, Settings, LogOut, UserCircle, ChevronDown
} from 'lucide-react';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

    const navItems: NavItemConfig[] = [
        { name: 'Painel Principal', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'GESTOR', 'COLABORADOR'] },
        { name: 'Usuários', href: '/dashboard/usuarios', icon: Users, roles: ['ADMIN'] },
        { name: 'Feedbacks', href: '/dashboard/feedbacks', icon: MessageSquare, roles: ['ADMIN', 'GESTOR', 'COLABORADOR'] },
        { name: 'PDIs', href: '/dashboard/pdis', icon: FileText, roles: ['ADMIN', 'GESTOR', 'COLABORADOR'] },
        // { name: 'Meu Perfil', href: '/dashboard/perfil', icon: UserCircle, roles: ['ADMIN', 'GESTOR', 'COLABORADOR'] },
    ];

    // Correção: Apenas filtra se 'user' existir e tiver a propriedade 'role'
    const filteredNavItems = user && user.role ? navItems.filter(item => item.roles.includes(user.role)) : [];

    return (
        <aside className="w-64 bg-slate-800 text-slate-100 flex flex-col p-4 shadow-lg print:hidden">
            {/* Logo */}
            <div className="flex items-center justify-center mb-8 pt-3 pb-4 border-b border-slate-700">
                <Settings className="h-10 w-10 text-blue-400 mr-2 animate-[spin_6s_linear_infinite]" />
                <h1 className="text-3xl font-bold tracking-tight text-white">PROGRESS</h1>
            </div>

            {/* Navegação Principal */}
            <nav className="flex-grow">
                <ul className="space-y-2">
                    {filteredNavItems.map((item) => (
                        <li key={item.name}>
                            <Link
                                href={item.href}
                                className={`flex items-center py-2.5 px-4 rounded-lg hover:bg-slate-700/70 hover:text-white transition-all duration-200 ease-in-out group
                                    ${pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard')
                                        ? 'bg-blue-600 text-white font-semibold shadow-md'
                                        : 'text-slate-300 hover:text-slate-100'
                                }`}
                            >
                                <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform ${pathname.startsWith(item.href) ? 'text-white' : 'text-slate-400 group-hover:text-blue-300'}`} />
                                <span className="truncate">{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Informações do Usuário e Logout */}
            <div className="mt-auto border-t border-slate-700 pt-4">
                 <div 
                    className="p-3 mb-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-colors"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="relative w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-3 ring-2 ring-slate-600 group-hover:ring-blue-400 transition-all">
                                {user?.nome?.charAt(0).toUpperCase() || <UserCircle size={20}/>}
                                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-slate-700/50"></span>
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-white truncate max-w-[120px]" title={user?.nome}>{user?.nome}</p>
                                <p className="text-xs text-slate-400">{user?.role}</p>
                            </div>
                        </div>
                        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>
                
                {isUserMenuOpen && (
                    <div className="mb-2 py-1 bg-slate-700 rounded-md shadow-lg animate-fadeIn"> {/* Adicionada animação simples */}
                        <Link 
                            href="/dashboard/perfil" 
                            className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-600/80 transition-colors rounded-md"
                            onClick={() => setIsUserMenuOpen(false)} // Fecha o menu ao clicar
                        >
                            Meu Perfil
                        </Link>
                        {/* Adicionar mais itens de menu se necessário */}
                    </div>
                )}

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors duration-200 group"
                >
                    <LogOut className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                    Sair
                </button>
            </div>
        </aside>
    );
}
