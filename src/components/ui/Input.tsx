'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  requiredIndicator?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftElement,
      rightElement,
      requiredIndicator,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {label}
            {requiredIndicator && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftElement && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              {leftElement}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full py-2.5 px-3.5 text-xs sm:text-sm min-h-[44px] bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 font-medium transition-colors',
              'focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 focus:bg-white',
              'disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed',
              leftElement && 'pl-10',
              rightElement && 'pr-10',
              error && 'border-rose-500 focus:ring-rose-500/15 focus:border-rose-600',
              className
            )}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 flex items-center text-slate-400">
              {rightElement}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-[11px] text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
