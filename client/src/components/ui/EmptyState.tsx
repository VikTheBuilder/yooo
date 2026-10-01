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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] p-12 text-center max-w-md mx-auto flex flex-col items-center justify-center ${className}`}
    >
      {icon ? (
        <div className="w-16 h-16 bg-[#FFE600] border-[3px] border-black flex items-center justify-center mb-4 text-black shadow-[3px_3px_0_0_#000]">
          {icon}
        </div>
      ) : (
        <span className="text-5xl mb-4 block">🔍</span>
      )}

      <h3 className="text-black font-black text-lg mb-1.5 uppercase tracking-tight">{title}</h3>
      <p className="text-black/60 text-sm leading-relaxed mb-6 max-w-xs font-medium normal-case tracking-normal">{description}</p>

      {action && <div className="mt-1">{action}</div>}
    </motion.div>
  );
};
