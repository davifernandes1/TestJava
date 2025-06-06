// src/components/layout/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import type { NavItemConfig } from '@/lib/types';
import { LayoutDashboard, Users, ClipboardList, MessageSquare, LogOut, UserCog } from 'lucide-react';

const NAV_ITEMS: NavItemConfig[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ROLE_ADMIN', 'ROLE_MANAGER'] },
    { href: '/usuarios', label: 'Usuários', icon: Users, roles: ['ROLE_ADMIN'] },
    { href: '/pdis', label: 'PDIs', icon: ClipboardList, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_COLLABORATOR'] },
    { href: '/feedbacks', label: 'Feedbacks', icon: MessageSquare, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_COLLABORATOR'] },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // ### CORREÇÃO 1 APLICADA AQUI ###
  // Agora 'userRoleName' é diretamente a string (ex: "ROLE_ADMIN")
  const accessibleNavItems = NAV_ITEMS.filter(item => 
    user?.roles.some(userRoleName => item.roles.includes(userRoleName as any)) // O 'as any' aqui é aceitável para a verificação
  );

  return (
    <aside className="hidden w-64 flex-col bg-slate-900 text-slate-200 lg:flex">
      <div className="flex h-16 items-center justify-center border-b border-slate-800">
        <UserCog className="h-8 w-8 text-blue-500" />
        <span className="ml-3 text-2xl font-bold tracking-wider text-white">PROGRESS</span>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {accessibleNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center rounded-lg px-4 py-2.5 font-medium transition-colors ${
                isActive ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 font-bold text-white">
            {user?.nome.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold text-white">{user?.nome}</p>
            {/* ### CORREÇÃO 2 APLICADA AQUI ### */}
            <p className="text-xs text-slate-400">
              {user?.roles && user.roles.length > 0
                // Agora chamamos o .replace() diretamente na string do papel
                ? user.roles[0].replace('ROLE_', '')
                : 'Sem papel definido'}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-4 flex w-full items-center rounded-lg px-4 py-2.5 text-left font-medium text-slate-300 transition-colors hover:bg-red-600 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}