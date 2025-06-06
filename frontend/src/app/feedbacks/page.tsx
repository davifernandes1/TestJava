// src/app/(autenticado)/feedbacks/page.tsx
'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { feedbackService, userService } from '@/lib/apiService'; // Importa o serviço correto
import { useAuth } from '@/lib/auth';
import type { Feedback, CreateFeedbackFormData, Usuario } from '@/lib/types'; // Importa os tipos corretos
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Button } from '@/components/ui/Button'; // Supondo que você tenha

// Componente do Modal de Feedback (para manter a organização)
interface FeedbackFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: CreateFeedbackFormData) => Promise<void>;
  isLoading: boolean;
  allUsers: Usuario[]; // Lista de usuários para o dropdown
}

function FeedbackFormModal({ isOpen, onClose, onSave, isLoading, allUsers }: FeedbackFormModalProps) {
  const initialFormData: CreateFeedbackFormData = {
    destinatarioId: '',
    feedbackTexto: '', // Corrigido de 'feedbackTextual'
    tipo: 'Positivo', // Valor padrão
  };
  const [formData, setFormData] = useState<CreateFeedbackFormData>(initialFormData);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setFormData(initialFormData); // Limpa o formulário após salvar
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Novo Feedback</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label>Destinatário</label>
            <select
              value={formData.destinatarioId}
              onChange={(e) => setFormData({ ...formData, destinatarioId: Number(e.target.value) })}
              className="w-full mt-1 p-2 border rounded"
              required
            >
              <option value="">Selecione um usuário</option>
              {allUsers.map(user => (
                <option key={user.id} value={user.id}>{user.nome}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label>Feedback</label>
            <textarea
              value={formData.feedbackTexto}
              onChange={(e) => setFormData({ ...formData, feedbackTexto: e.target.value })}
              className="w-full mt-1 p-2 border rounded"
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" onClick={onClose} variant="outline">Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Feedback"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


// Componente Principal da Página de Feedbacks
export default function FeedbacksPage() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [allUsers, setAllUsers] = useState<Usuario[]>([]); // Para o modal
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

const fetchAllData = useCallback(async () => {
    if (!user?.id) return; // Garante que temos um ID de usuário

    try {
      setLoading(true);
      
      const receivedFeedbacks = await feedbackService.getAll({ destinatarioId: user.id });
      setFeedbacks(receivedFeedbacks);
      
      // --- CORREÇÃO AQUI ---
      // Descomente as duas linhas abaixo para buscar os usuários
      const allUsersResponse = await userService.getAll();
      setAllUsers(allUsersResponse);
      // ---------------------

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  const handleSaveFeedback = async (formData: CreateFeedbackFormData) => {
    try {
        setIsSaving(true);
        await feedbackService.create(formData);
        setIsModalOpen(false); // Fecha o modal
        fetchAllData(); // Recarrega a lista de feedbacks
    } catch(error) {
        console.error("Erro ao salvar feedback:", error);
        alert("Falha ao salvar o feedback.");
    } finally {
        setIsSaving(false);
    }
  }

  if (loading) return <LoadingScreen message="Carregando feedbacks..." />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meus Feedbacks</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          Dar Novo Feedback
        </Button>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        {feedbacks.length > 0 ? (
          feedbacks.map(fb => (
            <div key={fb.id} className="border-b pb-2">
              <p className="font-semibold">De: {fb.autorNome}</p>
              <p className="text-gray-700 my-1">{fb.feedbackTexto}</p>
              <p className="text-xs text-gray-500">{new Date(fb.dataEnvio).toLocaleDateString('pt-BR')}</p>
            </div>
          ))
        ) : (
          <p>Você ainda não recebeu nenhum feedback.</p>
        )}
      </div>

      <FeedbackFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFeedback}
        isLoading={isSaving}
        allUsers={allUsers}
      />
    </div>
  );
}