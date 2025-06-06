// Arquivo: src/components/ui/Button.tsx
import React from 'react';

// Definindo as props do botão
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  asChild?: boolean; // Para usar com <Slot /> do Radix UI, se desejar, mas não implementado aqui
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', isLoading = false, className, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary: "bg-blue-600 text-white hover:bg-blue-700/90 shadow-sm",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200/80 border border-slate-200",
      danger: "bg-red-600 text-white hover:bg-red-700/90 shadow-sm",
      outline: "border border-slate-300 hover:bg-slate-100 hover:text-slate-900",
      ghost: "hover:bg-slate-100 hover:text-slate-900",
      link: "text-blue-600 underline-offset-4 hover:underline",
    };

    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-11 px-8 text-base",
      icon: "h-10 w-10",
    };

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-r-2 border-current mr-2"></div>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };