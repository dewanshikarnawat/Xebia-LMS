import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantClasses = {
  primary: 'bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white border border-transparent shadow-sm hover:shadow-md',
  secondary: 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-gray-850 dark:text-gray-150 border border-gray-200 dark:border-slate-700 shadow-sm',
  brand: 'bg-[#4A1F4F] hover:bg-[#3a183e] active:bg-[#2b122e] text-white border border-transparent shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#4A1F4F]',
  outline: 'bg-transparent border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50',
  ghost: 'bg-transparent border border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-slate-800',
  danger: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 border border-transparent',
  success: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/30 border border-transparent',
  warning: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/30 border border-transparent',
};

const sizeClasses = {
  sm: 'px-3.5 h-8 text-xs font-semibold rounded-lg gap-1.5',
  md: 'px-[20px] h-10 text-sm font-semibold rounded-xl gap-2',
  lg: 'px-6 h-11 text-base font-semibold rounded-xl gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer select-none
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin shrink-0" size={size === 'sm' ? 14 : 16} />
      ) : (
        iconPosition === 'left' && icon && (
          <span className="shrink-0 flex items-center justify-center">
            {icon}
          </span>
        )
      )}
      {children}
      {!loading && iconPosition === 'right' && icon && (
        <span className="shrink-0 flex items-center justify-center">
          {icon}
        </span>
      )}
    </button>
  );
};
