// src/app/(autenticado)/usuarios/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { userService } from '@/lib/apiService'; // Importa o serviço correto
import type { Usuario } from '@/lib/types';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Button } from '@/components/ui/Button'; // Supondo que você tenha

// --- Componente da Tabela de Usuários (pode ficar no mesmo arquivo ou ser movido) ---
interface UserTableProps {
  users: Usuario[];
  onEdit: (user: Usuario) => void;
  onDelete: (id: number) => void;
}

const UserTable = ({ users, onEdit, onDelete }: UserTableProps) => (
  <div className="bg-white shadow-md rounded-lg overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {users.map((user) => (
          <tr key={user.id}>
            <td className="px-6 py-4 whitespace-nowrap">{user.nome}</td>
            <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'ATIVO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {user.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button onClick={() => onEdit(user)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
              <button onClick={() => onDelete(user.id)} className="text-red-600 hover:text-red-900">Excluir</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);


// --- Componente Principal da Página ---
export default function UsuariosPage() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await userService.getAll();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleDelete = async (userId: number) => {
      if(window.confirm("Tem certeza que deseja excluir este usuário?")) {
          try {
              await userService.delete(userId);
              // Atualiza a lista após a exclusão
              fetchUsers(); 
          } catch(error) {
              console.error("Erro ao deletar usuário", error);
              alert("Falha ao excluir usuário.");
          }
      }
  }

  if (loading) return <LoadingScreen message="Carregando usuários..." />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
        <Button onClick={() => alert("Abrir modal de criação")}>
          Adicionar Usuário
        </Button>
      </div>
      
      {users.length > 0 ? (
          <UserTable users={users} onEdit={(user) => alert(`Editando ${user.nome}`)} onDelete={handleDelete} />
      ) : (
          <p>Nenhum usuário encontrado.</p>
      )}
    </div>
  );
}