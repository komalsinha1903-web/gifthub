import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'warning' | 'success' | 'info' | 'default';
  className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantStyles = {
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    default: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}