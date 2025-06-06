'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { LoadingScreen } from '@/components/ui/LoadingScreen'; // Supondo que você tenha este componente

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/dashboard'); // Se logado, vai para o dashboard
      } else {
        router.replace('/login'); // Se não, vai para o login
      }
    }
  }, [user, loading, router]);

  return <LoadingScreen message="Carregando..." />;
}