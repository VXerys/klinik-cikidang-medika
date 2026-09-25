'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  requiredIndicator?: boolean;
  options?: SelectOption[] | readonly string[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      requiredIndicator,
      options,
      children,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {label}
            {requiredIndicator && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}

        <select
          id={selectId}
          ref={ref}
          className={cn(
            'w-full py-2.5 px-3.5 text-xs sm:text-sm min-h-[44px] bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium transition-colors',
            'focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 focus:bg-white',
            'disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed',
            error && 'border-rose-500 focus:ring-rose-500/15 focus:border-rose-600',
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => {
                if (typeof opt === 'string') {
                  return (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  );
                }
                return (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                );
              })
            : children}
        </select>

        {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
