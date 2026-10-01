import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant = 'success' | 'warning' | 'info' | 'purple' | 'danger' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: ReactNode;
}

const variantStyles: Record<BadgeVariant, { container: string }> = {
  success:  { container: 'bg-[#00D26A] text-black border-black' },
  warning:  { container: 'bg-[#FFE600] text-black border-black' },
  info:     { container: 'bg-[#4D7CFF] text-black border-black' },
  purple:   { container: 'bg-[#B79CFF] text-black border-black' },
  danger:   { container: 'bg-[#FF6B9D] text-black border-black' },
  neutral:  { container: 'bg-white text-black border-black' },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[9px]',
  md: 'px-2 py-0.5 text-[10px]',
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
      className={`inline-flex items-center gap-1 border-[2px] font-black uppercase tracking-widest select-none font-mono ${
        styles.container
      } ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
