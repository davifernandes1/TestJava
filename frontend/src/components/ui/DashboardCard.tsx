// src/components/ui/DashboardCard.tsx
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}

export function DashboardCard({ title, value, icon: Icon, description }: DashboardCardProps) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
    </div>
  );
}