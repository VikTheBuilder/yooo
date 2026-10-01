import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-black text-black uppercase tracking-widest"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-black/50 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`w-full bg-white text-black placeholder:text-black/40 text-sm px-4 py-2.5 border-[3px] outline-none shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-100 ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${
              error
                ? 'border-[#FF6B9D]'
                : 'border-black'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 text-black/50 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs font-bold text-[#FF6B9D] mt-0.5 uppercase tracking-wide">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-black/60 mt-0.5 font-medium">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
