import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant = 'success' | 'warning' | 'info' | 'purple' | 'danger' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: ReactNode;
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  success: {
    container: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    dot: 'bg-emerald-400',
  },
  warning: {
    container: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    dot: 'bg-amber-400',
  },
  info: {
    container: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
    dot: 'bg-sky-400',
  },
  purple: {
    container: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    dot: 'bg-indigo-400',
  },
  danger: {
    container: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    dot: 'bg-rose-400',
  },
  neutral: {
    container: 'bg-white/5 text-slate-400 border-white/10',
    dot: 'bg-slate-400',
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px] font-semibold',
  md: 'px-2.5 py-1 text-xs font-semibold',
};

export const Badge = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon,
  className = '',
  children,
  ...props
}: BadgeProps) => {
  const styles = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border uppercase tracking-wider backdrop-blur-sm select-none ${
        styles.container
      } ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot} animate-pulse`} />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
