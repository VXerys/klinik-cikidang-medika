'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  className,
  maxWidth = '2xl',
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const maxWidthMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 print:p-0 print:bg-white print:static"
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full bg-white rounded-3xl shadow-dialog border border-slate-200/90 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh] min-h-0 animate-in zoom-in-95 duration-150 print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none',
          maxWidthMap[maxWidth],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Clean Modern Header per component-showcase.html) */}
        {(title || icon) && (
          <div className="shrink-0 px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-3 min-w-0 mr-2">
              {icon && <div className="shrink-0">{icon}</div>}
              <div className="min-w-0">
                {title && (
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate">
                    {title}
                  </h2>
                )}
                {description && (
                  <div className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                    {description}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal"
              className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center font-bold text-sm transition-colors shrink-0 tactile-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Wrapper */}
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
