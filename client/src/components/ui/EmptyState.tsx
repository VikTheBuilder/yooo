import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`glass p-12 text-center rounded-2xl max-w-md mx-auto flex flex-col items-center justify-center border border-white/10 ${className}`}
    >
      {icon ? (
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4 text-3xl shadow-lg shadow-indigo-500/10">
          {icon}
        </div>
      ) : (
        <span className="text-5xl mb-4 block">🔍</span>
      )}

      <h3 className="text-white font-bold text-lg mb-1.5 tracking-tight">{title}</h3>
      <p className="text-slate-400 text-xs leading-relaxed mb-6 max-w-xs">{description}</p>

      {action && <div className="mt-1">{action}</div>}
    </motion.div>
  );
};
