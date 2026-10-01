import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      children,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-black text-black uppercase tracking-widest"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={`w-full appearance-none bg-white text-black text-sm px-4 py-2.5 pr-10 border-[3px] outline-none cursor-pointer shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-100 font-medium ${
              error ? 'border-[#FF6B9D]' : 'border-black'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white text-black py-1">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute right-3.5 text-black pointer-events-none flex items-center justify-center">
            <ChevronDown size={16} strokeWidth={3} />
          </div>
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

Select.displayName = 'Select';
