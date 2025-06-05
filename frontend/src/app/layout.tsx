// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Seus estilos globais Tailwind e outros
import { AuthProvider } from '@/lib/auth'; // Ajuste o caminho para sua pasta lib

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'PROGRESS - Desenvolvimento Profissional',
  description: 'Plataforma Inteligente de Desenvolvimento Profissional',
  // Adicionar ícone do site (favicon)
  icons: {
    icon: '/favicon.ico', // Crie um arquivo favicon.ico na pasta public/
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans bg-gray-100 text-gray-900 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
