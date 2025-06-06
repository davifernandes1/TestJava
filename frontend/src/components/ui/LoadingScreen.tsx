// src/components/ui/LoadingScreen.tsx

import { Loader2 } from 'lucide-react'; // Ícone de loading que você já deve ter

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen = ({ message = "Carregando..." }: LoadingScreenProps) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
  </div>
);