import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'bpjs' | 'umum' | 'lunas' | 'pending' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    bpjs: 'bg-teal-50 text-teal-800 border-teal-200',
    umum: 'bg-blue-50 text-blue-800 border-blue-200',
    lunas: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    outline: 'bg-transparent text-slate-600 border-slate-300',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 rounded-md font-semibold border',
    md: 'text-xs px-2.5 py-1 rounded-lg font-semibold border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 shrink-0 select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
