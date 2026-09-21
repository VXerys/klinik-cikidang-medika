'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl group-[.toaster]:text-xs group-[.toaster]:font-medium',
          description: 'group-[.toast]:text-slate-500',
          actionButton:
            'group-[.toast]:bg-blue-600 group-[.toast]:text-white group-[.toast]:font-semibold',
          cancelButton:
            'group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500',
          success:
            'group-[.toaster]:text-emerald-950 group-[.toaster]:border-emerald-200 group-[.toaster]:bg-emerald-50',
          error:
            'group-[.toaster]:text-rose-950 group-[.toaster]:border-rose-200 group-[.toaster]:bg-rose-50',
          warning:
            'group-[.toaster]:text-amber-950 group-[.toaster]:border-amber-200 group-[.toaster]:bg-amber-50',
          info:
            'group-[.toaster]:text-blue-950 group-[.toaster]:border-blue-200 group-[.toaster]:bg-blue-50',
        },
      }}
      {...props}
    />
  );
}
