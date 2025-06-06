// src/app/(autenticado)/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { dashboardService } from '@/lib/apiService';
import type { AdminDashboardData } from '@/lib/types';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Importe os ícones para os cards
import { Users, ClipboardList, Target, CheckSquare, AlertTriangle } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.roles.some(role => role.name === 'ROLE_ADMIN');

  useEffect(() => {
    if (token && isAdmin) {
      const fetchData = async () => {
        try {
          const response = await dashboardService.getAdminDashboard();
          setData(response);
        } catch (error) {
          console.error("Falha ao carregar dados do painel.", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setLoading(false);
    }
  }, [token, isAdmin]);

  if (loading) {
    return <LoadingScreen message="Carregando painel..." />;
  }

  // Se não for admin, mostra um painel diferente (ou nada)
  if (!isAdmin) {
    return <div>Bem-vindo(a), {user?.nome}!</div>;
  }
  
  // Se for admin mas os dados não carregaram
  if (!data) {
    return <div>Não foi possível carregar os dados do painel do administrador.</div>;
  }
  
  // Transforma os dados para o formato que os gráficos esperam
  const pdisPorStatusChartData = Object.entries(data.pdisPorStatus || {}).map(([name, value]) => ({ name, value }));
  const usuariosPorPerfilChartData = Object.entries(data.usuariosPorPerfil || {}).map(([name, value]) => ({ name: name.replace('ROLE_', ''), value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Painel de Administração</h1>
        <p className="text-slate-500">Aqui está um resumo da sua plataforma PROGRESS.</p>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Usuários Ativos" value={data.totalUsuarios} icon={Users} />
        <DashboardCard title="PDIs Totais" value={data.totalPDIs} icon={ClipboardList} />
        <DashboardCard title="PDIs Ativos" value={data.pdisAtivos} icon={Target} />
        <DashboardCard title="PDIs Concluídos" value={data.pdisConcluidos} icon={CheckSquare} />
        <DashboardCard title="PDIs Atrasados" value={data.pdisAtrasados} icon={AlertTriangle} />
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h3 className="font-semibold">Usuários por Perfil</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={usuariosPorPerfilChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {usuariosPorPerfilChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h3 className="font-semibold">PDIs por Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pdisPorStatusChartData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} />
              <YAxis stroke="#888888" fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}